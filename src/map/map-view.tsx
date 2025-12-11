
"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import MapUploader from "./map-uploader";
import LayerList, { LayerInfo } from "./layers/layer-list";
import EditLayerModal from "./layers/layer-edit-name-modal";
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
   *  buildFillColor
   * ============================================================ */
  const buildFillColor = (layer: LayerInfo) => {
    const safeStr = (v: any, fallback: string) =>
      typeof v === "string" && v.trim() !== "" ? v : fallback;

    const expression: any[] = ["case"];

    try {
      const enabledBool = Object.entries(layer.booleanStyles || {}).filter(
        ([, cfg]: any) => cfg && cfg.enabled
      );

      for (const [key, cfg] of enabledBool as [string, any][]) {
        expression.push(["==", ["get", key], true], safeStr(cfg.trueColor, layer.color));
        expression.push(["==", ["get", key], false], safeStr(cfg.falseColor, layer.color));
      }
    } catch { }

    const validOps = ["==", "!=", ">", ">=", "<", "<="];
    if (Array.isArray(layer.rules)) {
      for (const rule of layer.rules) {
        if (!rule) continue;
        const { fieldA, op, fieldB, color } = rule as any;
        if (!fieldA || !op || !fieldB) continue;
        if (!validOps.includes(op)) continue;

        expression.push([op, ["get", fieldA], ["get", fieldB]], safeStr(color, layer.color));
      }
    }

    expression.push(safeStr(layer.color, "#cccccc"));

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
   *  Render dinámico de capas + popups
   * ============================================================ */
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;

    // limpiar capas viejas
    layers.forEach((layer) => {
      const sid = sourceId(layer.id);
      const lid = fillId(layer.id);

      if (m.getLayer(lid)) m.removeLayer(lid);
      if (m.getSource(sid)) m.removeSource(sid);
      m.off("mousemove", lid);
      m.off("mouseleave", lid);
    });

    // agregar capas nuevas
    layers.forEach((layer) => {
      if (!layer.visible) return;

      const sid = sourceId(layer.id);
      const lid = fillId(layer.id);

      m.addSource(sid, { type: "geojson", data: layer.data });

      const expr = buildFillColor(layer);
      const paint: any = { "fill-opacity": 0.45 };
      paint["fill-color"] = expr ?? layer.color ?? "#00bcd4";

      m.addLayer({
        id: lid,
        type: "fill",
        source: sid,
        paint,
      });

      // === POPUP GLOBAL ===
      let hoveredPopup: mapboxgl.Popup | null = null;

      const handleMove = (e: any) => {
        m.getCanvas().style.cursor = "pointer";

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

      m.on("mousemove", lid, handleMove);
      m.on("mouseleave", lid, handleLeave);
    });
  }, [layers]);

  /* ============================================================
   *  Fit GeoJSON
   * ============================================================ */
  const fitToGeoJSON = (geojson: any) => {
    if (!map.current) return;
    const m = map.current;
    const bounds = new mapboxgl.LngLatBounds();

    const add = (coords: any) => {
      if (typeof coords[0] === "number") bounds.extend(coords);
      else coords.forEach(add);
    };

    try {
      geojson.features.forEach((f: any) => add(f.geometry.coordinates));
      if (!bounds.isEmpty()) m.fitBounds(bounds, { padding: 40, duration: 900 });
    } catch { }
  };

  /* ============================================================
   *  Load GeoJSON
   * ============================================================ */
  const handleLoad = (json: any) => {
    const id = crypto.randomUUID();

    const props = json.features?.[0]?.properties ?? {};
    const keys = Object.keys(props);
    const bools = keys.filter((k) => typeof props[k] === "boolean");

    const newLayer: LayerInfo = {
      id,
      name: json.name || `Capa ${layers.length + 1}`,
      visible: true,
      color: "#00bcd4",
      data: json,
      fields: keys,
      booleanStyles: Object.fromEntries(
        bools.map((b) => [
          b,
          { enabled: false, trueColor: "#00ff00", falseColor: "#ff0000" },
        ])
      ),
      rules: [],
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

    if (m.getLayer(lid)) m.removeLayer(lid);
    if (m.getSource(sid)) m.removeSource(sid);

    setLayers((p) => p.filter((l) => l.id !== id));
  };

  const saveLayerConfig = (id: string, cfg: Partial<LayerInfo>) =>
    setLayers((p) => p.map((l) => (l.id === id ? { ...l, ...cfg } : l)));

  const focusLayer = (layer: LayerInfo) => fitToGeoJSON(layer.data);

  /* ============================================================
   *  UI (CORRECTO)
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

      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
