import { PopupTemplate } from '../types';

const isClient = typeof window !== 'undefined';

// Función de utilidad para limpiar datos corruptos
export const cleanupCorruptedData = (mapId?: string) => {
  if (!isClient) return false;
  
  try {
    const keysToDelete = mapId 
      ? [`custom-templates-${mapId}`]
      : Object.keys(localStorage).filter(k => k.startsWith('custom-templates-'));
    
    let deletedCount = 0;
    keysToDelete.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (!Array.isArray(parsed)) {
            console.warn('🗑️ Datos corruptos encontrados, eliminando:', key);
            localStorage.removeItem(key);
            deletedCount++;
          }
        }
      } catch {
        console.warn('🗑️ Datos corruptos encontrados, eliminando:', key);
        localStorage.removeItem(key);
        deletedCount++;
      }
    });
    
    console.log(`🧹 Limpieza completada: ${deletedCount} archivos corruptos eliminados`);
    return deletedCount > 0;
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
    return false;
  }
};

export const templateStorage = {
  save: (mapId: string, templates: PopupTemplate[]) => {
    console.log('💾 templateStorage.save iniciado', {
      mapId,
      templatesCount: templates.length,
      isClient
    });
    
    if (!isClient) {
      console.error('❌ No es cliente side');
      return false;
    }
    
    try {
      const key = `custom-templates-${mapId}`;
      const data = JSON.stringify(templates, null, 2);
      console.log('📝 Guardando en localStorage:', { key, dataSize: data.length });
      
      localStorage.setItem(key, data);
      
      // Verificar que se guardó correctamente
      const stored = localStorage.getItem(key);
      const success = stored === data;
      console.log('✅ Verificación de guardado:', success);
      
      return success;
    } catch (error) {
      console.error('❌ Error saving templates to localStorage:', error);
      return false;
    }
  },
  
  load: (mapId: string): PopupTemplate[] => {
    console.log('📂 templateStorage.load iniciado', { mapId, isClient });
    
    if (!isClient) {
      console.error('❌ No es cliente side');
      return [];
    }
    
    try {
      const key = `custom-templates-${mapId}`;
      const stored = localStorage.getItem(key);
      
      if (!stored) {
        console.log('📭 No hay templates guardados para este mapId');
        return [];
      }
      
      console.log('📦 Datos encontrados en localStorage:', { 
        key, 
        dataSize: stored.length 
      });
      
      const templates = JSON.parse(stored);
      console.log('✅ Templates cargados:', {
        count: templates.length,
        templates: templates.map((t: any) => ({ id: t.id, name: t.name }))
      });
      
      return templates;
    } catch (error) {
      console.error('❌ Error loading templates from localStorage:', error);
      return [];
    }
  },

  delete: (mapId: string, templateId: string) => {
    if (!isClient) return false;
    try {
      const templates = templateStorage.load(mapId);
      const filtered = templates.filter(t => t.id !== templateId);
      templateStorage.save(mapId, filtered);
      return true;
    } catch (error) {
      console.error('Error deleting template from localStorage:', error);
      return false;
    }
  },

  clear: (mapId: string) => {
    if (!isClient) return false;
    try {
      localStorage.removeItem(`custom-templates-${mapId}`);
      return true;
    } catch (error) {
      console.error('Error clearing templates from localStorage:', error);
      return false;
    }
  },

  export: (mapId: string): string => {
    if (!isClient) return '[]';
    const templates = templateStorage.load(mapId);
    return JSON.stringify(templates, null, 2);
  },

  import: (mapId: string, jsonData: string): boolean => {
    if (!isClient) return false;
    try {
      const templates = JSON.parse(jsonData);
      if (Array.isArray(templates)) {
        return templateStorage.save(mapId, templates);
      }
      return false;
    } catch (error) {
      console.error('Error importing templates:', error);
      return false;
    }
  },
  
  // Función para verificar integridad de datos
  verifyData: (mapId: string): { isValid: boolean; errors: string[] } => {
    if (!isClient) return { isValid: false, errors: ['Not client side'] };
    
    try {
      const key = `custom-templates-${mapId}`;
      const stored = localStorage.getItem(key);
      
      if (!stored) {
        return { isValid: true, errors: [] }; // No hay datos = válido
      }
      
      const parsed = JSON.parse(stored);
      const errors: string[] = [];
      
      if (!Array.isArray(parsed)) {
        errors.push('Data is not an array');
      } else {
        parsed.forEach((template, index) => {
          if (!template.id) errors.push(`Template ${index}: Missing id`);
          if (!template.name) errors.push(`Template ${index}: Missing name`);
          if (!template.style) errors.push(`Template ${index}: Missing style`);
        });
      }
      
      return { isValid: errors.length === 0, errors };
    } catch (error) {
      return { isValid: false, errors: [`Parse error: ${error}`] };
    }
  }
};