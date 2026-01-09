# 🚀 Informe Técnico: Conexión Next.js 16 con Fastify API - Map Catalog

**Fecha:** 2026-01-09  
**Versión:** 1.0  
**Stack:** Next.js 16 (Frontend) + Fastify + Bun (Backend) + PostgreSQL + PostGIS  
**Contexto:** Conexión frontend para catálogo de mapas GeoJSON

---

## 🎯 **Objetivo Principal**

Establecer las **reglas y mejores prácticas** para conectar un frontend **Next.js 16** con nuestra **API Fastify existente**, optimizado para el manejo de datos geoespaciales y mapas interactivos.

---

## 📋 **Análisis de Viabilidad - Despliegue Intranet**

### ✅ **VIABILIDAD: 100% COMPLETA**

El documento `despliegue_intranet_next.md` describe una arquitectura **perfectamente viable** y **recomendada** para este proyecto:

**✅ Puntos Fuertes Identificados:**
- Arquitectura cliente-servidor correcta (no DB directa)
- Seguridad por red local (LAN)
- Escalabilidad futura garantizada
- Stack tecnológico adecuado

**✅ Compatibilidad con Nuestra API:**
- Fastify ya configurado para `0.0.0.0`
- PostgreSQL accesible vía red local (192.168.18.246)
- Estructura modular existente

---

## 🏗️ **Arquitectura Recomendada (Actualizada)**

```
📱 Navegador (Intranet)
   │ HTTP/HTTPS
   ▼
🎨 Next.js 16 Frontend (IP:3000)
   │ HTTP API Calls
   ▼
🔧 Fastify + Bun Backend (IP:3000)
   │ TCP PostgreSQL
   ▼
🐘 PostgreSQL + PostGIS (192.168.18.246:5434)
```

---

## 🔧 **Configuración Next.js 16**

### **1. Variables de Entorno**

```env
# .env.local
NEXT_PUBLIC_API_URL=http://192.168.18.246:3000
NEXT_PUBLIC_MAP_TILE_SERVER=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_APP_NAME=Map Catalog
NEXT_PUBLIC_MAX_UPLOAD_SIZE=52428800
```

### **2. Configuración TypeScript**

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/services/*": ["./src/services/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 🎨 **Componentes Core del Frontend**

### **1. Cliente API Optimizado**

```typescript
// src/services/api.ts
class MapCatalogAPI {
  private baseURL: string;
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  // Upload GeoJSON
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
      // Next.js 16: No need for Headers with FormData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  // Get all maps
  async getMaps() {
    const response = await fetch(`${this.baseURL}/api/maps`, {
      cache: 'no-store', // Next.js 16: Disable caching for real-time data
    });

    if (!response.ok) {
      throw new Error('Failed to fetch maps');
    }

    return response.json();
  }

  // Get layers for specific map
  async getMapLayers(mapId: number) {
    const response = await fetch(`${this.baseURL}/api/maps/${mapId}/layers`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch map layers');
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    const response = await fetch(`${this.baseURL}/health`);
    return response.json();
  }
}

export const apiClient = new MapCatalogAPI();
```

### **2. Tipos TypeScript**

```typescript
// src/types/map.ts
export interface Map {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  featureCount: number;
  bounds: {
    type: 'Polygon';
    coordinates: number[][][][];
  };
}

export interface Layer {
  id: number;
  mapId: number;
  name: string;
  geometry: GeoJSON.Geometry;
  properties: Record<string, any>;
  featureType: string;
  styleConfig?: Record<string, any>;
}

export interface UploadResponse {
  success: boolean;
  mapId: number;
  featuresCount: number;
  message: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}
```

### **3. Componente Upload (Next.js 16)**

```typescript
// src/components/MapUpload.tsx
'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/services/api';
import type { UploadResponse, APIError } from '@/types/map';

export function MapUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<UploadResponse | null>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validaciones cliente
    if (!file.name.match(/\.(geojson|json)$/i)) {
      setError('Solo se permiten archivos .geojson o .json');
      return;
    }

    const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE || '52428800');
    if (file.size > maxSize) {
      setError(`El archivo excede el tamaño máximo de ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const mapName = file.name.replace(/\.(geojson|json)$/i, '');
      const result = await apiClient.uploadGeoJSON(file, mapName, `Upload: ${new Date().toLocaleString()}`);
      
      setSuccess(result);
      setProgress(100);
    } catch (err) {
      const error = err as APIError;
      setError(error.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Subir Mapa GeoJSON</h2>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">¡Upload exitoso!</p>
            <p>Map ID: {success.mapId}</p>
            <p>Features: {success.featuresCount}</p>
            <p>{success.message}</p>
          </div>
        )}

        {/* Upload Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo GeoJSON
            </label>
            <input
              type="file"
              accept=".geojson,.json"
              onChange={handleFileSelect}
              disabled={uploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### **4. Componente Map Viewer con Leaflet**

```typescript
// src/components/MapViewer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Map, Layer } from '@/types/map';

// Dynamic import para SSR compatibility
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
);

interface MapViewerProps {
  map: Map;
  layers: Layer[];
}

export function MapViewer({ map, layers }: MapViewerProps) {
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Cargando mapa...</div>
      </div>
    );
  }

  const fitBounds = () => {
    if (mapRef.current && map.bounds) {
      const bounds = [
        [map.bounds.coordinates[0][0][1], map.bounds.coordinates[0][0][0]],
        [map.bounds.coordinates[0][2][1], map.bounds.coordinates[0][2][0]]
      ] as [[number, number], [number, number]];
      
      mapRef.current.fitBounds(bounds);
    }
  };

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={[0, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={process.env.NEXT_PUBLIC_MAP_TILE_SERVER || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
        />
        
        {layers.map((layer) => (
          <GeoJSON
            key={layer.id}
            data={{
              type: 'Feature',
              properties: layer.properties,
              geometry: layer.geometry
            }}
            style={{
              color: layer.styleConfig?.color || '#3388ff',
              weight: layer.styleConfig?.weight || 2,
              opacity: layer.styleConfig?.opacity || 1,
              fillOpacity: layer.styleConfig?.fillOpacity || 0.2
            }}
            onEachFeature={(feature, layer) => {
              if (feature.properties) {
                const popupContent = Object.entries(feature.properties)
                  .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                  .join('<br>');
                layer.bindPopup(popupContent);
              }
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
```

---

## 🔐 **Reglas de Seguridad y Mejores Prácticas**

### **1. Validaciones Cliente-Servidor**

```typescript
// src/utils/validation.ts
export const validateGeoJSONFile = (file: File): { valid: boolean; error?: string } => {
  // Extension validation
  if (!file.name.match(/\.(geojson|json)$/i)) {
    return { valid: false, error: 'Extensión inválida. Solo .geojson o .json' };
  }

  // Size validation
  const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE || '52428800');
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `Archivo demasiado grande. Máximo ${Math.round(maxSize / 1024 / 1024)}MB` 
    };
  }

  return { valid: true };
};

export const sanitizeMapName = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim().substring(0, 255);
};
```

### **2. Manejo de Errores Centralizado**

```typescript
// src/utils/errors.ts
export class APIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: any): APIError => {
  if (error instanceof APIError) {
    return error;
  }

  if (error.status === 413) {
    return new APIError('Archivo demasiado grande', 'FILE_TOO_LARGE', 413);
  }

  if (error.status === 400) {
    return new APIError('Solicitud inválida', 'BAD_REQUEST', 400);
  }

  if (error.status === 429) {
    return new APIError('Demasiadas solicitudes. Intente más tarde', 'RATE_LIMIT', 429);
  }

  return new APIError('Error desconocido. Intente nuevamente', 'UNKNOWN_ERROR', 500);
};
```

---

## 📱 **Estructura del Proyecto Frontend**

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Dashboard principal
│   │   ├── maps/
│   │   │   └── page.tsx         # Listado de mapas
│   │   └── upload/
│   │       └── page.tsx         # Upload interface
│   ├── components/
│   │   ├── MapUpload.tsx        # Componente upload
│   │   ├── MapViewer.tsx        # Visualizador Leaflet
│   │   ├── MapList.tsx          # Listado de mapas
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── services/
│   │   ├── api.ts               # Cliente API
│   │   └── storage.ts           # Local storage utilities
│   ├── types/
│   │   ├── map.ts               # Tipos de datos
│   │   └── api.ts               # Tipos de API
│   ├── utils/
│   │   ├── validation.ts        # Validaciones
│   │   ├── errors.ts            # Manejo de errores
│   │   └── formatters.ts        # Formato de datos
│   └── hooks/
│       ├── useMaps.ts           # Hook personalizado
│       └── useUpload.ts         # Hook de upload
├── public/
│   └── icons/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── .env.local
```

---

## 🚀 **Comandos de Desarrollo y Producción**

### **Desarrollo**

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev

# Verificar tipos
npm run type-check

# Linting
npm run lint
```

### **Producción**

```bash
# Build optimizado
npm run build

# Iniciar producción
npm run start

# Build y análisis
npm run build && npm run analyze
```

---

## 📊 **Optimizaciones Next.js 16**

### **1. Configuración next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react-leaflet', 'leaflet']
  },
  images: {
    domains: ['localhost', '192.168.18.246'],
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
      }
    ];
  }
};

export default nextConfig;
```

### **2. Optimización de Paquetes**

```json
{
  "dependencies": {
    "next": "16.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-leaflet": "^4.2.1",
    "leaflet": "^1.9.4",
    "@types/leaflet": "^1.9.8",
    "tailwindcss": "^3.4.0",
    "clsx": "^2.0.0"
  }
}
```

---

## 🔗 **Integración con Backend Existente**

### **Compatibilidad 100%**

Nuestro backend Fastify está **perfectamente preparado** para esta integración:

✅ **CORS configurado** para `http://192.168.18.246:3000`  
✅ **Rate limiting** implementado  
✅ **File upload** con multipart compatible  
✅ **Error handling** estandarizado  
✅ **Health checks** para monitoreo  

### **Endpoints Disponibles**

```typescript
// Endpoints implementados en el backend
GET  /health                    # Health check
POST /api/upload/geojson       # Upload GeoJSON
GET  /api/maps                  # Listar todos los mapas
GET  /api/maps/:id/layers       # Obtener layers de un mapa
GET  /metrics                   # Métricas del sistema
```

---

## 🎯 **Recomendaciones Finales**

### **1. Implementación Inmediata**

```bash
# Crear frontend
npx create-next-app@latest frontend --typescript --tailwind --eslint --app

# Instalar dependencias específicas
cd frontend
npm install react-leaflet leaflet @types/leaflet clsx

# Configurar variables de entorno
cp .env.example .env.local
```

### **2. Flujo de Trabajo Recomendado**

1. **Desarrollo local:** Next.js dev + API Fastify corriendo
2. **Testing:** Integración continua con API real
3. **Producción:** Build estático + API Fastify en red local

### **3. Monitoreo y Mantenimiento**

```typescript
// Health check automático
const checkAPIHealth = async () => {
  try {
    await apiClient.healthCheck();
    console.log('✅ API accessible');
  } catch (error) {
    console.error('❌ API not accessible:', error);
    // Implementar retry o fallback
  }
};
```

---

## 🎉 **Conclusión**

**✅ La arquitectura propuesta es 100% viable y recomendada**

- **Next.js 16** ofrece rendimiento superior y características modernas
- **Fastify + Bun** proporcionan un backend ultrarrápido
- **PostgreSQL + PostGIS** garantizan capacidad geoespacial profesional
- **Despliegue intranet** es seguro, escalable y de bajo costo

**🚀 El roadmap está claro: implementar el frontend siguiendo estas reglas para tener un sistema completo y profesional.**

---

*Este documento sirve como guía definitiva para la integración Next.js 16 con la API Fastify existente, garantizando una implementación robusta y mantenible.*