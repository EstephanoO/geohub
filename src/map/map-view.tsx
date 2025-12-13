
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl, {
  DataDrivenPropertyValueSpecification,
  ExpressionSpecification,
} from "mapbox-gl";
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
   *  BUILD FILL COLOR (boolean + text categories + numeric)
   * ============================================================ */
  const buildFillColor = (
    layer: LayerInfo
  ): DataDrivenPropertyValueSpecification<string> => {
    const expr: ExpressionSpecification = ["case"];

    /* ========= BOOLEAN ========= */
    for (const [field, cfg] of Object.entries(layer.booleanStyles)) {
      if (!cfg.enabled) continue;

      expr.push(
        ["==", ["get", field], true],
        cfg.trueColor,
        ["==", ["get", field], false],
        cfg.falseColor
      );
    }

    /* ========= TEXT CATEGORIES ========= */
    if (layer.textField) {
      for (const [value, color] of Object.entries(layer.categoryValues)) {
        expr.push(
          ["==", ["get", layer.textField], value],
          color
        );
      }
    }

    /* ========= NUMERIC RULES ========= */
    for (const r of layer.numericRules) {
      expr.push(
        [
          r.op,
          ["to-number", ["get", r.fieldA]],
          ["to-number", ["get", r.fieldB]],
        ],
        r.color
      );
    }

    // default
    expr.push(layer.color);

    // si solo hay color base, no usar expresión
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
      zoom: 13,
    });

    return () => map.current?.remove();
  }, []);

  /* ============================================================
   *  RENDER LAYERS
   * ============================================================ */
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;

    layers.forEach((layer) => {
      const sid = sourceId(layer.id);
      const lid = fillId(layer.id);

      if (!layer.visible) {
        if (m.getLayer(lid)) m.removeLayer(lid);
        if (m.getLayer(`${lid}-line`)) m.removeLayer(`${lid}-line`);
        if (m.getSource(sid)) m.removeSource(sid);
        return;
      }

      if (!m.getSource(sid)) {
        m.addSource(sid, { type: "geojson", data: layer.data });
      } else {
        (m.getSource(sid) as mapboxgl.GeoJSONSource).setData(layer.data);
      }

      const fillColor = buildFillColor(layer);

      if (!m.getLayer(lid)) {
        m.addLayer({
          id: lid,
          type: "fill",
          source: sid,
          paint: {
            "fill-color": fillColor,
            "fill-opacity": layer.fillOpacity,
          },
        });
      } else {
        m.setPaintProperty(lid, "fill-color", fillColor);
        m.setPaintProperty(lid, "fill-opacity", layer.fillOpacity);
      }

      const lineId = `${lid}-line`;

      if (!m.getLayer(lineId)) {
        m.addLayer({
          id: lineId,
          type: "line",
          source: sid,
          paint: {
            "line-color": layer.strokeColor,
            "line-width": layer.strokeWidth,
            "line-opacity": layer.strokeOpacity,
          },
        });
      }
    });
  }, [layers]);

  /* ============================================================
   *  LOAD GEOJSON
   * ============================================================ */
  const handleLoad = (json: GeoJSON.FeatureCollection) => {
    const props = json.features?.[0]?.properties ?? {};
    const fields = Object.keys(props);
    const bools = fields.filter((k) => typeof props[k] === "boolean");

    const newLayer: LayerInfo = {
      id: crypto.randomUUID(),
      name: `Capa ${layers.length + 1}`,
      visible: true,

      data: json,
      fields,

      color: "#00bcd4",
      fillOpacity: 0.45,

      textField: null,
      categoryValues: {},

      booleanStyles: Object.fromEntries(
        bools.map((b) => [
          b,
          { enabled: false, trueColor: "#00ff00", falseColor: "#ff0000" },
        ])
      ),

      numericRules: [],

      strokeColor: "#000",
      strokeWidth: 1,
      strokeOpacity: 1,
      strokeRules: [],

      popupTemplate: "<b>{name}</b>",
    };

    setLayers((p) => [...p, newLayer]);
  };

  /* ============================================================
   *  CRUD
   * ============================================================ */
  const saveLayerConfig = (id: string, cfg: Partial<LayerInfo>) =>
    setLayers((p) => p.map((l) => (l.id === id ? { ...l, ...cfg } : l)));

  /* ============================================================
   *  LEGEND
   * ============================================================ */
  const legendEntries = useMemo(() => {
    return layers
      .filter((l) => l.visible && l.textField)
      .map((l) => ({
        id: l.id,
        name: l.name,
        items: Object.entries(l.categoryValues).map(([v, c]) => ({
          value: v,
          color: c,
        })),
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
        onToggle={(id) =>
          setLayers((p) =>
            p.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
          )
        }
        onEdit={setEditing}
        onDelete={(id) => setLayers((p) => p.filter((l) => l.id !== id))}
        onFocus={() => { }}
      />

      <EditLayerModal
        open={!!editing}
        layer={editing}
        onClose={() => setEditing(null)}
        onSave={saveLayerConfig}
      />

      {legendEntries.length > 0 && (
        <div className="absolute right-4 bottom-4 bg-white p-3 rounded-xl shadow">
          {legendEntries.map((g) => (
            <div key={g.id}>
              <div className="font-semibold text-sm">{g.name}</div>
              {g.items.map((i) => (
                <div key={i.value} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-4 h-3 rounded"
                    style={{ background: i.color }}
                  />
                  {i.value}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
