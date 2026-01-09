"use client";

import { useState } from "react";
import { MapData, FileUploadHandler } from "../types";
import {
  ArrowLeft,
  Plus,
  X,
  Upload,
  Globe,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  FileText,
  Palette,
  Settings,
  Sparkles,
  Save,
  Trash2,
} from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import { Switch } from "@/app/components/ui/switch";
import { PopupConfigModal } from "./PopupConfigModal";
import { FileDropzone } from "./FileDropzone";

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
  selectedPopupTemplate?: string;
  onPopupTemplateChange?: (template: string) => void;
}

export function MapSidebar(props: MapSidebarProps) {
  const {
    mapData,
    onMapDataChange,
    onGeoJsonUpload,
    onQmlUpload,
    onSaveMap,
    onCancel,
    qmlStyle,
    qmlLoading,
    qmlError,
    selectedPopupTemplate = "moderno",
    onPopupTemplateChange = () => {},
  } = props;

  const [tagInput, setTagInput] = useState("");
  const [showPopupConfig, setShowPopupConfig] = useState(false);

  const addTag = () => {
    if (tagInput.trim() && !mapData.tags.includes(tagInput.trim())) {
      onMapDataChange({ tags: [...mapData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  return (
    <>
      <aside className="w-full lg:w-[360px] h-screen overflow-y-auto bg-black text-neutral-200 border-r border-neutral-800">
        <div className="px-5 py-4 space-y-6">
          {/* Header */}
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Crear mapa
              </h1>
              <p className="text-xs text-neutral-400">
                Configuración geográfica
              </p>
            </div>
          </header>

          {/* Información básica */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
              <Globe className="w-4 h-4 text-blue-500" />
              Información básica
            </div>

            <div className="space-y-2">
              <Label htmlFor="mapName">Nombre *</Label>
              <Input
                id="mapName"
                value={mapData.name}
                onChange={(e) => onMapDataChange({ name: e.target.value })}
                placeholder="Ej. Mapa de zonas"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mapDescription">Descripción</Label>
              <Textarea
                id="mapDescription"
                rows={3}
                value={mapData.description}
                onChange={(e) =>
                  onMapDataChange({ description: e.target.value })
                }
                className="resize-none"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Etiquetas</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  placeholder="Agregar etiqueta"
                  className="h-10"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={addTag}
                  aria-label="Agregar etiqueta"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {mapData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {mapData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="flex items-center gap-1 border-neutral-700 hover:border-yellow-500"
                    >
                      {tag}
                      <button
                        type="button"
                        aria-label={`Eliminar etiqueta ${tag}`}
                        onClick={() =>
                          onMapDataChange({
                            tags: mapData.tags.filter((t) => t !== tag),
                          })
                        }
                        className="ml-1 rounded hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Visibilidad */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="visibility">Visibilidad pública</Label>
                <p className="text-xs text-neutral-400">
                  Permite que otros vean este mapa
                </p>
              </div>
              <Switch
                id="visibility"
                checked={mapData.isVisible}
                onCheckedChange={(v) => onMapDataChange({ isVisible: v })}
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              {mapData.isVisible ? (
                <>
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-400">Mapa público</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-400">Mapa privado</span>
                </>
              )}
            </div>
          </section>

          {/* Archivos */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Upload className="w-4 h-4 text-blue-500" />
              Archivos
            </div>

            {/* GeoJSON */}
            <div className="space-y-2">
              <Label>GeoJSON *</Label>

              <FileDropzone
                label="GeoJSON"
                accept=".json,.geojson"
                loaded={!!mapData.geoJson}
                helperText="Archivo .geojson o .json"
                onFileSelect={(file) =>
                  onGeoJsonUpload({
                    target: { files: [file] },
                  } as any)
                }
              />
              {mapData.geoJson ? (
                <Badge className="bg-yellow-500/10 text-yellow-400">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Cargado
                </Badge>
              ) : (
                <Badge variant="outline">
                  <XCircle className="w-3 h-3 mr-1" />
                  No cargado
                </Badge>
              )}
            </div>

            {/* QML */}
            <div className="space-y-2">
              <Label>QML (opcional)</Label>
              <FileDropzone
                label="Estilos QML (opcional)"
                accept=".qml"
                loaded={!!mapData.qml && !qmlError}
                loading={qmlLoading || false}
                error={!!qmlError}
                helperText="Archivo .qml desde QGIS"
                onFileSelect={(file) =>
                  onQmlUpload({
                    target: { files: [file] },
                  } as any)
                }
              />
              {qmlLoading && <Badge variant="outline">Cargando…</Badge>}
              {qmlError && <Badge variant="destructive">Error</Badge>}
              {mapData.qml && !qmlError && (
                <Badge className="bg-blue-500/10 text-blue-400">
                  <Palette className="w-3 h-3 mr-1" />
                  Estilos cargados
                </Badge>
              )}
            </div>
          </section>

          {/* Popup */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Popup
            </div>
            <div className="space-y-2">
              <Button variant="outline" onClick={() => setShowPopupConfig(true)} className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Configurar popup
              </Button>
              <div className="text-xs text-muted-foreground px-1">
                Template actual: <span className="font-medium">{selectedPopupTemplate}</span>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="pt-4 space-y-3">
            <Button
              variant="gold"
              disabled={!mapData.name || !mapData.geoJson}
              onClick={onSaveMap}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar mapa
            </Button>

            <Button variant="outline" onClick={onCancel}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </aside>

      <PopupConfigModal
        isOpen={showPopupConfig}
        onClose={() => setShowPopupConfig(false)}
        selectedTemplate={selectedPopupTemplate}
        onTemplateChange={onPopupTemplateChange}
        mapId={mapData.id}
      />
    </>
  );
}

