import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Import types from layer-list
export type NumericOperator =
  | "=="
  | "!="
  | ">"
  | ">="
  | "<"
  | "<=";

export interface StrokeRule {
  id: string;
  field: string;
  op: NumericOperator;
  value: string | number;
  color: string;
  width: number;
  opacity: number;
}

export interface NumericRule {
  fieldA: string;
  op: NumericOperator;
  fieldB: string;
  color: string;
}

export interface BooleanStyle {
  enabled: boolean;
  trueColor: string;
  falseColor: string;
}

export interface LayerInfo {
  id: string;
  name: string;
  visible: boolean;
  data: GeoJSON.FeatureCollection;
  fields: string[];
  
  // Fill properties
  color: string;
  fillOpacity: number;
  
  // Text categories (legacy compatibility)
  textCategories?: {
    field: string;
    values: Record<string, string>;
  } | null;
  
  // Legacy compatibility with new structure
  textField: string | null;
  categoryValues: Record<string, string>;
  booleanStyles: Record<string, BooleanStyle>;
  
  // Numeric rules (new structure)
  rules?: NumericRule[];
  numericRules: NumericRule[];
  
  // Stroke properties
  strokeColor: string;
  strokeWidth: number;
  strokeOpacity: number;
  strokeRules: StrokeRule[];
  
  // Popup
  popupTemplate: string;
}

export interface MapStore {
  // State
  layers: LayerInfo[];
  selectedLayerId: string | null;
  editingLayer: LayerInfo | null;
  isEditing: boolean;
  mapBounds: [[number, number], [number, number]] | null;
  
  // Actions
  addLayer: (layer: LayerInfo) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<LayerInfo>) => void;
  selectLayer: (id: string | null) => void;
  toggleLayerVisibility: (id: string) => void;
  setEditingLayer: (layer: LayerInfo | null) => void;
  clearLayers: () => void;
  setMapBounds: (bounds: [[number, number], [number, number]]) => void;
  
  // Computed
  getLayerById: (id: string) => LayerInfo | undefined;
  getVisibleLayers: () => LayerInfo[];
}

export const useMapStore = create<MapStore>()(
  subscribeWithSelector((set, get) => ({
    layers: [],
    selectedLayerId: null,
    editingLayer: null,
    isEditing: false,
    mapBounds: null,
    
    addLayer: (layer) => 
      set((state) => ({ 
        layers: [...state.layers, layer],
        selectedLayerId: layer.id 
      })),
    
    removeLayer: (id) =>
      set((state) => ({ 
        layers: state.layers.filter(l => l.id !== id),
        selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
        editingLayer: state.editingLayer?.id === id ? null : state.editingLayer
      })),
      
    updateLayer: (id, updates) =>
      set((state) => ({
        layers: state.layers.map(l => 
          l.id === id ? { ...l, ...updates } : l
        ),
        editingLayer: state.editingLayer?.id === id 
          ? { ...state.editingLayer, ...updates }
          : state.editingLayer
      })),
    
    selectLayer: (id) =>
      set((state) => ({ 
        selectedLayerId: id,
        editingLayer: id ? state.layers.find(l => l.id === id) || null : null
      })),
    
    toggleLayerVisibility: (id) =>
      set((state) => ({
        layers: state.layers.map(l => 
          l.id === id ? { ...l, visible: !l.visible } : l
        )
      })),
    
    setEditingLayer: (layer) =>
      set({ 
        editingLayer: layer,
        isEditing: !!layer,
        selectedLayerId: layer?.id || null
      }),
    
    clearLayers: () => 
      set({ 
        layers: [], 
        selectedLayerId: null, 
        editingLayer: null, 
        isEditing: false 
      }),
    
    setMapBounds: (bounds) => 
      set({ mapBounds: bounds }),
    
    getLayerById: (id) => {
      return get().layers.find(l => l.id === id);
    },
    
    getVisibleLayers: () => {
      return get().layers.filter(l => l.visible);
    }
  }))
);