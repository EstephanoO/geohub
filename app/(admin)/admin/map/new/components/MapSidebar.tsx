"use client";

import { useState } from "react";
import { MapData, FileUploadHandler } from "../types";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { PopupConfigModal } from "./PopupConfigModal";
import {
  Save,
  Eye,
  EyeOff,
  X,
  Plus,
  Upload,
  Globe,
  Layers,
  CheckCircle,
  XCircle,
  ArrowLeft,
  FileText,
  Palette,
  Settings,
  Sparkles
} from "lucide-react";

interface MapSidebarProps {
  mapData: MapData;
  onMapDataChange: (updates: Partial<MapData>) => void;
  onGeoJsonUpload: FileUploadHandler;
  onQmlUpload: FileUploadHandler;
  onSaveMap: () => void;
  onCancel: () => void;
  qmlStyle?: any;
  qmlLoading?: boolean;
  qmlError?: string | null;
}

export function MapSidebar({
  mapData,
  onMapDataChange,
  onGeoJsonUpload,
  onQmlUpload,
  onSaveMap,
  onCancel,
  qmlStyle,
  qmlLoading,
  qmlError,
}: MapSidebarProps) {
  const [tagInput, setTagInput] = useState("");
  const [showPopupConfig, setShowPopupConfig] = useState(false);
  const [selectedPopupTemplate, setSelectedPopupTemplate] = useState("moderno");

  const addTag = () => {
    if (tagInput.trim() && !mapData.tags.includes(tagInput.trim())) {
      onMapDataChange({
        tags: [...mapData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onMapDataChange({
      tags: mapData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleClearGeoJson = () => {
    onMapDataChange({ geoJson: undefined });
  };

  return (
    <>
      <div className="w-full lg:w-96 bg-background border-r border-border/40 h-screen overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">Crear Mapa</h1>
              <p className="text-sm text-muted-foreground">Configura tu mapa geográfico</p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div> 

          {/* Basic Information Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Globe className="h-5 w-5 text-primary" />
                <span>Información Básica</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mapName" className="text-sm font-medium">
                  Nombre del Mapa *
                </Label>
                <Input
                  id="mapName"
                  value={mapData.name}
                  onChange={(e) => onMapDataChange({ name: e.target.value })}
                  placeholder="Ej: Mapa de la Ciudad"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mapDescription" className="text-sm font-medium">
                  Descripción
                </Label>
                <Textarea
                  id="mapDescription"
                  value={mapData.description}
                  onChange={(e) => onMapDataChange({ description: e.target.value })}
                  rows={3}
                  placeholder="Describe el contenido y propósito de este mapa..."
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagInput" className="text-sm font-medium">
                  Etiquetas
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="tagInput"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                    placeholder="Agregar etiqueta..."
                    className="flex-1 h-11"
                  />
                  <Button 
                    type="button" 
                    onClick={addTag}
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {mapData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {mapData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1 hover:bg-accent"
                      >
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeTag(tag)}
                          className="h-4 w-4 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Visibility Settings */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Eye className="h-5 w-5 text-accent" />
                <span>Visibilidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="visibility" className="text-sm font-medium">
                    Visible para invitados
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Permitir que cualquier persona pueda ver este mapa
                  </p>
                </div>
                <Switch
                  id="visibility"
                  checked={mapData.isVisible}
                  onCheckedChange={(checked: boolean) => onMapDataChange({ isVisible: checked })}
                />
              </div>

              <div className="flex items-center justify-center p-4 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-center space-x-2 text-sm">
                  {mapData.isVisible ? (
                    <>
                      <Eye className="h-4 w-4 text-accent" />
                      <span className="text-accent font-medium">Mapa Público</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 text-primary" />
                      <span className="text-primary font-medium">Mapa Privado</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Uploads */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Upload className="h-5 w-5 text-primary" />
                <span>Archivos de Datos</span>
              </CardTitle>
              <CardDescription>
                Sube tus archivos GeoJSON y estilos QML
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="geoJsonFile" className="text-sm font-medium">
                    GeoJSON *
                  </Label>
                  {mapData.geoJson && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearGeoJson}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-6 px-2"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Limpiar
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="geoJsonFile"
                    type="file"
                    accept=".json,.geojson"
                    onChange={onGeoJsonUpload}
                    className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Formatos soportados: .json, .geojson (máx. 10MB)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qmlFile" className="text-sm font-medium">
                  QML (Opcional)
                </Label>
                <div className="relative">
                  <Input
                    id="qmlFile"
                    type="file"
                    accept=".qml"
                    onChange={onQmlUpload}
                    className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-foreground hover:file:bg-accent/90"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Formatos soportados: .qml (máx. 5MB)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card variant="glass">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Layers className="h-5 w-5 text-primary" />
                <span>Estado del Mapa</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">GeoJSON</span>
                </div>
                {mapData.geoJson ? (
                  <div className="flex items-center space-x-2">
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {mapData.geoJson.type === 'FeatureCollection' ? `${mapData.geoJson.features?.length || 0} features` : mapData.geoJson.type}
                    </Badge>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-xs text-destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    No cargado
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">QML</span>
                </div>
                <div className="flex items-center space-x-2">
                  {qmlLoading ? (
                    <Badge variant="outline" className="text-xs">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
                      Cargando...
                    </Badge>
                  ) : qmlError ? (
                    <Badge variant="destructive" className="text-xs">
                      <XCircle className="w-3 h-3 mr-1" />
                      Error
                    </Badge>
                  ) : mapData.qml ? (
                    <div className="flex items-center space-x-2">
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Cargado
                      </Badge>
                      {qmlStyle && (
                        <div className="text-xs text-muted-foreground">
                          {Object.keys(qmlStyle).length} estilos
                        </div>
                      )}
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      <XCircle className="w-3 h-3 mr-1" />
                      Opcional
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Visibilidad</span>
                </div>
                <Badge variant={mapData.isVisible ? "secondary" : "outline"} className="text-xs">
                  {mapData.isVisible ? "🌐 Público" : "🔒 Privado"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Popup Settings */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>Personalización del Popup</span>
              </CardTitle>
              <CardDescription>
                Configura cómo se ven los popup al hacer hover
              </CardDescription>
            </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Template actual: <span className="font-medium">{selectedPopupTemplate}</span>
            </div>
            <Button 
              onClick={() => setShowPopupConfig(true)}
              variant="outline"
              className="w-full"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurar Popup Profesional
            </Button>
          </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button 
              onClick={onSaveMap}
              disabled={!mapData.name.trim() || !mapData.geoJson}
              variant="gold"
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar Mapa
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="w-full h-12"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Panel
            </Button>
          </div>
        </div>
      </div>

      {/* Popup Configuration Modal */}
      <PopupConfigModal
        isOpen={showPopupConfig}
        onClose={() => setShowPopupConfig(false)}
        selectedTemplate={selectedPopupTemplate}
        onTemplateChange={setSelectedPopupTemplate}
      />
    </>
  );
}