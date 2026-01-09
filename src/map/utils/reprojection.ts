import proj4 from "proj4";
import { detectCRS } from "./crs";

export interface GeoJSON {
  type: "FeatureCollection" | "Feature" | "Point" | "LineString" | "Polygon" | "MultiPoint" | "MultiLineString" | "MultiPolygon";
  features?: any[];
  geometry?: any;
  properties?: any;
  coordinates?: any;
  crs?: any;
}

export function reprojectGeoJSON(geojson: GeoJSON): GeoJSON {
  try {
    const from = detectCRS(geojson);
    const to = "EPSG:4326";

    if (from === to) return geojson;

    console.log(`🔄 Reproyectando ${from} → ${to}`);

    try { 
      proj4(from);
    } catch {
      console.warn(`⚠️ CRS ${from} no soportado`);
      return geojson;
    }

    const clone = structuredClone(geojson);

    const transform = (coord: any): any => {
      if (typeof coord[0] === "number") {
        try {
          return proj4(from, to, coord);
        } catch {
          return coord;
        }
      }
      return coord.map((c: any) => transform(c));
    };

    const apply = (geom: any) => {
      geom.coordinates = transform(geom.coordinates);
    };

    if (clone.type === "FeatureCollection") {
      clone.features?.forEach((f: any) => {
        if (f.geometry) {
          apply(f.geometry);
        }
      });
    } else if (clone.type === "Feature") {
      apply(clone.geometry);
    } else {
      apply(clone);
    }

    return clone;
  } catch (err) {
    console.error("❌ Error reproyectando:", err);
    return geojson;
  }
}