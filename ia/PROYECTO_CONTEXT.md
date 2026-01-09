# GeoHub - Contexto Completo del Proyecto

## 🗂️ **Estructura del Repositorio**

### 📁 **Organización Principal**
```
geohub-v4/
├── app/                     # Next.js App Router
│   ├── (admin)/            # Grupo de rutas admin
│   │   └── admin/
│   │       ├── login/      # Login de administración
│   │       ├── map/        # Rutas de mapas
│   │       │   ├── [id]/   # Mapa específico
│   │       │   └── new/    # Nuevo mapa (principal)
│   │       └── page.tsx    # Dashboard admin
│   ├── api/                # API Routes
│   │   └── auth/           # Endpoints de autenticación
│   │       ├── login/      # POST /api/auth/login
│   │       ├── logout/     # POST /api/auth/logout
│   │       └── me/         # GET /api/auth/me
│   ├── globals.css         # Estilos globales
│   └── layout.tsx          # Layout principal
├── src/                    # Source code
│   ├── auth/              # Sistema de autenticación
│   ├── components/        # Componentes de mapa
│   └── constants.ts       # Constantes globales
├── components/            # UI Components
│   └── ui/               # Componentes base (shadcn/ui)
└── ia/                   # Documentación para IA (esta carpeta)
```

## 🔐 **Sistema de Autenticación**

### 📍 **Ubicación y Manejo**
- **Config**: `src/constants.ts`
- **API Endpoints**: `app/api/auth/*/route.ts`
- **JWT Utils**: `src/auth/jwt.ts`
- **Password Utils**: `src/auth/password.ts`

### 🔧 **Credenciales Actuales**
```typescript
// src/constants.ts
export const AUTH_CREDENTIALS = {
  email: "admin@geohub.com",
  password: "admin123",
};

export const JWT_CONFIG = {
  secret: "supersecret_jwt_key_for_development",
  expiresIn: "7d",
};
```

### 🔄 **Flujo de Autenticación**
1. **Login**: `POST /api/auth/login` → JWT cookie
2. **Verify**: `GET /api/auth/me` → User data
3. **Logout**: `POST /api/auth/logout` → Clear cookie
4. **Middleware**: `proxy.ts` → Protected routes

## 🗺️ **Sistema de Mapas**

### 🎯 **Componente Principal**
- **Map Container**: `app/(admin)/admin/map/new/components/MapContainer.tsx`
- **Map Hook**: `app/(admin)/admin/map/new/hooks/useMap.ts`
- **Map Page**: `app/(admin)/admin/map/new/page.tsx`

### 📊 **Datos Geográficos**
- **GeoJSON**: `public/distritos_lima.geojson`
- **QML File**: `public/distritos_lima(3).qml`
- **CRS Utils**: `app/(admin)/admin/map/new/utils/crs.ts`
- **Reprojection**: `app/(admin)/admin/map/new/utils/reprojection.ts`

### 🗂️ **Manejo de Datos**
```typescript
// useMap.ts - Hook principal
- mapRef: Referencia al mapa MapLibre
- sourceId: ID de capa GeoJSON
- geoJson: Datos geográficos
- mapConfig: Configuración del mapa
- popupTemplate: Template actual del popup
```

## 🎨 **Sistema de Popups**

### 📍 **Ubicación Principal**
- **Templates**: `app/(admin)/admin/map/new/components/popup-templattes.ts`
- **Estilos CSS**: `app/(admin)/admin/map/new/components/MapContainer.tsx` (líneas 37-80)
- **Aplicación**: `app/(admin)/admin/map/new/hooks/useMap.ts` (líneas 288-405)
- **Config Modal**: `app/(admin)/admin/map/new/components/PopupConfigModal.tsx`

### 🎭 **Templates Disponibles**
```typescript
// popup-templattes.ts
export const popupTemplates = {
  moderno: "Moderno Minimalista",      // Predeterminado
  corporativo: "Corporativo Profesional", 
  colorido: "Colorido Vibrante",
  profesional: "Profesional Premium"
};
```

### 🎨 **Estilos CSS - Jerarquía**
1. **Base**: `app/globals.css` (líneas 200-248)
2. **Específico**: `MapContainer.tsx` (CSS-in-JS con :global())
3. **Templates**: Configuración predefinida en popup-templattes.ts
4. **Aplicación**: Estilos inline desde useMap.ts

### 🔄 **Flujo de Popup**
1. **Hover**: `useMap.ts` → Event listeners líneas 420-421
2. **Show**: `showPopup()` función líneas 328-405
3. **Template**: `popupTemplate` state + `popupTemplates` config
4. **Estilos**: CSS dinámicos + template predefinido

## 🎛️ **Componentes de Configuración**

### 📋 **Sidebar Admin**
- **Component**: `app/(admin)/admin/map/new/components/MapSidebar.tsx`
- **Estado**: `selectedPopupTemplate`
- **Config Modal**: `PopupConfigModal.tsx`

### ⚙️ **Configuración de Popup**
- **Templates**: 4 diseños profesionales
- **Tamaños**: 340-420px width, 240-300px height
- **Estilos**: Tablas con separadores, gradients, shadows
- **Layout**: Todos usan `contentLayout: "table"`

## 🎨 **Sistema de Estilos**

### 🎯 **Framework UI**
- **Base**: shadcn/ui + Tailwind CSS
- **Components**: Radix UI primitives
- **Icons**: Lucide React
- **Styles**: globals.css + component-level CSS

### 🗂️ **Estilos de Popup Detallados**
```typescript
// MapContainer.tsx - Líneas 37-80
:global(.maplibregl-popup-content) {
  z-index: 999999 !important;
  // Estilos base del popup
}

// popup-templattes.ts - Templates
style: {
  background, borderColor, borderRadius, boxShadow,
  header, section, separator, table, tableRow,
  tableLabel, tableValue, footer
}
```

## 🔄 **Manejo de Estado**

### 🗂️ **Estado Global**
- **Auth**: Cookies HTTP-only
- **Map**: React hooks + refs
- **Popup**: Local state + template selection

### 🎯 **Variables de Estado Clave**
```typescript
// page.tsx + MapSidebar.tsx
const [selectedPopupTemplate, setSelectedPopupTemplate] = useState("moderno");

// useMap.ts
const [mapConfig, setMapConfig] = useState<MapConfig>();
const [popupTemplate, setPopupTemplate] = useState("moderno");
```

## 🚀 **Deploy y Producción**

### 🌐 **Vercel Deployment**
- **Build Command**: `bun run build`
- **Start Command**: `bun start`
- **Framework**: Next.js 16 + Turbopack
- **Package Manager**: Bun

### 🔧 **Dependencias Críticas**
- **Mapas**: `maplibre-gl`
- **Auth**: `jsonwebtoken`, `bcryptjs`
- **UI**: Radix UI, Tailwind CSS
- **Utils**: `lodash`, `xml2js`
- **Geo**: `geostyler-qgis-parser`, `geostyler-mapbox-parser`

## 🎛️ **Configuración por Defecto**

### 🗺️ **Mapa Default**
- **Template Popup**: `"moderno"`
- **Estado**: Seteado en `page.tsx` línea 15 y `MapSidebar.tsx` línea 57
- **Fallback**: `useMap.ts` línea 326

### 🎨 **Estilos Default**
- **CSS Principal**: `globals.css`
- **Popup CSS**: `MapContainer.tsx`
- **Componentes**: `components/ui/*`

## 🔄 **Flujos de Usuario**

### 1. **Login Flow**
1. User visita `/admin/login`
2. Ingresa `admin@geohub.com` / `admin123`
3. API `/api/auth/login` verifica credentials
4. JWT cookie seteada
5. Redirect a `/admin/map/[randomId]`

### 2. **Map Interaction Flow**
1. Mapa carga GeoJSON de distritos
2. User hace hover sobre polígono
3. `showPopup()` se dispara con template actual
4. Popup renderiza con estilos específicos
5. User puede cambiar template en sidebar

## 🎯 **Puntos Clave para IA**

### 🔍 **Donde Cambiar Cosas**
- **Popup Template**: `popup-templattes.ts` → `style` objects
- **Estilos CSS**: `MapContainer.tsx` → CSS-in-JS
- **Auth Creds**: `src/constants.ts` → `AUTH_CREDENTIALS`
- **Map Data**: `public/*.geojson` files
- **UI Components**: `components/ui/` shadcn/ui

### 🎨 **Estilos Popup - Control Total**
```typescript
// Para modificar cualquier estilo de popup:
// 1. popup-templattes.ts - Templates predefinidos
// 2. MapContainer.tsx - Estilos CSS base
// 3. useMap.ts - Aplicación dinámica
```

### 🗺️ **Map Logic**
- **useMap.ts**: Hook principal con toda la lógica
- **CRS**: Coordinadas y proyecciones
- **Events**: Hover, click, popup interactions

---

**Status**: ✅ Proyecto completo y documentado
**Last Updated**: Versión actual con auth centralizada
**Deploy**: Ready para producción en Vercel