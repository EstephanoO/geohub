"use client";

import { useState } from "react";
import { X, Palette, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { popupTemplates } from "./popup-templattes";

interface PopupConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
}

export function PopupConfigModal({
  isOpen,
  onClose,
  selectedTemplate,
  onTemplateChange,
}: PopupConfigModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Palette className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Personalización del Popup
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Template Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <Label className="text-base font-medium">
                Elige un Template Profesional
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(popupTemplates).map(([key, template]) => (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedTemplate === key
                      ? "ring-2 ring-primary/20 border-primary"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => onTemplateChange(key)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium flex items-center space-x-2">
                        <span>{template.icon}</span>
                        <span>{template.name}</span>
                      </CardTitle>
                      {selectedTemplate === key && (
                        <Badge variant="default" className="text-xs">
                          Activo
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">
                      {template.description}
                    </p>

                    {/* Preview */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium">Vista Previa:</div>
                      <div
                        className="p-3 rounded text-white text-xs"
                        style={{
                          background: template.style.header.background,
                          borderRadius: template.style.borderRadius,
                          border: `2px solid ${template.style.borderColor}`,
                        }}
                      >
                        <div
                          className="p-2 rounded"
                          style={{ background: template.style.background }}
                        >
                          <div className="font-medium">
                            📍 Distrito de Ejemplo
                          </div>
                          <div className="mt-1 space-y-1">
                            <div>
                              <strong>Población:</strong> 50,000
                            </div>
                            <div>
                              <strong>Área:</strong> 45 km²
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="text-xs font-medium">Colores:</div>
                    <div className="flex space-x-1">
                      {template.colors.map((color) => (
                        <div
                          key={color}
                          className="w-4 h-4 rounded border border-border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Current Selection */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="text-sm font-medium mb-2">Configuración Actual</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-medium">Template:</span>{" "}
                {
                  popupTemplates[
                    selectedTemplate as keyof typeof popupTemplates
                  ].name
                }
              </div>
              <div>
                <span className="font-medium">Fondo:</span>{" "}
                {
                  popupTemplates[
                    selectedTemplate as keyof typeof popupTemplates
                  ].style.background
                }
              </div>
              <div>
                <span className="font-medium">Header:</span>{" "}
                {
                  popupTemplates[
                    selectedTemplate as keyof typeof popupTemplates
                  ].style.header.background
                }
              </div>
              <div>
                <span className="font-medium">Borde:</span>{" "}
                {
                  popupTemplates[
                    selectedTemplate as keyof typeof popupTemplates
                  ].style.borderRadius
                }
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-xs text-muted-foreground space-y-2 pt-4 border-t">
            <div className="flex justify-between">
              <span>• Powered by Geoberna</span>
              <span>• v{process.env.NEXT_PUBLIC_VERSION || "1.0.0"}</span>
            </div>
            <div className="flex justify-between">
              <span>
                • Fecha:{" "}
                {new Date().toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span>• MapLibre GL JS</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end p-6 border-t space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-primary to-primary/90"
          >
            Aplicar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}

