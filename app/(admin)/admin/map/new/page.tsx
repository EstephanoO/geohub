"use client";

import React from "react";
import { useMapData } from "./hooks/useMap";
import { MapSidebar } from "./components/MapSidebar";
import { MapContainer } from "./components/MapContainer";
import { fileUtils } from "./utils/fileUtils";
import { useQMLStyle } from "./hooks/useQMLStyle";
import { popupTemplatesManager } from "./utils/popupTemplatesManager";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewMapPage() {
  const { mapData, updateMapData } = useMapData();
  const [selectedPopupTemplate, setSelectedPopupTemplate] =
    React.useState("moderno");
  const {
    loading: qmlLoading,
    error: qmlError,
    style: qmlStyle,
    loadQMLFile,
    applyStylesToMap,
    clearStyles,
  } = useQMLStyle();

  // Obtener templates personalizados para el mapa actual
  const getCustomTemplates = () => {
    if (mapData.id && typeof window !== 'undefined') {
      popupTemplatesManager.setMapId(mapData.id);
      return popupTemplatesManager.getCustomTemplates();
    }
    return [];
  };

  // Manejar cambios de template del popup
  const handlePopupTemplateChange = (template: string) => {
    setSelectedPopupTemplate(template);
  };

  const handleGeoJsonUpload = fileUtils.createFileUploader((file) => {
    if (file) {
      fileUtils.readGeoJSONFile(file).then((geoJson) => {
        updateMapData({ geoJson });
      });
    }
  });

  const handleQmlUpload = fileUtils.createFileUploader((file) => {
    if (file) {
      loadQMLFile(file);
    }
  });

  const handleSaveMap = async () => {
    const result = await fileUtils.saveMapData(mapData);

    if (result.success && result.mapId) {
      alert(`Mapa "${mapData.name}" guardado con ID: ${result.mapId}`);
      fileUtils.redirectToMap(result.mapId);
    } else {
      alert(result.error || "Error al guardar el mapa");
    }
  };

  const handleCancel = () => {
    fileUtils.redirectToAdmin();
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header fijo */}
      <header className="h-14 shrink-0 border-b border-border/40 bg-background/95 backdrop-blur z-40">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Panel
              </Button>
            </Link>
            <span className="text-sm font-medium">Crear nuevo mapa</span>
          </div>

          <Button
            variant="gold"
            size="sm"
            onClick={handleSaveMap}
            disabled={!mapData.name.trim() || !mapData.geoJson}
          >
            Guardar
          </Button>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[360px] shrink-0 border-r border-border/40">
          <MapSidebar
            mapData={mapData}
            onMapDataChange={updateMapData}
            onGeoJsonUpload={handleGeoJsonUpload}
            onQmlUpload={handleQmlUpload}
            onSaveMap={handleSaveMap}
            onCancel={handleCancel}
            qmlStyle={qmlStyle}
            qmlLoading={qmlLoading}
            qmlError={qmlError}
            selectedPopupTemplate={selectedPopupTemplate}
            onPopupTemplateChange={handlePopupTemplateChange}
          />
        </div>

        {/* Mapa */}
        <section className="relative flex-1">
          <MapContainer
            className="h-full"
            geoJson={mapData.geoJson}
            qmlStyle={qmlStyle}
            popupTemplate={selectedPopupTemplate}
            mapId={mapData.id}
            customTemplates={getCustomTemplates()}
          />

          {!mapData.geoJson && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <p className="text-sm text-muted-foreground">
                Sube un archivo GeoJSON para visualizar el mapa
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

