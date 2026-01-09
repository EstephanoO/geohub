export function detectCRS(geojson: any): string {
  const crsName = geojson?.crs?.properties?.name || geojson?.crs?.name || "";

  if (!crsName) return "EPSG:4326";

  if (crsName.includes("EPSG")) {
    const match = crsName.match(/EPSG[:]*([0-9]+)/);
    if (match) return `EPSG:${match[1]}`;
  }

  return "EPSG:4326";
}