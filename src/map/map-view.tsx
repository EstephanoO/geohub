// @ts-nocheck

"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import MapUploader from "./map-uploader";
import LayerList, { LayerInfo } from "./layers/layer-list";
import { accessToken } from "../constants";
import EditLayerModal from "./layers";

mapboxgl.accessToken = accessToken;

export default function MapView() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [layers, setLayers] = useState<LayerInfo[]>([]);
  const [editing, setEditing] = useState<LayerInfo | null>(null);

  const sourceId = (id: string) => `src-${id}`;
  const fillId = (id: string) => `fill-${id}`;

  /* ============================================================
   *  buildFillColor (ahora con categorías texto y boolean/rules)
   * ============================================================ */
  const buildFillColor = (layer: LayerInfo) => {
    const safeStr = (v: any, fallback: string) =>
      typeof v === "string" && v.trim() !== "" ? v : fallback;

    // start expression with case
    const expression: any[] = ["case"];

    try {
      // 1) boolean styles (true/false)
      const enabledBool = Object.entries(layer.booleanStyles || {}).filter(
        ([, cfg]: any) => cfg && cfg.enabled
      );

      for (const [key, cfg] of enabledBool as [string, any][]) {
        expression.push(["==", ["get", key], true], safeStr(cfg.trueColor, layer.color));
        expression.push(["==", ["get", key], false], safeStr(cfg.falseColor, layer.color));
      }
    } catch (e) {
      // fail-safe
    }

    // 2) text categories (field equals value -> color)
    try {
      if (layer.textCategories && layer.textCategories.field && layer.textCategories.values) {
        const { field, values } = layer.textCategories;
        for (const [val, color] of Object.entries(values || {})) {
          // exact string match
          expression.push(["==", ["get", field], val], safeStr(color, layer.color));
        }
      }
    } catch (e) {
      // fail-safe
    }

    // 3) numeric conditional rules (fieldA op fieldB)
    const validOps = ["==", "!=", ">", ">=", "<", "<="];
    if (Array.isArray(layer.rules)) {
      for (const rule of layer.rules) {
        if (!rule) continue;
        const { fieldA, op, fieldB, color } = rule as any;
        if (!fieldA || !op || !fieldB) continue;
        if (!validOps.includes(op)) continue;
        expression.push([op, ["to-number", ["get", fieldA]], ["to-number", ["get", fieldB]]], safeStr(color, layer.color));
      }
    }

    // fallback color
    expression.push(safeStr(layer.color, "#cccccc"));

    // if nothing meaningful added, return null
    // minimal valid case expression length is > 2; require at least one condition -> expression length >= 4
    if (expression.length < 4) return null;

    return expression;
  };

  /* ============================================================
   *  Inicializar Mapa
   * ============================================================ */
  useEffect(() => {
    if (!mapRef.current) return;

    map.current = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-77.03, -12.05],
      zoom: 13,
    });

    return () => map.current?.remove();
  }, []);

  /* ============================================================
   *  Render dinámico de capas + popups + líneas (strokes)
   * ============================================================ */
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;

    // Primero limpiar capas viejas y listeners para evitar duplicados
    layers.forEach((layer) => {
      const sid = sourceId(layer.id);
      const lid = fillId(layer.id);
      try {
        if (m.getLayer(`${lid}-line`)) m.removeLayer(`${lid}-line`);
        if (m.getLayer(lid)) m.removeLayer(lid);
        if (m.getSource(sid)) m.removeSource(sid);
      } catch (e) {
        // ignore
      }
      // remove listeners explicitly (safe even if not attached)
      try {
        m.off("mousemove", lid as any, () => { });
        m.off("mouseleave", lid as any, () => { });
      } catch { }
    });

    // Luego agregar capas actuales
    layers.forEach((layer) => {
      if (!layer.visible) return;

      const sid = sourceId(layer.id);
      const lid = fillId(layer.id);

      // add source if not exists
      if (!m.getSource(sid)) {
        try {
          m.addSource(sid, { type: "geojson", data: layer.data });
        } catch (e) { }
      } else {
        // actualizar datos si ya existiera
        const src = m.getSource(sid) as mapboxgl.GeoJSONSource | undefined;
        try { src && src.setData(layer.data); } catch { }
      }

      const expr = buildFillColor(layer);
      const paint: any = { "fill-opacity": layer.fillOpacity ?? 0.45 };
      paint["fill-color"] = expr ?? layer.color ?? "#00bcd4";

      // add fill layer
      if (!m.getLayer(lid)) {
        try {
          m.addLayer({
            id: lid,
            type: "fill",
            source: sid,
            paint,
          });
        } catch (e) {
          // in case layer exists or mapbox error
        }
      } else {
        try {
          m.setPaintProperty(lid, "fill-color", paint["fill-color"]);
          m.setPaintProperty(lid, "fill-opacity", paint["fill-opacity"]);
        } catch { }
      }

      // add stroke/line layer (for borders)
      const lineId = `${lid}-line`;
      const linePaint: any = {
        "line-color": layer.strokeColor ?? "#000000",
        "line-width": typeof layer.strokeWidth === "number" ? layer.strokeWidth : 1,
        "line-opacity": typeof layer.strokeOpacity === "number" ? layer.strokeOpacity : 1,
      };

      if (!m.getLayer(lineId)) {
        try {
          m.addLayer({
            id: lineId,
            type: "line",
            source: sid,
            paint: linePaint,
          });
        } catch (e) { }
      } else {
        try {
          m.setPaintProperty(lineId, "line-color", linePaint["line-color"]);
          m.setPaintProperty(lineId, "line-width", linePaint["line-width"]);
          m.setPaintProperty(lineId, "line-opacity", linePaint["line-opacity"]);
        } catch { }
      }

      // === POPUP GLOBAL por capa (un solo popup por capa) ===
      // Usamos closure para que hoveredPopup sea por capa y no se creen múltiples
      let hoveredPopup: mapboxgl.Popup | null = null;

      const handleMove = (e: any) => {
        // cambiar cursor
        m.getCanvas().style.cursor = "pointer";

        // remover popup previo de esta capa
        if (hoveredPopup) {
          hoveredPopup.remove();
          hoveredPopup = null;
        }

        const feature = e.features?.[0];
        const props = feature?.properties || {};

        const html = (layer.popupTemplate || "").replace(
          /\{(.*?)\}/g,
          (_, key) => props[key] ?? ""
        );

        hoveredPopup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 8,
        })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(m);
      };

      const handleLeave = () => {
        m.getCanvas().style.cursor = "";
        if (hoveredPopup) {
          hoveredPopup.remove();
          hoveredPopup = null;
        }
      };

      // Attach listeners: note we attach to the fill layer id
      m.on("mousemove", lid, handleMove);
      m.on("mouseleave", lid, handleLeave);
    });

    // cleanup function for effect (remove listeners of layers that might be removed next render)
    return () => {
      if (!map.current) return;
      const mm = map.current;
      layers.forEach((layer) => {
        const lid = fillId(layer.id);
        try {
          mm.off("mousemove", lid as any);
          mm.off("mouseleave", lid as any);
        } catch { }
      });
    };
  }, [layers]);

  /* ============================================================
   *  Fit GeoJSON
   * ============================================================ */
  const fitToGeoJSON = (geojson: any) => {
    if (!map.current) return;
    const m = map.current;
    const bounds = new mapboxgl.LngLatBounds();

    const add = (coords: any) => {
      if (!coords) return;
      if (typeof coords[0] === "number") bounds.extend(coords);
      else coords.forEach(add);
    };

    try {
      (geojson.features || []).forEach((f: any) => add(f.geometry.coordinates));
      if (!bounds.isEmpty()) m.fitBounds(bounds, { padding: 40, duration: 900 });
    } catch { }
  };

  /* ============================================================
   *  Load GeoJSON
   * ============================================================ */
  const handleLoad = (json: any) => {
    const id = typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2, 9);

    const props = json.features?.[0]?.properties ?? {};
    const keys = Object.keys(props);
    const bools = keys.filter((k) => typeof props[k] === "boolean");

    const newLayer: LayerInfo = {
      id,
      name: json.name || `Capa ${layers.length + 1}`,
      visible: true,

      color: "#00bcd4",
      fillOpacity: 0.45,

      data: json,
      fields: keys,

      /* =======================
         BOOLEANOS
      ======================= */
      booleanStyles: Object.fromEntries(
        bools.map((b) => [
          b,
          { enabled: false, trueColor: "#00ff00", falseColor: "#ff0000" },
        ])
      ),

      /* =======================
         REGLAS
      ======================= */
      rules: [],

      /* =======================
         STROKE
      ======================= */
      strokeColor: "#000000",
      strokeWidth: 1,
      strokeOpacity: 1,
      strokeRules: [],   // ✅ ESTA LÍNEA SOLUCIONA EL ERROR

      /* =======================
         CATEGORÍAS
      ======================= */
      textCategories: null,

      /* =======================
         POPUP
      ======================= */
      popupTemplate: `
    <div style="font-family: system-ui; font-size: 14px;">
      <h3 style="margin:0 0 6px; font-weight:600;">{name}</h3>
      <p>{description}</p>
    </div>
  `,
    };

    setLayers((p) => [...p, newLayer]);
    fitToGeoJSON(json);
  };

  /* ============================================================
   *  CRUD CAPAS
   * ============================================================ */
  const toggleVisibility = (id: string) =>
    setLayers((p) => p.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)));

  const deleteLayer = (id: string) => {
    if (!map.current) return;

    const m = map.current;
    const sid = sourceId(id);
    const lid = fillId(id);

    try {
      if (m.getLayer(`${lid}-line`)) m.removeLayer(`${lid}-line`);
      if (m.getLayer(lid)) m.removeLayer(lid);
      if (m.getSource(sid)) m.removeSource(sid);
    } catch (e) { }

    setLayers((p) => p.filter((l) => l.id !== id));
  };

  const saveLayerConfig = (id: string, cfg: Partial<LayerInfo>) =>
    setLayers((p) => p.map((l) => (l.id === id ? { ...l, ...cfg } : l)));

  const focusLayer = (layer: LayerInfo) => fitToGeoJSON(layer.data);

  /* ============================================================
   *  Legend data computed from layers -> textCategories
   * ============================================================ */
  const legendEntries = React.useMemo(() => {
    // array of { layerId, layerName, items: [{value, color}] }
    const entries: { layerId: string; layerName: string; items: { value: string; color: string }[] }[] = [];

    for (const l of layers) {
      if (!l.visible) continue;
      const tc = l.textCategories;
      if (tc && tc.field && tc.values) {
        const items = Object.entries(tc.values).map(([value, color]) => ({ value, color }));
        if (items.length) entries.push({ layerId: l.id, layerName: l.name, items });
      }
    }
    return entries;
  }, [layers]);

  /* ============================================================
   *  UI (Map + Legend + Controls)
   * ============================================================ */
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <MapUploader onLoad={handleLoad} />

      <LayerList
        layers={layers}
        onToggle={toggleVisibility}
        onDelete={deleteLayer}
        onEdit={setEditing}
        onFocus={focusLayer}
      />

      <EditLayerModal
        open={!!editing}
        layer={editing}
        onClose={() => setEditing(null)}
        onSave={saveLayerConfig}
      />

      {/* Legend flotante abajo a la derecha */}
      {legendEntries.length > 0 && (
        <div className="absolute right-4 bottom-4 z-40">
          <div className="bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-xl shadow-lg p-3 max-w-xs">
            <div className="text-sm font-semibold mb-2">Leyenda</div>
            <div className="space-y-3">
              {legendEntries.map((group) => (
                <div key={group.layerId} className="mb-2">
                  <div className="text-xs font-medium text-neutral-600">{group.layerName}</div>
                  <div className="mt-2 space-y-1">
                    {group.items.map((it) => (
                      <div key={it.value} className="flex items-center gap-2 text-sm">
                        <div style={{ width: 18, height: 12, background: it.color, borderRadius: 2, border: "1px solid rgba(0,0,0,0.06)" }} />
                        <div className="truncate">{it.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
