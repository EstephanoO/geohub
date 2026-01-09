"use client";

import { useState, useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import { MapData, MapConfig } from "../types";
import { applyPopupStyles } from "../utils/popupStyles";

/* =========================
   MAP CONFIG
========================= */
const DEFAULT_CONFIG: MapConfig = {
  center: [-74.006, 40.7128],
  zoom: 3,
  pitch: 0,
  bearing: 0,
};

/* =========================
   DEFAULT STYLES
========================= */
function applyDefaultStyles(map: maplibregl.Map, sourceId: string) {
  map.addLayer({
    id: `${sourceId}-fill`,
    type: "fill",
    source: sourceId,
    filter: ["==", "$type", "Polygon"],
    paint: {
      "fill-color": "#2563eb",
      "fill-opacity": 0.45,
    },
  });

  map.addLayer({
    id: `${sourceId}-outline`,
    type: "line",
    source: sourceId,
    filter: ["any", ["==", "$type", "Polygon"], ["==", "$type", "LineString"]],
    paint: {
      "line-color": "#1e3a8a",
      "line-width": 2,
    },
  });

  map.addLayer({
    id: `${sourceId}-points`,
    type: "circle",
    source: sourceId,
    filter: ["==", "$type", "Point"],
    paint: {
      "circle-radius": 5,
      "circle-color": "#ef4444",
      "circle-stroke-color": "#7f1d1d",
      "circle-stroke-width": 2,
    },
  });
}

/* =========================
   QML STYLES
========================= */
function applyQMLStyles(map: maplibregl.Map, sourceId: string, styles: any) {
  try {
    const { QMLStyleParser } = require("../utils/qmlStyleParser");
    const parser = new QMLStyleParser();
    parser.applyStylesToMap(map, sourceId, styles);
  } catch (err) {
    console.error("❌ Error applying QML styles, fallback to default", err);
    applyDefaultStyles(map, sourceId);
  }
}

/* =========================
   MAP HOOK
========================= */
export function useMapLibre(
  containerRef: React.RefObject<HTMLDivElement>,
  geoJson?: any,
  qmlStyle?: any,
  popupTemplate: string = "moderno",
) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const sourceIdRef = useRef("geojson-source");

  /* ---------- MAP INIT ---------- */
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: "background",
            type: "background",
            paint: { "background-color": "#f1f5f9" },
          },
        ],
      },
      ...DEFAULT_CONFIG,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-left");

    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      closeOnMove: false,
      anchor: "bottom",
      offset: [0, -14],
      maxWidth: "480px",
      className: `map-popup popup-${popupTemplate}`,
    });

    // Aplicar estilos específicos del template
    applyPopupStyles(popupTemplate);

    mapRef.current = map;

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [containerRef, popupTemplate]);

  /* ---------- DATA & INTERACTION ---------- */
  useEffect(() => {
    if (!mapRef.current || !geoJson) return;

    const map = mapRef.current;
    const sourceId = sourceIdRef.current;

    /* Cleanup layers & source */
    const style = map.getStyle();
    style?.layers?.forEach((layer) => {
      if (layer.id.startsWith(sourceId) && map.getLayer(layer.id)) {
        map.removeLayer(layer.id);
      }
    });
    if (map.getSource(sourceId)) map.removeSource(sourceId);

    /* Add source */
    map.addSource(sourceId, {
      type: "geojson",
      data: geoJson,
    });

    qmlStyle
      ? applyQMLStyles(map, sourceId, qmlStyle)
      : applyDefaultStyles(map, sourceId);

    /* ---------- HOVER LAYER ---------- */
    const hoverLayerId = `${sourceId}-hover`;

    map.addLayer({
      id: hoverLayerId,
      type: "fill",
      source: sourceId,
      filter: ["==", "$type", "Polygon"],
      paint: {
        "fill-color": "#1d4ed8",
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          0.25,
          0,
        ],
      },
    });

    let hoveredId: string | number | null = null;

    /* ---------- POPUP BUILDER ---------- */
    const showPopup = (feature: any, lngLat: maplibregl.LngLat) => {
      if (!popupRef.current) return;

      const props = feature.properties || {};

      const row = (label: string, value: any) => {
        if (value === undefined || value === null || value === "") return "";
        return `
          <tr>
            <th>${label}</th>
            <td>${value}</td>
          </tr>
        `;
      };

      // Determinar título basado en datos disponibles
      const title = props.DISTRITO || props.DISTRICT || props.NOMBRE || props.name || "Información territorial";

      // Generar HTML dinámico solo con datos disponibles
      let contentRows = "";

      // Recorrer todas las propiedades y mostrarlas
      Object.entries(props).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Formatear nombre de la propiedad para mejor lectura
          let label = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
          
          // Traducciones comunes
          const translations: { [key: string]: string } = {
            "departamen": "Departamento",
            "departamento": "Departamento",
            "provincia": "Provincia", 
            "distrito": "Distrito",
            "macro": "Macro Región",
            "codigo": "Código",
            "id": "ID",
            "poblacion": "Población",
            "area": "Área",
            "densidad": "Densidad",
            "indice": "Índice"
          };
          
          label = translations[key.toLowerCase()] || label;
          contentRows += row(label, value);
        }
      });

      const html = `
        <div class="popup-card popup-${popupTemplate}">
          
          <!-- HEADER -->
          <div class="popup-header">
            <div class="popup-title">${title}</div>
            <div class="popup-subtitle">Datos disponibles</div>
          </div>

          <div class="popup-divider"></div>

          <!-- CONTENT DINÁMICO -->
          <div class="popup-section">
            <table class="popup-table">
              ${contentRows}
            </table>
          </div>

        </div>
      `;

      popupRef.current.setLngLat(lngLat).setHTML(html).addTo(map);
    };

    const hidePopup = () => popupRef.current?.remove();

    /* ---------- EVENTS ---------- */
    map.on("mousemove", hoverLayerId, (e) => {
      if (!e.features?.length) return;

      const feature = e.features[0];
      const id = feature.id ?? JSON.stringify(feature.properties);

      if (hoveredId !== null && hoveredId !== id) {
        map.setFeatureState(
          { source: sourceId, id: hoveredId },
          { hover: false },
        );
      }

      hoveredId = id;
      map.setFeatureState({ source: sourceId, id }, { hover: true });
      showPopup(feature, e.lngLat);
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", hoverLayerId, () => {
      if (hoveredId !== null) {
        map.setFeatureState(
          { source: sourceId, id: hoveredId },
          { hover: false },
        );
      }
      hoveredId = null;
      hidePopup();
      map.getCanvas().style.cursor = "";
    });

    /* ---------- FIT BOUNDS ---------- */
    const bounds = new maplibregl.LngLatBounds();
    geoJson.features?.forEach((f: any) => {
      const walk = (c: any) =>
        Array.isArray(c[0]) ? c.forEach(walk) : bounds.extend(c);
      walk(f.geometry.coordinates);
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 60 });
    }
  }, [geoJson, qmlStyle, popupTemplate]);

  return mapRef;
}

/* =========================
   MAP DATA HOOK
========================= */
export function useMapData(initialData?: Partial<MapData>) {
  const [mapData, setMapData] = useState<MapData>({
    id: "",
    name: "",
    description: "",
    tags: [],
    geoJson: undefined,
    qml: undefined,
    isVisible: true,
    createdDate: new Date().toISOString().split("T")[0],
    ...initialData,
  });

  const updateMapData = (updates: Partial<MapData>) =>
    setMapData((prev) => ({ ...prev, ...updates }));

  const resetMapData = () =>
    setMapData({
      id: "",
      name: "",
      description: "",
      tags: [],
      geoJson: undefined,
      qml: undefined,
      isVisible: true,
      createdDate: new Date().toISOString().split("T")[0],
    });

  return { mapData, setMapData, updateMapData, resetMapData };
}
