# 🚀 **ESTRUCTURA COMPLETA FASTIFY + DRIZZLE**
## **Para soporte completo de GeoJSON Maps**

---

## 📦 **DEPENDENCIAS NECESARIAS**

```bash
# Backend dependencies
npm install fastify @fastify/multipart @fastify/cors @fastify/swagger
npm install drizzle-orm pg @types/pg
npm install drizzle-kit
npm install zod
npm install @turf/turf @turf/bbox

# TypeScript
npm install -D @types/node @types/fastify/multipart typescript tsx
```

---

## 🗄️ **DRIZZLE SCHEMA - PostgreSQL + PostGIS**

### **src/db/schema.ts**
```typescript
import { pgTable, serial, varchar, text, integer, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { geometry } from 'drizzle-orm/postgres-js';

// Tabla principal de mapas
export const maps = pgTable('maps', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  fileName: varchar('file_name', { length: 255 }),
  fileSize: integer('file_size'),
  featureCount: integer('feature_count').default(0),
  bounds: geometry('bounds', { type: 'polygon', srid: 4326 }),
  centroid: geometry('centroid', { type: 'point', srid: 4326 }),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabla de features/layers
export const layers = pgTable('layers', {
  id: serial('id').primaryKey(),
  mapId: integer('map_id').references(() => maps.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  featureType: varchar('feature_type', { length: 50 }), // Point, LineString, Polygon
  geometry: geometry('geometry', { type: 'geometry', srid: 4326 }).notNull(),
  properties: jsonb('properties').default('{}'),
  styleConfig: jsonb('style_config').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabla de estilos QML
export const styles = pgTable('styles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  qmlContent: text('qml_content'),
  parsedStyle: jsonb('parsed_style').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Types
export type Map = typeof maps.$inferSelect;
export type NewMap = typeof maps.$inferInsert;
export type Layer = typeof layers.$inferSelect;
export type NewLayer = typeof layers.$inferInsert;
export type Style = typeof styles.$inferSelect;
export type NewStyle = typeof styles.$inferInsert;
```

---

## 🗄️ **CONFIGURACIÓN DE BASE DE DATOS**

### **src/db/config.ts**
```typescript
import { drizzle } from 'drizzle-orm/node-postgres-js';
import pg from 'pg';
import * as schema from './schema';

// Pool de conexión
const pool = new pg.Pool({
  host: '192.168.18.246',
  port: 5434,
  database: 'carto',
  user: 'cartografo',
  password: process.env.DB_PASSWORD,
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Exportar db y schema
export const db = drizzle(pool, { schema });
export { schema };
```

---

## 🚀 **ENDPOINTS COMPLETOS PARA FASTIFY**

### **src/routes/maps.ts**
```typescript
import { FastifyPluginAsync } from 'fastify';
import { db, schema } from '../db/config';
import { eq, desc, and } from 'drizzle-orm';
import { bbox } from '@turf/turf';

const mapsRoutes: FastifyPluginAsync = async (fastify) => {
  
  // GET /api/maps - Listar todos los mapas
  fastify.get('/api/maps', {
    schema: {
      description: 'Get all maps',
      tags: ['maps'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50 },
          offset: { type: 'number', default: 0 },
          public: { type: 'boolean', default: true }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { limit = 50, offset = 0, public: isPublic = true } = request.query as any;
      
      const mapsList = await db
        .select()
        .from(schema.maps)
        .where(and(
          eq(schema.maps.isPublic, isPublic)
        ))
        .orderBy(desc(schema.maps.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        success: true,
        maps: mapsList.map(map => ({
          ...map,
          bounds: map.bounds ? JSON.parse(map.bounds as string) : null
        })),
        pagination: {
          limit,
          offset,
          total: mapsList.length
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch maps'
        }
      });
    }
  });

  // GET /api/maps/:id - Obtener mapa específico
  fastify.get('/api/maps/:id', {
    schema: {
      description: 'Get map by ID',
      tags: ['maps'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: number };
      
      const map = await db
        .select()
        .from(schema.maps)
        .where(eq(schema.maps.id, id))
        .limit(1);

      if (map.length === 0) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'MAP_NOT_FOUND',
            message: 'Map not found'
          }
        });
      }

      return {
        success: true,
        map: {
          ...map[0],
          bounds: map[0].bounds ? JSON.parse(map[0].bounds as string) : null
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch map'
        }
      });
    }
  });

  // GET /api/maps/:id/layers - Obtener layers de un mapa
  fastify.get('/api/maps/:id/layers', {
    schema: {
      description: 'Get map layers',
      tags: ['maps', 'layers'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: number };
      
      const layersList = await db
        .select()
        .from(schema.layers)
        .where(eq(schema.layers.mapId, id))
        .orderBy(schema.layers.createdAt);

      // Convertir a GeoJSON FeatureCollection
      const features = layersList.map(layer => ({
        type: 'Feature',
        properties: {
          ...layer.properties,
          id: layer.id,
          name: layer.name,
          featureType: layer.featureType
        },
        geometry: JSON.parse(layer.geometry as string),
        styleConfig: layer.styleConfig
      }));

      return {
        success: true,
        layers: layersList,
        geojson: {
          type: 'FeatureCollection',
          features
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch map layers'
        }
      });
    }
  });

  // DELETE /api/maps/:id - Eliminar mapa
  fastify.delete('/api/maps/:id', {
    schema: {
      description: 'Delete map',
      tags: ['maps'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: number };
      
      // El cascade en la foreign key eliminará los layers automáticamente
      const deletedMap = await db
        .delete(schema.maps)
        .where(eq(schema.maps.id, id))
        .returning();

      if (deletedMap.length === 0) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'MAP_NOT_FOUND',
            message: 'Map not found'
          }
        });
      }

      return {
        success: true,
        message: 'Map deleted successfully',
        map: deletedMap[0]
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to delete map'
        }
      });
    }
  });
};

export default mapsRoutes;
```

---

## 🚀 **ENDPOINTS DE UPLOAD (MEJORADOS)**

### **src/routes/upload.ts**
```typescript
import { FastifyPluginAsync } from 'fastify';
import { fastifyMultipart } from '@fastify/multipart';
import { db, schema } from '../db/config';
import { eq } from 'drizzle-orm';
import { bbox, featureCollection } from '@turf/turf';
import * as turf from '@turf/turf';

const uploadRoutes: FastifyPluginAsync = async (fastify) => {
  // Registrar multipart plugin
  await fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
      files: 1
    }
  });

  // POST /api/upload/geojson
  fastify.post('/api/upload/geojson', {
    schema: {
      description: 'Upload GeoJSON file',
      tags: ['upload'],
      consumes: ['multipart/form-data']
    }
  }, async (request, reply) => {
    const startTime = Date.now();
    
    try {
      const data = await request.file();
      
      if (!data) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No file provided'
          }
        });
      }

      // Validar tipo de archivo
      if (!data.filename?.match(/\.(geojson|json)$/i)) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'Only .geojson and .json files are allowed'
          }
        });
      }

      // Leer contenido del archivo
      const buffer = await data.toBuffer();
      const content = buffer.toString('utf-8');
      
      // Parsear GeoJSON
      let geoJson;
      try {
        geoJson = JSON.parse(content);
      } catch (error) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON format'
          }
        });
      }

      // Validar estructura GeoJSON
      if (!geoJson.type || !['FeatureCollection', 'Feature'].includes(geoJson.type)) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'INVALID_GEOJSON',
            message: 'Invalid GeoJSON format'
          }
        });
      }

      // Extraer metadata de los fields
      const mapName = data.fields.mapName?.value || data.filename?.replace(/\.(geojson|json)$/i, '') || 'Untitled Map';
      const mapDescription = data.fields.mapDescription?.value;

      // Preparar features
      const features = geoJson.type === 'FeatureCollection' 
        ? geoJson.features || []
        : [geoJson];

      // Calcular bounds
      let bounds = null;
      if (features.length > 0) {
        const collection = featureCollection(features);
        const bboxResult = bbox(collection);
        
        // Crear polygon para bounds
        bounds = {
          type: 'Polygon',
          coordinates: [[
            [bboxResult[0], bboxResult[1]],
            [bboxResult[2], bboxResult[1]],
            [bboxResult[2], bboxResult[3]],
            [bboxResult[0], bboxResult[3]],
            [bboxResult[0], bboxResult[1]]
          ]]
        };
      }

      // Iniciar transacción
      const result = await db.transaction(async (tx) => {
        // Insertar mapa
        const [newMap] = await tx.insert(schema.maps).values({
          name: mapName,
          description: mapDescription,
          fileName: data.filename,
          fileSize: buffer.length,
          featureCount: features.length,
          bounds: bounds ? JSON.stringify(bounds) : null,
          centroid: bounds ? JSON.stringify(turf.centroid(bounds).geometry) : null,
        }).returning();

        // Insertar layers/features
        const layersToInsert = features.map((feature, index) => ({
          mapId: newMap.id,
          name: feature.properties?.name || `Feature ${index + 1}`,
          featureType: feature.geometry?.type,
          geometry: JSON.stringify(feature.geometry),
          properties: feature.properties || {},
          styleConfig: feature.properties?.style || {}
        }));

        if (layersToInsert.length > 0) {
          await tx.insert(schema.layers).values(layersToInsert);
        }

        return newMap;
      });

      const processingTime = Date.now() - startTime;

      return reply.status(201).send({
        success: true,
        data: {
          mapId: result.id,
          featuresCount: features.length,
          fileName: data.filename,
          mapName: mapName,
          bounds: bounds ? [bounds.coordinates[0][0][0], bounds.coordinates[0][0][1], bounds.coordinates[0][2][0], bounds.coordinates[0][2][1]] : null,
          processingTime
        },
        code: 'CREATED',
        message: `Successfully uploaded and processed "${mapName}" with ${features.length} features`
      });

    } catch (error) {
      fastify.log.error('Upload error:', error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: 'Failed to process upload'
        }
      });
    }
  });

  // POST /api/upload/qml - Upload de estilos QML
  fastify.post('/api/upload/qml', {
    schema: {
      description: 'Upload QML style file',
      tags: ['upload', 'styles']
    }
  }, async (request, reply) => {
    try {
      const data = await request.file();
      
      if (!data) {
        return reply.status(400).send({
          success: false,
          error: { code: 'NO_FILE', message: 'No QML file provided' }
        });
      }

      // Parsear QML (implementación simple)
      const qmlContent = await data.toBuffer();
      const content = qmlContent.toString('utf-8');
      
      // Extraer estilos (regex simple)
      const style: any = {};
      const patterns = {
        color: /color="([^"]+)"/g,
        width: /width="([^"]+)"/g,
        opacity: /opacity="([^"]+)"/g
      };

      Object.entries(patterns).forEach(([key, pattern]) => {
        const match = content.match(pattern);
        if (match) {
          style[key] = match[match.length - 1]?.match(/="([^"]+)"/)?.[1];
        }
      });

      const styleName = data.fields.styleName?.value || data.filename?.replace(/\.qml$/i, '') || 'Unnamed Style';
      
      // Guardar en base de datos
      const [newStyle] = await db.insert(schema.styles).values({
        name: styleName,
        qmlContent: content,
        parsedStyle: style
      }).returning();

      return {
        success: true,
        style: {
          id: newStyle.id,
          name: styleName,
          parsedStyle: style
        }
      };

    } catch (error) {
      fastify.log.error('QML upload error:', error);
      return reply.status(500).send({
        success: false,
        error: { code: 'QML_UPLOAD_ERROR', message: 'Failed to process QML file' }
      });
    }
  });
};

export default uploadRoutes;
```

---

## 🔧 **CONFIGURACIÓN DRIZZLE**

### **drizzle.config.ts**
```typescript
import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env' });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: '192.168.18.246',
    port: 5434,
    database: 'carto',
    user: 'cartografo',
    password: process.env.DB_PASSWORD || '',
  },
  verbose: true,
  strict: true,
});
```

---

## 🚀 **SERVIDOR FASTIFY COMPLETO**

### **src/server.ts**
```typescript
import fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import mapsRoutes from './routes/maps';
import uploadRoutes from './routes/upload';

const server = fastify({
  logger: {
    level: 'info'
  }
});

// Registrar plugins
await server.register(cors, {
  origin: ['http://localhost:3000', 'http://192.168.18.246:3000'],
  credentials: true
});

await server.register(swagger, {
  swagger: {
    info: {
      title: 'GeoHub Maps API',
      description: 'API para gestión de mapas GeoJSON con PostgreSQL + PostGIS',
      version: '1.0.0'
    },
    host: 'localhost:3000',
    schemes: ['http'],
    consumes: ['application/json', 'multipart/form-data'],
    produces: ['application/json'],
    tags: [
      { name: 'maps', description: 'Map management' },
      { name: 'upload', description: 'File upload' },
      { name: 'layers', description: 'Layer management' }
    ]
  }
});

await server.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  }
});

// Health check
server.get('/health', async () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  };
});

// Registrar rutas
await server.register(mapsRoutes);
await server.register(uploadRoutes);

// Iniciar servidor
const start = async () => {
  try {
    await server.listen({ 
      port: 3000, 
      host: '0.0.0.0' 
    });
    console.log('🚀 Server running on http://localhost:3000');
    console.log('📚 API Docs: http://localhost:3000/docs');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
```

---

## 🗄️ **SQL PARA CREAR TABLAS (EJECUTAR UNA VEZ)**

```sql
-- Crear schema si no existe
CREATE SCHEMA IF NOT EXISTS map_simple;

-- Extensión PostGIS (si no está instalada)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabla de mapas
CREATE TABLE map_simple.maps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    feature_count INTEGER DEFAULT 0,
    bounds GEOMETRY(POLYGON, 4326),
    centroid GEOMETRY(POINT, 4326),
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de layers/features
CREATE TABLE map_simple.layers (
    id SERIAL PRIMARY KEY,
    map_id INTEGER REFERENCES map_simple.maps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    feature_type VARCHAR(50),
    geometry GEOMETRY(GEOMETRY, 4326) NOT NULL,
    properties JSONB DEFAULT '{}',
    style_config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de estilos
CREATE TABLE map_simple.styles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    qml_content TEXT,
    parsed_style JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_layers_map_id ON map_simple.layers(map_id);
CREATE INDEX idx_layers_geometry ON map_simple.layers USING GIST(geometry);
CREATE INDEX idx_maps_bounds ON map_simple.maps USING GIST(bounds);
CREATE INDEX idx_maps_public ON map_simple.maps(is_public);
CREATE INDEX idx_maps_created_at ON map_simple.maps(created_at DESC);
```

---

## 🚀 **COMANDOS PARA PONER EN MARCHA**

```bash
# 1. Instalar dependencias
npm install fastify @fastify/multipart @fastify/cors @fastify/swagger @fastify/swagger-ui
npm install drizzle-orm pg @types/pg drizzle-kit
npm install @turf/turf @turf/bbox zod

# 2. Configurar variables de entorno
echo "DB_PASSWORD=tu_password" > .env

# 3. Generar y ejecutar migraciones (primera vez)
npx drizzle-kit generate
npx drizzle-kit migrate

# 4. Iniciar servidor
npm run dev

# O directamente con tsx
npx tsx src/server.ts
```

---

## 🎯 **ENDPOINTS DISPONIBLES**

Una vez implementado, tendrás:

```
GET    /api/maps              # Listar todos los mapas públicos
GET    /api/maps/:id           # Obtener mapa específico
GET    /api/maps/:id/layers    # Obtener layers como GeoJSON
DELETE /api/maps/:id           # Eliminar mapa

POST   /api/upload/geojson     # Upload GeoJSON → PostgreSQL
POST   /api/upload/qml         # Upload estilos QML

GET    /health                 # Health check
GET    /docs                   # Documentación Swagger
```

**Con esta estructura, tu app Next.js funcionará perfectamente con todos los endpoints necesarios para el catálogo de mapas.**

¿Quieres que implemente alguna parte específica de esta estructura?