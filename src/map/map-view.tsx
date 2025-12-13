// @ts-nocheck
//
// MapView.tsx — FINAL
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

const STORAGE_KEY = "map_layers_v1";

export default function MapView() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [layers, setLayers] = useState<LayerInfo[]>([]);
  const [editing, setEditing] = useState<LayerInfo | null>(null);

  const sourceId = (id: string) => `src-${id}`;
  const fillId = (id: string) => `fill-${id}`;

  /* ============================================================
   *  LOCAL STORAGE
   * ============================================================ */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setLayers(JSON.parse(saved));
    } catch { }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layers));
    } catch { }
  }, [layers]);

  /* ============================================================
   *  BUILD FILL COLOR (categorías + fallback)
   * ============================================================ */
  const buildFillColor = (layer: LayerInfo) => {
    const expr: any[] = ["case"];

    // Categorías de texto
    if (
      layer.textCategories &&
      layer.textCategories.field &&
      layer.textCategories.values
    ) {
      const { field, values } = layer.textCategories;
      for (const [value, color] of Object.entries(values)) {
        expr.push(["==", ["get", field], value], color);
      }
    }

    expr.push(layer.color || "#cccccc");
    return expr.length > 2 ? expr : layer.color;
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
   *  RENDER LAYERS
   * ============================================================ */
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;

    // limpiar todo
    layers.forEach((l) => {
      const sid = sourceId(l.id);
      const lid = fillId(l.id);
      try {
        if (m.getLayer(`${lid}-line`)) m.removeLayer(`${lid}-line`);
        if (m.getLayer(lid)) m.removeLayer(lid);
        if (m.getSource(sid)) m.removeSource(sid);
      } catch { }
    });

    layers.forEach((layer) => {
      if (!layer.visible) return;

      const sid = sourceId(layer.id);
      const lid = fillId(layer.id);

      m.addSource(sid, {
        type: "geojson",
        data: layer.data,
      });

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

      // Popup hover (1 solo por capa)
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

    geojson.features?.forEach((f: any) => extend(f.geometry.coordinates));

    if (!bounds.isEmpty())
      map.current.fitBounds(bounds, { padding: 40, duration: 800 });
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

    setLayers((p) => [...p, layer]);
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
   *  LEYENDA (CLAVE)
   * ============================================================ */
  const legendEntries = useMemo(() => {
    return layers
      .filter(
        (l) =>
          l.visible &&
          l.textCategories &&
          l.textCategories.field &&
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

      {/* LEYENDA */}
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
