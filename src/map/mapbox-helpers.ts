
// src/map/mapbox-helpers.ts
import proj4 from 'proj4';

export function detectCRS(geojson: any): string {
  const crsName =
    geojson?.crs?.properties?.name ||
    geojson?.crs?.name ||
    '';

  if (!crsName) return 'EPSG:4326';

  if (crsName.includes('EPSG')) {
    const match = crsName.match(/EPSG[:]*[:]*([0-9]+)/);
    if (match) return `EPSG:${match[1]}`;
  }

  return 'EPSG:4326';
}

export function reprojectGeoJSON(geojson: any): any {
  const from = detectCRS(geojson);
  const to = 'EPSG:4326';

  if (from === to) return geojson;

  console.log(`🔄 Reproyectando ${from} → ${to}`);
  const clone = JSON.parse(JSON.stringify(geojson));

  const transform = (coord: any): any => {
    if (typeof coord[0] === 'number') {
      return proj4(from, to, coord);
    }
    return coord.map((c: any) => transform(c));
  };

  clone.features.forEach((f: any) => {
    f.geometry.coordinates = transform(f.geometry.coordinates);
  });

  return clone;
}
