
// @ts-nocheck
//
// MapView.tsx — FINAL (SIN LOCAL STORAGE)
// ---------------------------------------------
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import MapUploader from "./map-uploader";
import LayerList, { LayerInfo } from "./layers/layer-list";
import EditLayerModal from "./layers";
import { accessToken } from "../constants";

mapboxgl.accessToken = accessToken;

export default function MapView() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [layers, setLayers] = useState<LayerInfo[]>([]);
  const [editing, setEditing] = useState<LayerInfo | null>(null);

  const sourceId = (id: string) => `src-${id}`;
  const fillId = (id: string) => `fill-${id}`;

  /* ============================================================
   *  BUILD FILL COLOR (CATEGORÍAS + FALLBACK)
   * ============================================================ */
  const buildFillColor = (layer: LayerInfo) => {
    if (
      layer.textCategories &&
      layer.textCategories.field &&
      layer.textCategories.values &&
      Object.keys(layer.textCategories.values).length > 0
    ) {
      const expr: any[] = ["case"];
      const { field, values } = layer.textCategories;

      Object.entries(values).forEach(([value, color]) => {
        expr.push(["==", ["get", field], value], color);
      });

      expr.push(layer.color || "#cccccc");
      return expr;
    }

    return layer.color || "#cccccc";
  };

  /* ============================================================
   *  INIT MAP
   * ============================================================ */
  useEffect(() => {
    if (!mapRef.current) return;

    map.current = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-77.03, -12.05],
      zoom: 12,
    });

    return () => map.current?.remove();
  }, []);

  /* ============================================================
   *  RENDER & UPDATE LAYERS
   * ============================================================ */
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;

    layers.forEach((layer) => {
      const sid = sourceId(layer.id);
      const lid = fillId(layer.id);

      /* ---------- SOURCE ---------- */
      if (!m.getSource(sid)) {
        m.addSource(sid, {
          type: "geojson",
          data: layer.data,
        });
      } else {
        (m.getSource(sid) as mapboxgl.GeoJSONSource).setData(layer.data);
      }

      /* ---------- LAYERS ---------- */
      if (!m.getLayer(lid)) {
        m.addLayer({
          id: lid,
          type: "fill",
          source: sid,
          paint: {
            "fill-color": buildFillColor(layer),
            "fill-opacity": layer.fillOpacity ?? 0.45,
          },
        });

        m.addLayer({
          id: `${lid}-line`,
          type: "line",
          source: sid,
          paint: {
            "line-color": layer.strokeColor ?? "#000",
            "line-width": layer.strokeWidth ?? 1,
            "line-opacity": layer.strokeOpacity ?? 1,
          },
        });

        // POPUP (registrado una sola vez)
        let popup: mapboxgl.Popup | null = null;

        m.on("mousemove", lid, (e) => {
          m.getCanvas().style.cursor = "pointer";
          popup?.remove();

          const props = e.features?.[0]?.properties || {};
          const html = (layer.popupTemplate || "").replace(
            /\{(.*?)\}/g,
            (_, k) => props[k] ?? ""
          );

          popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 8,
          })
            .setLngLat(e.lngLat)
            .setHTML(html)
            .addTo(m);
        });

        m.on("mouseleave", lid, () => {
          m.getCanvas().style.cursor = "";
          popup?.remove();
          popup = null;
        });
      }

      /* ---------- UPDATE STYLES (🔥 CLAVE) ---------- */
      m.setPaintProperty(lid, "fill-color", buildFillColor(layer));
      m.setPaintProperty(
        lid,
        "fill-opacity",
        layer.fillOpacity ?? 0.45
      );

      m.setPaintProperty(
        `${lid}-line`,
        "line-color",
        layer.strokeColor ?? "#000"
      );
      m.setPaintProperty(
        `${lid}-line`,
        "line-width",
        layer.strokeWidth ?? 1
      );
      m.setPaintProperty(
        `${lid}-line`,
        "line-opacity",
        layer.strokeOpacity ?? 1
      );

      /* ---------- VISIBILITY ---------- */
      m.setLayoutProperty(
        lid,
        "visibility",
        layer.visible ? "visible" : "none"
      );
      m.setLayoutProperty(
        `${lid}-line`,
        "visibility",
        layer.visible ? "visible" : "none"
      );
    });
  }, [layers]);

  /* ============================================================
   *  FIT GEOJSON
   * ============================================================ */
  const fitToGeoJSON = (geojson: any) => {
    if (!map.current) return;
    const bounds = new mapboxgl.LngLatBounds();

    const extend = (c: any) =>
      typeof c[0] === "number" ? bounds.extend(c) : c.forEach(extend);

    geojson.features?.forEach((f: any) =>
      extend(f.geometry.coordinates)
    );

    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, { padding: 40, duration: 800 });
    }
  };

  /* ============================================================
   *  LOAD GEOJSON
   * ============================================================ */
  const handleLoad = (json: any) => {
    const id = crypto.randomUUID();

    const layer: LayerInfo = {
      id,
      name: json.name || `Capa ${layers.length + 1}`,
      visible: true,
      color: "#00bcd4",
      fillOpacity: 0.45,
      data: json,
      fields: Object.keys(json.features?.[0]?.properties ?? {}),
      booleanStyles: {},
      rules: [],
      strokeColor: "#000000",
      strokeWidth: 1,
      strokeOpacity: 1,
      strokeRules: [],
      textCategories: null,
      popupTemplate: `
        <div style="font-size:13px">
          <strong>{name}</strong>
        </div>
      `,
    };

    setLayers((prev) => [...prev, layer]);
    fitToGeoJSON(json);
  };

  /* ============================================================
   *  CRUD
   * ============================================================ */
  const saveLayerConfig = (id: string, cfg: Partial<LayerInfo>) =>
    setLayers((p) => p.map((l) => (l.id === id ? { ...l, ...cfg } : l)));

  const toggleVisibility = (id: string) =>
    setLayers((p) =>
      p.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );

  const deleteLayer = (id: string) =>
    setLayers((p) => p.filter((l) => l.id !== id));

  /* ============================================================
   *  LEYENDA
   * ============================================================ */
  const legendEntries = useMemo(() => {
    return layers
      .filter(
        (l) =>
          l.visible &&
          l.textCategories &&
          l.textCategories.values &&
          Object.keys(l.textCategories.values).length > 0
      )
      .map((l) => ({
        id: l.id,
        name: l.name,
        items: Object.entries(l.textCategories!.values).map(
          ([value, color]) => ({ value, color })
        ),
      }));
  }, [layers]);

  /* ============================================================
   *  UI
   * ============================================================ */
  return (
    <div className="w-full h-screen relative">
      <MapUploader onLoad={handleLoad} />

      <LayerList
        layers={layers}
        onToggle={toggleVisibility}
        onDelete={deleteLayer}
        onEdit={setEditing}
        onFocus={(l) => fitToGeoJSON(l.data)}
      />

      <EditLayerModal
        open={!!editing}
        layer={editing}
        onClose={() => setEditing(null)}
        onSave={saveLayerConfig}
      />

      {legendEntries.length > 0 && (
        <div className="absolute bottom-4 right-4 z-40 bg-white/95 border rounded-xl shadow-lg p-3 max-w-xs">
          <div className="text-sm font-semibold mb-2">Leyenda</div>
          <div className="space-y-3">
            {legendEntries.map((g) => (
              <div key={g.id}>
                <div className="text-xs font-medium text-neutral-600">
                  {g.name}
                </div>
                <div className="mt-1 space-y-1">
                  {g.items.map((i) => (
                    <div
                      key={i.value}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="w-4 h-3 rounded-sm border"
                        style={{ background: i.color }}
                      />
                      <span className="truncate">{i.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
