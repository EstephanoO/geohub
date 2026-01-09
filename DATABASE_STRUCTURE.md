# 🗄️ **Estructura de Datos - Gestión de Mapas**

## **Schema PostgreSQL + PostGIS**

```sql
-- Schema principal
CREATE SCHEMA IF NOT EXISTS map_simple;

-- Tabla de mapas
CREATE TABLE map_simple.maps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    feature_count INTEGER DEFAULT 0,
    bounds GEOMETRY(POLYGON, 4326),           -- Bounding box para queries rápidas
    centroid GEOMETRY(POINT, 4326),           -- Punto central del mapa
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de features/layers
CREATE TABLE map_simple.layers (
    id SERIAL PRIMARY KEY,
    map_id INTEGER REFERENCES map_simple.maps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    feature_type VARCHAR(50),                  -- Point, LineString, Polygon, etc.
    geometry GEOMETRY(GEOMETRY, 4326) NOT NULL, -- Datos geográficos reales
    properties JSONB DEFAULT '{}',             -- Propiedades flexibles
    style_config JSONB DEFAULT '{}',            -- Estilos personalizados
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de estilos QML
CREATE TABLE map_simple.styles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    qml_content TEXT,                          -- QML original
    parsed_style JSONB DEFAULT '{}',           -- QML parseado para quick access
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_layers_map_id ON map_simple.layers(map_id);
CREATE INDEX idx_layers_geometry ON map_simple.layers USING GIST(geometry);
CREATE INDEX idx_maps_bounds ON map_simple.maps USING GIST(bounds);
CREATE INDEX idx_maps_public ON map_simple.maps(is_public);
CREATE INDEX idx_maps_created_at ON map_simple.maps(created_at DESC);
```

## **Tipos de Datos Clave**

| Campo | Tipo | Uso |
|-------|------|-----|
| `geometry` | `GEOMETRY(GEOMETRY, 4326)` | Coordenadas geográficas en WGS84 |
| `bounds` | `GEOMETRY(POLYGON, 4326)` | Bounding box para búsquedas espaciales |
| `properties` | `JSONB` | Propiedades dinámicas de features |
| `style_config` | `JSONB` | Configuración de estilos por feature |
| `parsed_style` | `JSONB` | Estilos QML procesados |

## **Relaciones**

```
maps (1) → (N) layers
styles (1) → (N) layers (opcional)
```

## **Ejemplos de Queries**

```sql
-- Obtener todos los mapas públicos
SELECT id, name, feature_count, created_at 
FROM map_simple.maps 
WHERE is_public = true 
ORDER BY created_at DESC;

-- Obtener layers de un mapa como GeoJSON
SELECT 
    id, 
    name, 
    feature_type,
    ST_AsGeoJSON(geometry) as geometry,
    properties,
    style_config
FROM map_simple.layers 
WHERE map_id = 1;

-- Buscar mapas que intersecten un área
SELECT DISTINCT m.id, m.name
FROM map_simple.maps m
WHERE ST_Intersects(m.bounds, ST_MakeEnvelope(-77.1, 38.8, -77.0, 38.9, 4326));

-- Contar features por tipo de geometría
SELECT feature_type, COUNT(*) as count
FROM map_simple.layers 
GROUP BY feature_type;
```