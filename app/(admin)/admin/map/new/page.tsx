"use client";

import React from "react";
import { useMapData } from "./hooks/useMap";
import { MapSidebar } from "./components/MapSidebar";
import { MapContainer } from "./components/MapContainer";
import { fileUtils } from "./utils/fileUtils";
import { useQMLStyle } from "./hooks/useQMLStyle";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewMapPage() {
  const { mapData, updateMapData } = useMapData();
  const [selectedPopupTemplate, setSelectedPopupTemplate] = React.useState("moderno");
  const { 
    loading: qmlLoading, 
    error: qmlError, 
    style: qmlStyle, 
    loadQMLFile,
    applyStylesToMap,
    clearStyles 
  } = useQMLStyle();

  const handleGeoJsonUpload = fileUtils.createFileUploader((file) => {
    if (file) {
      fileUtils
        .readGeoJSONFile(file)
        .then((geoJson) => {
          updateMapData({ geoJson });
        });
    }
  });

  const handleQmlUpload = fileUtils.createFileUploader((file) => {
    if (file) {
      loadQMLFile(file);
    }
  });

  const handleSaveMap = () => {
    const result = fileUtils.saveMapData(mapData);
    
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
    <div className="h-screen bg-background flex">
      {/* Simple Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-b border-border/40">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Panel
              </Button>
            </Link>
            <span className="text-sm font-medium text-foreground">Crear Nuevo Mapa</span>
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
      </div>

      <div className="flex flex-1 pt-14">
        {/* Sidebar */}
        <div className="w-96 bg-background border-r border-border/40 overflow-y-auto">
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
          />
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer 
            className="h-full" 
            geoJson={mapData.geoJson} 
            qmlStyle={qmlStyle} 
            popupTemplate={selectedPopupTemplate}
          />
          
          {!mapData.geoJson && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-center space-y-4">
                <div className="text-muted-foreground">
                  Sube un archivo GeoJSON para visualizar el mapa
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}