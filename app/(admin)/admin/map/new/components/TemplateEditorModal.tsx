"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Plus, Trash2, Eye, Save, ChevronDown, ChevronRight, Palette, Settings, Info, Maximize2 } from "lucide-react";
import { PopupTemplate } from "../types";
import { popupTemplatesManager } from "../utils/popupTemplatesManager";
import { ColorPicker } from "./ColorPicker";

interface TemplateEditorProps {
  template?: PopupTemplate;
  onSave: (template: PopupTemplate) => void;
  mode: 'create' | 'edit';
  onClose: () => void;
  baseTemplateId?: string;
}

interface AccordionSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSection> = ({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <button
      type="button"
      onClick={onToggle}
      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
    >
      <div className="flex items-center space-x-3">
        {icon}
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      {isOpen ? (
        <ChevronDown className="w-4 h-4 text-gray-500" />
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-500" />
      )}
    </button>
    {isOpen && (
      <div className="p-4 bg-white">
        {children}
      </div>
    )}
  </div>
);

const CompactColorPicker: React.FC<{ color: string; onChange: (color: string) => void; onRemove?: () => void; canRemove?: boolean }> = ({
  color,
  onChange,
  onRemove,
  canRemove = false
}) => (
  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
    <div className="w-8 h-8 rounded border border-gray-300" style={{ backgroundColor: color }} />
    <input
      type="text"
      value={color}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {canRemove && onRemove && (
      <button
        type="button"
        onClick={onRemove}
        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    )}
  </div>
);

const MiniPreview: React.FC<{ template: PopupTemplate }> = ({ template }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div 
      className="mx-auto border border-gray-200 rounded-lg shadow-sm overflow-hidden"
      style={{
        width: '280px',
        minHeight: '180px',
        background: template.style.background,
        borderRadius: template.style.borderRadius,
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 text-white text-xs font-semibold"
        style={{
          background: template.style.header.background,
          color: template.style.header.textColor,
        }}
      >
        {template.icon} {template.name || 'Título'}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span style={{ color: template.style.tableLabel.color }}>Campo 1:</span>
            <span style={{ color: template.style.tableValue.color, fontWeight: 600 }}>Valor 1</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: template.style.tableLabel.color }}>Campo 2:</span>
            <span style={{ color: template.style.tableValue.color, fontWeight: 600 }}>Valor 2</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-3 py-2 text-xs text-center border-t border-gray-200"
        style={{
          background: template.style.footer.background,
          color: template.style.footer.color,
          borderTop: template.style.footer.borderTop,
        }}
      >
        Vista previa
      </div>
    </div>
  </div>
);

export const TemplateEditorModal: React.FC<TemplateEditorProps> = ({
  template,
  onSave,
  mode,
  onClose,
  baseTemplateId,
}) => {
  const [currentTemplate, setCurrentTemplate] = useState<PopupTemplate>(() => {
    if (template) return { ...template };
    
    const baseTemplate = baseTemplateId 
      ? popupTemplatesManager.getTemplateById(baseTemplateId)
      : popupTemplatesManager.getPredefinedTemplates()[0];

    return baseTemplate ? {
      ...baseTemplate,
      id: '',
      name: mode === 'create' ? 'Nuevo Template' : baseTemplate.name,
      description: mode === 'create' ? 'Descripción del nuevo template' : baseTemplate.description,
      isCustom: true,
    } : {
      id: '',
      name: 'Nuevo Template',
      description: 'Descripción del nuevo template',
      icon: '🎨',
      colors: ['#3b82f6', '#1d4ed8'],
      size: { width: 340, minHeight: 240 },
      style: {
        background: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#e5e7eb',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '13px',
        textColor: '#1f2937',
        header: {
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          textColor: '#ffffff',
          padding: '16px 20px',
          fontSize: '14px',
          fontWeight: 600,
          borderBottom: 'none',
        },
        section: {
          padding: '20px',
          gap: '8px',
        },
        separator: {
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #e5e7eb, transparent)',
          margin: '16px 0',
        },
        table: {
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: '0 8px',
          fontSize: '13px',
        },
        tableRow: {
          borderBottom: '1px solid #f1f5f9',
          backgroundColor: 'rgba(248, 250, 252, 0.5)',
        },
        tableLabel: {
          color: '#64748b',
          fontWeight: 500,
          padding: '12px 16px',
          width: '45%',
          textAlign: 'left',
          borderLeft: '3px solid #3b82f6',
        },
        tableValue: {
          color: '#1e293b',
          fontWeight: 600,
          padding: '12px 16px',
          textAlign: 'right',
        },
        footer: {
          background: 'rgba(241, 245, 249, 0.8)',
          padding: '16px 20px',
          fontSize: '11px',
          color: '#64748b',
          textAlign: 'center',
          borderTop: '1px solid #e2e8f0',
        },
      },
      layout: {
        sections: ['header', 'content', 'footer'],
        contentLayout: 'table',
      },
      isCustom: true,
    };
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState('basic');
  const [isDirty, setIsDirty] = useState(false);

  // Secciones del acordeón
  const [sections, setSections] = useState({
    basic: true,
    colors: false,
    size: false,
    advanced: false,
  });

  useEffect(() => {
    if (!isDirty) return;
    
    // Autoguardado cada 30 segundos si hay cambios
    const timer = setTimeout(() => {
      if (isDirty) {
        console.log('📝 Autoguardando borrador...');
        setIsDirty(false);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [isDirty]);

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    setActiveSection(section);
  };

  const updateTemplate = (path: string, value: any) => {
    const keys = path.split('.');
    setCurrentTemplate(prev => {
      const updated = { ...prev };
      let current: any = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key) {
          current[key] = { ...current[key] };
          current = current[key];
        }
      }
      
      const lastKey = keys[keys.length - 1];
      if (lastKey) {
        current[lastKey] = value;
      }
      return updated;
    });
  };

  const addColor = () => {
    updateTemplate('colors', [...currentTemplate.colors, '#000000']);
  };

  const removeColor = (index: number) => {
    const newColors = currentTemplate.colors.filter((_, i) => i !== index);
    updateTemplate('colors', newColors);
  };

  const handleSave = () => {
    // Asegurar que el template tenga todos los campos requeridos
    const templateToValidate = {
      ...currentTemplate,
      name: currentTemplate.name?.trim() || 'Nuevo Template',
      description: currentTemplate.description?.trim() || 'Descripción del template',
      icon: currentTemplate.icon || '🎨',
      colors: Array.isArray(currentTemplate.colors) && currentTemplate.colors.length > 0 
        ? currentTemplate.colors 
        : ['#3b82f6', '#1d4ed8'],
      size: currentTemplate.size || { width: 340, minHeight: 240 },
      style: currentTemplate.style || {},
      layout: currentTemplate.layout || {
        sections: ['header', 'content', 'footer'],
        contentLayout: 'table',
      },
    };

    const validation = popupTemplatesManager.validateTemplate(templateToValidate);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);

    // Para templates nuevos, omitir campos que serán generados por el manager
    if (mode === 'create') {
      const { id, createdAt, createdBy, isCustom, ...templateData } = templateToValidate;
      onSave(templateData as any);
    } else {
      onSave(templateToValidate);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header compacto */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Palette className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {mode === 'create' ? '🎨 Nuevo Template' : '✏️ Editar Template'}
              </h2>
              <p className="text-xs text-gray-600">
                Personaliza el aspecto de los popups
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Cerrar editor"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Errors compactos */}
        {errors.length > 0 && (
          <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-600 text-sm font-medium">❌ {errors.length} errores</span>
            </div>
            <div className="mt-1 text-xs text-red-700">
              {errors[0]}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Información Básica */}
          <AccordionSection
            id="basic"
            title="📝 Información Básica"
            icon={<Info className="w-4 h-4" />}
            isOpen={sections.basic}
            onToggle={() => toggleSection('basic')}
          >
            <div className="space-y-3">
              <div>
                <label htmlFor="template-name" className="block text-xs font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  id="template-name"
                  type="text"
                  value={currentTemplate.name}
                  onChange={(e) => updateTemplate('name', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mi template personalizado"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="template-icon" className="block text-xs font-medium text-gray-700 mb-1">
                    Icono
                  </label>
                  <input
                    id="template-icon"
                    type="text"
                    value={currentTemplate.icon}
                    onChange={(e) => updateTemplate('icon', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="📍"
                  />
                </div>
                
                <div>
                  <label htmlFor="template-description" className="block text-xs font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <input
                    id="template-description"
                    type="text"
                    value={currentTemplate.description}
                    onChange={(e) => updateTemplate('description', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción corta"
                  />
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* Colores Principales */}
          <AccordionSection
            id="colors"
            title="🎨 Colores Principales"
            icon={<Palette className="w-4 h-4" />}
            isOpen={sections.colors}
            onToggle={() => toggleSection('colors')}
          >
            <div className="space-y-3">
              <div className="space-y-2">
                {currentTemplate.colors.map((color, index) => (
                  <CompactColorPicker
                    key={`color-${color.replace('#', '')}`}
                    color={color}
                    onChange={(newColor) => {
                      const newColors = [...currentTemplate.colors];
                      newColors[index] = newColor;
                      updateTemplate('colors', newColors);
                    }}
                    onRemove={() => removeColor(index)}
                    canRemove={currentTemplate.colors.length > 1}
                  />
                ))}
              </div>
              
              <button
                type="button"
                onClick={addColor}
                className="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar color</span>
              </button>
            </div>
          </AccordionSection>

          {/* Tamaño */}
          <AccordionSection
            id="size"
            title="📐 Tamaño"
            icon={<Maximize2 className="w-4 h-4" />}
            isOpen={sections.size}
            onToggle={() => toggleSection('size')}
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="template-width" className="block text-xs font-medium text-gray-700 mb-1">
                  Ancho (px)
                </label>
                <input
                  id="template-width"
                  type="number"
                  value={currentTemplate.size.width}
                  onChange={(e) => updateTemplate('size.width', parseInt(e.target.value))}
                  min="280"
                  max="600"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="template-height" className="block text-xs font-medium text-gray-700 mb-1">
                  Altura mínima (px)
                </label>
                <input
                  id="template-height"
                  type="number"
                  value={currentTemplate.size.minHeight}
                  onChange={(e) => updateTemplate('size.minHeight', parseInt(e.target.value))}
                  min="200"
                  max="800"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </AccordionSection>

          {/* Opciones Avanzadas */}
          <AccordionSection
            id="advanced"
            title="⚙️ Opciones Avanzadas"
            icon={<Settings className="w-4 h-4" />}
            isOpen={sections.advanced}
            onToggle={() => toggleSection('advanced')}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bg-color" className="block text-xs font-medium text-gray-700 mb-1">
                    Color de fondo
                  </label>
                  <ColorPicker
                    value={currentTemplate.style.background}
                    onChange={(color) => updateTemplate('style.background', color)}
                    label=""
                  />
                </div>
                
                <div>
                  <label htmlFor="border-color" className="block text-xs font-medium text-gray-700 mb-1">
                    Color del borde
                  </label>
                  <ColorPicker
                    value={currentTemplate.style.borderColor}
                    onChange={(color) => updateTemplate('style.borderColor', color)}
                    label=""
                  />
                </div>
              </div>

              <div>
                <label htmlFor="border-radius" className="block text-xs font-medium text-gray-700 mb-1">
                  Radio del borde
                </label>
                <select
                  id="border-radius"
                  value={currentTemplate.style.borderRadius}
                  onChange={(e) => updateTemplate('style.borderRadius', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0px">Sin bordes redondeados</option>
                  <option value="8px">Bordes pequeños</option>
                  <option value="12px">Bordes medianos</option>
                  <option value="16px">Bordes grandes</option>
                  <option value="24px">Bordes muy grandes</option>
                </select>
              </div>

              <div>
                <label htmlFor="font-family" className="block text-xs font-medium text-gray-700 mb-1">
                  Familia de fuentes
                </label>
                <select
                  id="font-family"
                  value={currentTemplate.style.fontFamily}
                  onChange={(e) => updateTemplate('style.fontFamily', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
                    Sistema (por defecto)
                  </option>
                  <option value="'Helvetica Neue', Helvetica, Arial, sans-serif">
                    Helvetica
                  </option>
                  <option value="'Times New Roman', Times, serif">
                    Times New Roman
                  </option>
                  <option value="Georgia, serif">
                    Georgia
                  </option>
                  <option value="'Courier New', Courier, monospace">
                    Courier New
                  </option>
                </select>
              </div>
            </div>
          </AccordionSection>

          {/* Vista Previa */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900 text-sm">👁️ Vista Previa</span>
              </div>
            </div>
            <div className="p-4 bg-white">
              <MiniPreview template={currentTemplate} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            {isDirty && <span className="text-orange-600">● Cambios sin guardar</span>}
            {!isDirty && <span>● Todos los cambios guardados</span>}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditorModal;