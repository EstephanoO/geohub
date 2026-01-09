export interface GeoJSON {
  type: "FeatureCollection" | "Feature" | "Point" | "LineString" | "Polygon" | "MultiPoint" | "MultiLineString" | "MultiPolygon";
  features?: any[];
  geometry?: any;
  properties?: any;
  coordinates?: any;
  crs?: any;
}