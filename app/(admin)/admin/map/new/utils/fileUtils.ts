import { MapData, FileUploadHandler } from "../types";

export const fileUtils = {
  createFileUploader: (
    onFileSelect: (file: File) => void,
    onError?: (error: string) => void
  ) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        onFileSelect(selectedFile);
      } else if (onError) {
        onError("No se seleccionó ningún archivo");
      }
    };
  },

  readGeoJSONFile: (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            const content = result.trim();
            if (content === '') {
              reject(new Error("El archivo está vacío"));
              return;
            }

            const geoJson = JSON.parse(content);
            
            // Basic GeoJSON validation
            if (!geoJson.type) {
              reject(new Error("El archivo no tiene un formato GeoJSON válido: falta el campo 'type'"));
              return;
            }

            const validTypes = ['FeatureCollection', 'Feature', 'Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'];

            if (!validTypes.includes(geoJson.type)) {
              reject(new Error("Tipo de GeoJSON no válido"));
              return;
            }
            
            resolve(geoJson);
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  },

  saveMapData: (mapData: any) => {
    try {
      // Generate a simple ID for the map
      const mapId = `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // In a real app, this would save to a database
      // For now, just simulate saving
      console.log("💾 Saving map data:", mapData);
      console.log("🆔 Generated map ID:", mapId);
      
      return {
        success: true,
        mapId: mapId
      };
    } catch (error) {
      console.error("❌ Error saving map:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al guardar el mapa"
      };
    }
  },

  redirectToMap: (mapId: string) => {
    // In a real app, this would navigate to the map view
    console.log("🔄 Redirecting to map:", mapId);
    window.location.href = `/admin/map/${mapId}`;
  },

  redirectToAdmin: () => {
    // Redirect back to admin panel
    console.log("🔄 Redirecting to admin panel");
    window.location.href = "/admin";
  }
};