import maplibregl from "maplibre-gl";

export interface GeoJSON {
  type: "FeatureCollection" | "Feature" | "Point" | "LineString" | "Polygon" | "MultiPoint" | "MultiLineString" | "MultiPolygon";
  features?: any[];
  geometry?: any;
  properties?: any;
  coordinates?: any;
  crs?: any;
}

export function fitBoundsToGeoJSON(map: maplibregl.Map, geojson: GeoJSON) {
  const coords: [number, number][] = [];

  const extract = (g: any) => {
    switch (g.type) {
      case "Point":
        coords.push(g.coordinates);
        break;
      case "LineString":
      case "MultiPoint":
        g.coordinates.forEach((c: any) => {
          coords.push(c);
        });
        break;
      case "Polygon":
      case "MultiLineString":
        g.coordinates.flat().forEach((c: any) => {
          coords.push(c);
        });
        break;
      case "MultiPolygon":
        g.coordinates.flat(2).forEach((c: any) => {
          coords.push(c);
        });
        break;
    }
  };

  if (geojson.type === "FeatureCollection") {
    geojson.features?.forEach((f: any) => {
      if (f.geometry) {
        extract(f.geometry);
      }
    });
  } else if (geojson.type === "Feature" && geojson.geometry) {
    extract(geojson.geometry);
  } else {
    extract(geojson);
  }

  if (!coords.length) return;

  const bounds = new maplibregl.LngLatBounds();
  coords.forEach((c) => {
    bounds.extend(c);
  });

  map.fitBounds(bounds, { padding: 80, maxZoom: 18 });
}