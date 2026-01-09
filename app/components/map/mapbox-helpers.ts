import type { GeoJSON } from 'geojson';

export function reprojectGeoJSON(geojson: GeoJSON): GeoJSON {
  return geojson;
}

export function validateGeoJSON(data: any): data is GeoJSON {
  return (
    data &&
    typeof data === 'object' &&
    (data.type === 'FeatureCollection' || data.type === 'Feature') &&
    data.type === 'FeatureCollection' ? Array.isArray(data.features) : true
  );
}