# 🎯 Plan de Implementación: Popups 100% Personalizables

## 📋 **Resumen de Arquitectura Actual**

### **Flujo Actual:**
```
page.tsx → MapSidebar → PopupConfigModal → popup-templates.ts → PopupStyleManager → useMap.ts
```

### **Problemas Identificados:**
- 4 templates fijos sin posibilidad de personalización
- Sin persistencia de templates personalizados
- Sin edición de estilos existentes
- Sin creación de nuevos templates

## 🚀 **Plan de Implementación por Fases**

---

### **Fase 1: Infraestructura Base**

#### **A. Extender Tipos (`types.ts`)**
```typescript
interface PopupTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  colors: string[];
  size: { width: number; minHeight: number };
  style: PopupStyleConfig;
  layout: PopupLayoutConfig;
  isCustom?: boolean;
  createdBy?: string;
  createdAt?: string;
}

interface MapData {
  // ... campos existentes
  popupTemplate?: string;
  customPopupTemplates?: PopupTemplate[];
}
```

#### **B. Crear Gestor de Templates (`popupTemplatesManager.ts`)**
```typescript
export class PopupTemplatesManager {
  // Templates predefinidos (migrar contenido actual)
  // CRUD de templates personalizados
  // Validación de estilos
  // Exportación/importación
}
```

#### **C. Sistema de Persistencia (`templateStorage.ts`)**
```typescript
export const templateStorage = {
  save: (mapId: string, templates: PopupTemplate[]) => {
    localStorage.setItem(`custom-templates-${mapId}`, JSON.stringify(templates));
  },
  
  load: (mapId: string): PopupTemplate[] => {
    const stored = localStorage.getItem(`custom-templates-${mapId}`);
    return stored ? JSON.parse(stored) : [];
  },
  
  delete: (mapId: string, templateId: string) => {
    const templates = templateStorage.load(mapId);
    const filtered = templates.filter(t => t.id !== templateId);
    templateStorage.save(mapId, filtered);
  }
};
```

---

### **Fase 2: UI de Creación/Edición**

#### **A. Editor de Templates (`TemplateEditorModal.tsx`)**
```typescript
interface TemplateEditorProps {
  template?: PopupTemplate;
  onSave: (template: PopupTemplate) => void;
  mode: 'create' | 'edit';
  onClose: () => void;
}

// Características:
- Editor visual de colores (paletas + custom)
- Control de tamaños (width, minHeight)
- Editor CSS avanzado (header, section, table, footer)
- Preview en tiempo real
- Validación automática (contraste, sintaxis)
```

#### **B. Selector de Colores (`ColorPicker.tsx`)**
```typescript
// Paletas predefinidas + custom
// Soporte para gradientes
// Selector hexadecimal + RGB
// Validación WCAG 2.1 AA
```

#### **C. Vista Previa (`TemplatePreview.tsx`)**
```typescript
// Componente reutilizable
- Preview responsive
- Simulación real del popup
- Tests de accesibilidad
```

---

### **Fase 3: Integración con Modal Existente**

#### **A. Modificar `PopupConfigModal.tsx`**
```typescript
const [activeTab, setActiveTab] = useState('predefined'); // 'predefined' | 'custom'

// Contenido dinámico:
{activeTab === 'predefined' && <PredefinedTemplates />}
{activeTab === 'custom' && <CustomTemplates />}

// Botones de acción:
<Button onClick={() => setShowTemplateEditor(true)}>
  <Plus className="mr-2" />
  Crear Nuevo Template
</Button>
```

#### **B. Secciones del Modal:**
1. **Templates Predefinidos** (actuales - read-only)
2. **Templates Personalizados** (CRUD completo)
3. **Crear Nuevo Template** → TemplateEditorModal

---

### **Fase 4: Actualización en Tiempo Real**

#### **A. Modificar `useMap.ts`**
```typescript
// Soportar templates dinámicos:
useEffect(() => {
  // Recargar templates personalizados del storage
  const customTemplates = templateStorage.load(mapData.id);
  
  // Aplicar cambios automáticamente
  if (customTemplates.length > 0) {
    PopupStyleManager.updateCustomTemplates(customTemplates);
  }
}, [mapData.customPopupTemplates]);
```

#### **B. Modificar `PopupStyleManager`**
```typescript
// Soportar actualización sin recarga:
updateTemplate(templateId: string, template: PopupTemplate) {
  // Actualizar CSS sin recargar página completa
  // Cache optimizado
  // Aplicar estilos inmediatamente
}
```

---

## 🗂️ **Estructura de Archivos Final**

```
components/
├── popup/
│   ├── TemplateEditorModal.tsx     // (Nuevo)
│   ├── ColorPicker.tsx            // (Nuevo)
│   ├── TemplatePreview.tsx        // (Nuevo)
│   ├── TemplateLibrary.tsx         // (Nuevo)
│   └── TemplateValidator.tsx       // (Nuevo)
utils/
├── popupTemplatesManager.ts        // (Nuevo - reemplaza popup-templates.ts)
├── templateStorage.ts             // (Nuevo)
├── templateValidator.ts           // (Nuevo)
└── templateUtils.ts              // (Nuevo)
```

---

## 🎨 **Características Técnicas Clave**

### **1. Sistema de Templates Híbrido**
- **Predefinidos**: 4 templates base (read-only)
- **Personalizados**: Ilimitados (CRUD completo)
- **Herencia**: Los personalizados pueden basarse en predefinidos

### **2. Editor Visual Completo**
- **Colores**: Paletas + custom + gradientes
- **Tipografía**: Selector de fuentes con vista previa
- **Layout**: Grid, separadores, espaciado configurable
- **Responsive**: Vista previa en diferentes tamaños

### **3. Persistencia Escalable**
```typescript
// Nivel 1: LocalStorage (MVP)
localStorage.setItem(`custom-templates-${mapId}`, JSON.stringify(templates));

// Nivel 2: JSON adjunto (Producción)
// map-data/templates/{mapId}/custom-templates.json

// Nivel 3: Base de datos (Enterprise)
// API endpoints para marketplace
```

### **4. Validaciones Automáticas**
- **Contraste de colores** (WCAG 2.1 AA)
- **Sintaxis CSS** (parseo de estilos generados)
- **Límites de tamaño** (max-width: 600px, min-width: 280px)
- **Compatibilidad** (CSS soportado por navegadores)

---

## 🔄 **Flujo de Usuario Final**

### **Crear Template:**
1. Usuario hace click en "Personalizar Popup" → Modal actual
2. Click en tab "Personalizados" → "Crear Nuevo Template"
3. Editor visual → Configura colores, tamaños, estilos
4. Preview en tiempo real → Validación automática
5. "Guardar" → Aplicar inmediatamente al mapa

### **Editar Template:**
1. En tab "Personalizados" → Lista de templates
2. Click "Editar" en template específico
3. Mismo editor con valores precargados
4. "Actualizar" → Refrescar popup instantáneamente

### **Eliminar Template:**
1. Lista personalizados → "Eliminar"
2. Confirmación → Remover del storage y mapa

---

## 🛠️ **Modificaciones Mínimas Requeridas**

### **1. `MapSidebar.tsx` (línea 414-419)**
```typescript
// Cambiar botón actual:
<Button onClick={() => setShowPopupConfig(true)}>
  <Settings className="mr-2" />
  Personalizar Popup
</Button>

// El modal ahora tendrá tabs para crear/editar
```

### **2. `page.tsx`**
```typescript
// Añadir gestión de templates personalizados:
const [customTemplates, setCustomTemplates] = useState<PopupTemplate[]>([]);
```

### **3. `useMap.ts`**
```typescript
// Soportar templates dinámicos sin recarga completa:
useEffect(() => {
  if (customTemplates.length > 0) {
    applyPopupStyles(selectedPopupTemplate, customTemplates);
  }
}, [selectedPopupTemplate, customTemplates]);
```

---

## ⚡ **Ventajas de esta Implementación**

1. **No romper** la arquitectura actual
2. **Incremental**: Implementable por fases
3. **Backward compatible**: Templates actuales siguen funcionando
4. **Escalable**: Fácil extender a marketplace futuro
5. **Performance**: Cache y lazy loading
6. **Accesibilidad**: Validaciones automáticas incluidas
7. **UX Profesional**: Editor visual completo con preview
8. **Persistencia**: Múltiples niveles de almacenamiento

---

## 🎯 **Prioridad de Implementación**

### **🚀 MVP (Semanas 1-2):**
1. Tipos y storage básico
2. Editor visual mínimo
3. CRUD simple de templates
4. Preview básico

### **🎨 Avanzado (Semanas 3-4):**
1. Editor CSS completo
2. Validaciones WCAG
3. Importación/exportación
4. Biblioteca de templates

### **🏢 Enterprise (Semanas 5-6):**
1. Base de datos
2. Marketplace de templates
3. Análisis de uso
4. APIs externas

---

## 📊 **Métricas de Éxito**

### **Técnicas:**
- Tiempo de carga del editor < 2s
- Preview en tiempo real < 100ms
- 99% compatibilidad con navegadores

### **UX:**
- Creación de template en < 3 minutos
- Reducción del 80% en necesidad de desarrollo custom
- Tasa de adopción de templates > 60%

### **Accesibilidad:**
- 100% WCAG 2.1 AA compliance
- Soporte completo para lectores de pantalla
- Navegación 100% por teclado

---

## 🔧 **Consideraciones Técnicas**

### **Rendimiento:**
```typescript
// Cache de estilos CSS generados
const styleCache = new Map<string, string>();

// Lazy loading de templates personalizados
const loadTemplatesAsync = async () => {
  // Cargar bajo demanda
};

// Debounce en actualizaciones en tiempo real
const debouncedUpdate = debounce(updateTemplate, 300);
```

### **Seguridad:**
```typescript
// Validación de CSS inyectado
const sanitizeCSS = (css: string) => {
  // Remover propiedades peligrosas
  // Validar sintaxis
  // Sanitizar valores
};
```

### **Testing:**
```typescript
// Tests unitarios para cada componente
// Tests de integración del flujo completo
// Tests E2E para user journeys
```

---

## 🎉 **Resultado Final**

Con este plan, los usuarios podrán:

✅ **Crear** templates desde cero con editor visual  
✅ **Editar** cualquier aspecto visual del popup  
✅ **Guardar** y gestionar biblioteca personal de templates  
✅ **Previsualizar** cambios en tiempo real  
✅ **Compartir** templates entre mapas  
✅ **Acceder** a marketplace de templates (futuro)  

**Todo esto mientras mantiene 100% de compatibilidad con el sistema actual.**

---

**Status:** 📋 Plan completo listo para implementación  
**Estimación:** 4-6 semanas para MVP completo  
**Dependencies:** Componentes UI actuales + Librerías de color picker