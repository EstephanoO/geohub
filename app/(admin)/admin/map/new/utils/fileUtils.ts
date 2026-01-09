import { MapData, FileUploadHandler } from "../types";
import { apiClient } from "@/app/services/api";

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

  // 🔄 AHORA CONECTADO A TU API FASTIFY
  saveMapData: async (mapData: any) => {
    try {
      console.log("🚀 Enviando mapa a API Fastify:", mapData);
      
      // Validar que tenemos datos para guardar
      if (!mapData.name || !mapData.geoJson) {
        return {
          success: false,
          error: "Faltan datos requeridos: nombre o GeoJSON"
        };
      }

      // Convertir GeoJSON a Blob para subir
      const geoJsonBlob = new Blob([JSON.stringify(mapData.geoJson)], {
        type: 'application/json'
      });
      
      // Crear archivo virtual
      const geoJsonFile = new File([geoJsonBlob], `${mapData.name}.geojson`, {
        type: 'application/json'
      });

      // 🌟 LLAMAR A TU API EXISTENTE
      const result = await apiClient.uploadGeoJSON(
        geoJsonFile,
        mapData.name,
        mapData.description
      );

      console.log("✅ Mapa guardado exitosamente:", result);
      
      return {
        success: true,
        mapId: result.mapId,
        featuresCount: result.featuresCount,
        message: result.message
      };
      
    } catch (error) {
      console.error("❌ Error guardando mapa en API:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al guardar el mapa"
      };
    }
  },

  redirectToMap: (mapId: string | number) => {
    console.log("🔄 Redirecting to map:", mapId);
    window.location.href = `/admin/map/${mapId}`;
  },

  redirectToAdmin: () => {
    console.log("🔄 Redirecting to admin panel");
    window.location.href = "/admin";
  }
};