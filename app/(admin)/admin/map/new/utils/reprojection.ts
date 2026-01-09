import proj4 from "proj4";
import { detectCRS } from "./crs";

// Definir proyecciones comunes
proj4.defs([
  [
    "EPSG:4326",
    "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees",
  ],
  [
    "EPSG:3857",
    "+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs",
  ],
  [
    "EPSG:4269",
    "+title=NAD83 +proj=longlat +datum=NAD83 +units=degrees",
  ],
  [
    "EPSG:32633",
    "+title=WGS 84 / UTM zone 33N +proj=utm +zone=33 +datum=WGS84 +units=m +no_defs",
  ],
  [
    "EPSG:25830",
    "+title=ETRS89 / UTM zone 30N +proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  ],
]);

export function reprojectGeoJSON(geojson: any): any {
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
      clone.features.forEach((f: any) => {
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