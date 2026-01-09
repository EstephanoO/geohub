// Cliente API para conectar con backend Fastify existente
// localhost:3000 - API de PostgreSQL + PostGIS

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class MapCatalogAPI {
  private baseURL: string;
  
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Upload GeoJSON a tu API existente
  async uploadGeoJSON(file: File, mapName: string, mapDescription?: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapName', mapName);
    if (mapDescription) {
      formData.append('mapDescription', mapDescription);
    }

    const response = await fetch(`${this.baseURL}/api/upload/geojson`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  // Obtener todos los mapas desde tu API
  async getMaps() {
    const response = await fetch(`${this.baseURL}/api/maps`, {
      cache: 'no-store', // Disable cache para datos en tiempo real
    });

    if (!response.ok) {
      throw new Error('Failed to fetch maps');
    }

    return response.json();
  }

  // Obtener layers de un mapa específico
  async getMapLayers(mapId: number) {
    const response = await fetch(`${this.baseURL}/api/maps/${mapId}/layers`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch map layers');
    }

    return response.json();
  }

  // Health check de tu API
  async healthCheck() {
    const response = await fetch(`${this.baseURL}/health`);
    return response.json();
  }
}

export const apiClient = new MapCatalogAPI();