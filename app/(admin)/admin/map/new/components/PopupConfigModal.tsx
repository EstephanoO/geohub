"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Palette, Sparkles, Settings, Plus, Edit, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { PopupTemplate } from "../types";
import { popupTemplatesManager } from "../utils/popupTemplatesManager";
import { popupTemplates } from "./popup-templattes";
import TemplateEditorModal from "./TemplateEditorModal";
import { cleanupCorruptedData } from "../utils/templateStorage";

interface PopupConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
  mapId?: string;
}

export function PopupConfigModal({
  isOpen,
  onClose,
  selectedTemplate,
  onTemplateChange,
  mapId,
}: PopupConfigModalProps) {
  const [activeTab, setActiveTab] = useState<'predefined' | 'custom'>('predefined');
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PopupTemplate | undefined>();
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [customTemplates, setCustomTemplates] = useState<PopupTemplate[]>([]);

  // Memoizar templates para optimizar rendimiento
  const templates = useMemo(() => {
    if (!isOpen) return { predefined: [] as any[], custom: [] as PopupTemplate[], all: [] as any[] };
    
    const predefinedTemplates = Object.entries(popupTemplates).map(([key, template]) => ({
      ...template,
      id: key,
      isCustom: false,
    }));

    return {
      predefined: predefinedTemplates,
      custom: customTemplates,
      all: [...predefinedTemplates, ...customTemplates],
    };
  }, [isOpen, customTemplates]);

  useEffect(() => {
    console.log('🔄 PopupConfigModal.useEffect iniciado', { isOpen, mapId });
    
    if (isOpen && mapId) {
      // Limpiar datos corruptos antes de cargar
      cleanupCorruptedData(mapId);
      
      popupTemplatesManager.setMapId(mapId);
      const templates = popupTemplatesManager.getCustomTemplates();
      console.log('📋 Templates cargados en useEffect:', templates);
      setCustomTemplates(templates);
    }
  }, [isOpen, mapId]);

  const refreshTemplates = () => {
    console.log('🔄 PopupConfigModal.refreshTemplates iniciado', { mapId });
    
    if (mapId) {
      popupTemplatesManager.setMapId(mapId);
      
      // Debug info antes de obtener templates
      const debugInfo = (popupTemplatesManager as any).debugInfo();
      console.log('🐛 Debug info antes de obtener templates:', debugInfo);
      
      const templates = popupTemplatesManager.getCustomTemplates();
      console.log('📋 Templates obtenidos del manager:', templates);
      setCustomTemplates(templates);
      console.log('✅ Estado de customTemplates actualizado:', templates);
      
      // Debug info después de actualizar estado
      setTimeout(() => {
        console.log('🐛 Debug info después de actualizar estado:', (popupTemplatesManager as any).debugInfo());
      }, 100);
    } else {
      console.error('❌ No hay mapId disponible para refrescar templates');
    }
  };

  const handleCreateTemplate = (baseTemplateId?: string) => {
    setEditorMode('create');
    setEditingTemplate(undefined);
    setShowTemplateEditor(true);
  };

  const handleEditTemplate = (template: PopupTemplate) => {
    setEditorMode('edit');
    setEditingTemplate(template);
    setShowTemplateEditor(true);
  };

  const handleSaveTemplate = (template: PopupTemplate) => {
    console.log('🔧 PopupConfigModal.handleSaveTemplate iniciado', {
      templateName: template.name,
      editorMode,
      mapId,
      templateId: template.id
    });

    if (mapId) {
      popupTemplatesManager.setMapId(mapId);
      
      try {
        if (editorMode === 'create') {
          console.log('🔧 Creando nuevo template...', template);
          const createdTemplate = popupTemplatesManager.createTemplate(template);
          console.log('✅ Template creado:', createdTemplate);
        } else {
          console.log('🔧 Actualizando template...', template.id, template);
          const updatedTemplate = popupTemplatesManager.updateTemplate(template.id, template);
          console.log('✅ Template actualizado:', updatedTemplate);
        }
        
        console.log('🔄 Refrescando templates...');
        refreshTemplates();
        console.log('📊 Custom templates después de refrescar:', customTemplates);
        
        setShowTemplateEditor(false);
        console.log('🎉 Template guardado exitosamente');
      } catch (error) {
        console.error('❌ Error al guardar template:', error);
        alert('Error al guardar el template. Revisa la consola para más detalles.');
      }
    } else {
      console.error('❌ No hay mapId disponible');
      alert('Error: No se puede guardar el template sin un mapId');
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (mapId && window.confirm('¿Eliminar este template?')) {
      popupTemplatesManager.setMapId(mapId);
      popupTemplatesManager.deleteTemplate(templateId);
      refreshTemplates();
    }
  };

  const handleDuplicateTemplate = (templateId: string) => {
    if (mapId) {
      popupTemplatesManager.setMapId(mapId);
      popupTemplatesManager.duplicateTemplate(templateId);
      refreshTemplates();
    }
  };

  const currentTemplate = templates.all.find(t => t.id === selectedTemplate);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl shadow-2xl border w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header compacto */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Templates del Popup</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs minimalistas */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setActiveTab('predefined')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'predefined'
                  ? 'bg-background text-foreground shadow-sm border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Predefinidos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'custom'
                  ? 'bg-background text-foreground shadow-sm border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Personalizados
              {templates.custom.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0">
                  {templates.custom.length}
                </Badge>
              )}
            </button>
          </div>
          
          {activeTab === 'custom' && (
            <Button
              type="button"
              size="sm"
              onClick={() => handleCreateTemplate()}
              className="h-7 px-3 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Nuevo
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Predefined Templates */}
          {activeTab === 'predefined' && (
            <div className="p-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {templates.predefined.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-2 ${
                      selectedTemplate === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                    onClick={() => {
                      console.log('🖱️ Template predefinido seleccionado:', {
                        id: template.id,
                        name: template.name
                      });
                      onTemplateChange(template.id);
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg">{template.icon}</span>
                        {selectedTemplate === template.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <h3 className="font-medium text-sm mb-1">{template.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                      
                      {/* Mini preview */}
                      <div className="mt-2 h-12 rounded text-white text-xs flex items-center justify-center"
                           style={{
                             background: template.style.header.background,
                             borderRadius: template.style.borderRadius,
                           }}>
                        <span className="font-medium">Preview</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Custom Templates */}
          {activeTab === 'custom' && (
            <div className="p-4">
              {templates.custom.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                  <Settings className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-sm font-medium mb-1">Sin templates personalizados</h3>
                  <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto">
                    Crea tus propios templates para personalizar completamente el aspecto de los popups.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleCreateTemplate()}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Crear Primer Template
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {templates.custom.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-2 group ${
                        selectedTemplate === template.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                       onClick={() => {
                         console.log('🖱️ Template seleccionado:', {
                           id: template.id,
                           name: template.name,
                           isCustom: template.isCustom
                         });
                         onTemplateChange(template.id);
                       }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg">{template.icon}</span>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTemplate(template);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateTemplate(template.id);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          {selectedTemplate === template.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <h3 className="font-medium text-sm mb-1">{template.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                        
                        {/* Mini preview */}
                        <div className="mt-2 h-12 rounded text-white text-xs flex items-center justify-center"
                             style={{
                               background: template.style.header.background,
                               borderRadius: template.style.borderRadius,
                             }}>
                          <span className="font-medium">Preview</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer compacto */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground">
            {currentTemplate && (
              <span>Actual: <strong>{currentTemplate.name}</strong> 
                <Badge variant="outline" className="ml-1 text-xs">
                  {currentTemplate.isCustom ? 'Personalizado' : 'Predefinido'}
                </Badge>
              </span>
            )}
          </div>
          <Button onClick={onClose} size="sm">
            Aplicar
          </Button>
        </div>
      </div>

      {/* Template Editor Modal */}
      {showTemplateEditor && (
        <TemplateEditorModal
          template={editingTemplate!}
          mode={editorMode}
          baseTemplateId={editorMode === 'create' ? selectedTemplate || '' : ''}
          onSave={handleSaveTemplate}
          onClose={() => {
            setShowTemplateEditor(false);
            setEditingTemplate(undefined);
          }}
        />
      )}
    </div>
  );
}