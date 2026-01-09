import { PopupTemplate } from '../types';
import { templateStorage } from './templateStorage';
import { popupTemplates } from '../components/popup-templattes';
import { PopupStyleConfig, PopupLayoutConfig } from '../types';

export class PopupTemplatesManager {
  private static instance: PopupTemplatesManager;
  private customTemplates: PopupTemplate[] = [];
  private currentMapId: string = '';
  private cache = new Map<string, PopupTemplate[]>();

  private constructor() {}

  static getInstance(): PopupTemplatesManager {
    if (!PopupTemplatesManager.instance) {
      PopupTemplatesManager.instance = new PopupTemplatesManager();
    }
    return PopupTemplatesManager.instance;
  }

  setMapId(mapId: string) {
    console.log('🎯 PopupTemplatesManager.setMapId', {
      oldMapId: this.currentMapId,
      newMapId: mapId
    });
    
    if (this.currentMapId !== mapId) {
      this.currentMapId = mapId;
      this.loadCustomTemplates();
      console.log('✅ MapId actualizado y templates recargados');
    } else {
      console.log('ℹ️ MapId sin cambios, verificando cache...');
      // Forzar recarga si la cache está vacía pero podría haber datos
      if (this.customTemplates.length === 0) {
        console.log('🔄 Cache vacía, forzando recarga...');
        this.cache.delete(mapId);
        this.loadCustomTemplates();
      }
    }
  }

  // Función de debug para verificar el estado completo
  debugInfo() {
    return {
      currentMapId: this.currentMapId,
      customTemplatesCount: this.customTemplates.length,
      cacheKeys: Array.from(this.cache.keys()),
      customTemplates: this.customTemplates.map(t => ({
        id: t.id,
        name: t.name,
        isCustom: t.isCustom,
        createdAt: t.createdAt
      })),
      localStorageData: typeof window !== 'undefined' ? {
        availableKeys: Object.keys(localStorage).filter(k => k.startsWith('custom-templates-')),
        currentKey: this.currentMapId ? `custom-templates-${this.currentMapId}` : null,
        hasData: this.currentMapId ? localStorage.getItem(`custom-templates-${this.currentMapId}`) !== null : false
      } : null
    };
  }

  clearCache() {
    this.cache.clear();
  }

  private loadCustomTemplates() {
    console.log('📂 PopupTemplatesManager.loadCustomTemplates iniciado', { 
      mapId: this.currentMapId,
      hasWindow: typeof window !== 'undefined'
    });
    
    if (!this.currentMapId || typeof window === 'undefined') {
      console.log('❌ No se pueden cargar templates: sin mapId o window');
      return;
    }
    
    // Usar cache para evitar múltiples lecturas del localStorage
    if (this.cache.has(this.currentMapId)) {
      this.customTemplates = this.cache.get(this.currentMapId)!;
      console.log('📋 Templates cargados desde cache:', this.customTemplates);
      return;
    }
    
    this.customTemplates = templateStorage.load(this.currentMapId);
    this.cache.set(this.currentMapId, this.customTemplates);
    console.log('📦 Templates cargados desde storage:', this.customTemplates);
  }

  getPredefinedTemplates() {
    return Object.entries(popupTemplates).map(([key, template]) => ({
      ...template,
      id: key,
      isCustom: false,
    }));
  }

  getCustomTemplates(): PopupTemplate[] {
    console.log('📋 PopupTemplatesManager.getCustomTemplates llamado', {
      currentMapId: this.currentMapId,
      templatesCount: this.customTemplates.length,
      templates: this.customTemplates.map(t => ({ id: t.id, name: t.name, isCustom: t.isCustom }))
    });
    return this.customTemplates;
  }

  getAllTemplates(): PopupTemplate[] {
    return [...this.getPredefinedTemplates(), ...this.customTemplates];
  }

  getTemplateById(id: string): PopupTemplate | undefined {
    return this.getAllTemplates().find(template => template.id === id);
  }

  createTemplate(templateData: Omit<PopupTemplate, 'id' | 'createdAt' | 'createdBy'>): PopupTemplate {
    console.log('🏗️ PopupTemplatesManager.createTemplate iniciado', templateData);
    
    const template: PopupTemplate = {
      ...templateData,
      id: this.generateId(),
      isCustom: true,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user', // TODO: Get from auth context
    };

    console.log('🆕 Template creado:', template);
    this.addCustomTemplate(template);
    console.log('💾 Template añadido y guardado');
    return template;
  }

  updateTemplate(templateId: string, updates: Partial<PopupTemplate>): PopupTemplate | null {
    const templateIndex = this.customTemplates.findIndex(t => t.id === templateId);
    if (templateIndex === -1) return null;

    const updatedTemplate: PopupTemplate = {
      name: this.customTemplates[templateIndex]?.name || '',
      description: this.customTemplates[templateIndex]?.description || '',
      icon: this.customTemplates[templateIndex]?.icon || '',
      colors: this.customTemplates[templateIndex]?.colors || [],
      size: this.customTemplates[templateIndex]?.size || { width: 400, minHeight: 300 },
      style: this.customTemplates[templateIndex]?.style || {} as PopupStyleConfig,
      layout: this.customTemplates[templateIndex]?.layout || {} as PopupLayoutConfig,
      ...this.customTemplates[templateIndex],
      ...updates,
      id: templateId, // Ensure ID doesn't change
    };

    this.customTemplates[templateIndex] = updatedTemplate;
    this.saveCustomTemplates();
    return updatedTemplate;
  }

  deleteTemplate(templateId: string): boolean {
    const templateIndex = this.customTemplates.findIndex(t => t.id === templateId);
    if (templateIndex === -1) return false;

    this.customTemplates.splice(templateIndex, 1);
    this.saveCustomTemplates();
    return true;
  }

  duplicateTemplate(templateId: string, newName?: string): PopupTemplate | null {
    const originalTemplate = this.getTemplateById(templateId);
    if (!originalTemplate) return null;

    const duplicatedTemplate = this.createTemplate({
      ...originalTemplate,
      name: newName || `${originalTemplate.name} (copia)`,
      description: `${originalTemplate.description} - Copia`,
    });

    return duplicatedTemplate;
  }

  validateTemplate(template: PopupTemplate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validación básica
    if (!template.name || template.name.trim().length === 0) {
      errors.push('El nombre del template es requerido');
    }

    if (!template.description || template.description.trim().length === 0) {
      errors.push('La descripción del template es requerida');
    }

    if (!template.colors || template.colors.length === 0) {
      errors.push('Se requiere al menos un color');
    }

    if (!template.size || template.size.width < 280 || template.size.width > 600) {
      errors.push('El ancho debe estar entre 280px y 600px');
    }

    if (!template.size || template.size.minHeight < 200 || template.size.minHeight > 800) {
      errors.push('La altura mínima debe estar entre 200px y 800px');
    }

    // Validación de colores (formato hexadecimal)
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    template.colors.forEach((color, index) => {
      if (!hexColorRegex.test(color)) {
        errors.push(`El color ${index + 1} no tiene un formato hexadecimal válido`);
      }
    });

    // Validación de contraste básico (WCAG 2.1 AA)
    if (template.style.header.background && template.style.header.textColor) {
      const contrast = this.calculateContrast(
        template.style.header.background,
        template.style.header.textColor
      );
      if (contrast < 4.5) {
        errors.push('El contraste del header no cumple con WCAG 2.1 AA (debe ser ≥ 4.5:1)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private calculateContrast(color1: string, color2: string): number {
    // Simplified contrast calculation for basic validation
    // In production, use a proper contrast ratio library
    const getLuminance = (hex: string) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = rgb & 0xff;
      
      const results = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      const [rs, gs, bs] = results;
      return 0.2126 * rs! + 0.7152 * gs! + 0.0722 * bs!;
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  private addCustomTemplate(template: PopupTemplate) {
    this.customTemplates.push(template);
    this.saveCustomTemplates();
  }

  private saveCustomTemplates() {
    console.log('💾 PopupTemplatesManager.saveCustomTemplates iniciado', {
      mapId: this.currentMapId,
      templatesCount: this.customTemplates.length,
      templates: this.customTemplates.map(t => ({ id: t.id, name: t.name }))
    });
    
    if (!this.currentMapId) {
      console.error('❌ No se puede guardar: sin currentMapId');
      return;
    }
    
    const success = templateStorage.save(this.currentMapId, this.customTemplates);
    console.log('💾 Resultado del save:', success);
    
    // Actualizar cache
    this.cache.set(this.currentMapId, [...this.customTemplates]);
    console.log('🗄️ Cache actualizado');
  }

  private generateId(): string {
    return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  exportTemplates(mapId?: string): string {
    const targetMapId = mapId || this.currentMapId;
    if (!targetMapId) return '';
    return templateStorage.export(targetMapId);
  }

  importTemplates(jsonData: string, mapId?: string): boolean {
    const targetMapId = mapId || this.currentMapId;
    if (!targetMapId) return false;
    
    const success = templateStorage.import(targetMapId, jsonData);
    if (success) {
      this.loadCustomTemplates();
    }
    return success;
  }
}

export const popupTemplatesManager = PopupTemplatesManager.getInstance();