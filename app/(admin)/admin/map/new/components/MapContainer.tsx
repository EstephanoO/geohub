"use client";

import { useRef } from "react";
import { useMapLibre } from "../hooks/useMap";
import { PopupTemplate } from "../types";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapContainerProps {
  className?: string;
  geoJson?: any;
  qmlStyle?: any;
  popupTemplate?: string;
  mapId?: string;
  customTemplates?: PopupTemplate[];
}

export function MapContainer({
  className = "",
  geoJson,
  qmlStyle,
  popupTemplate,
  mapId,
  customTemplates,
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  useMapLibre(
    mapContainerRef as React.RefObject<HTMLDivElement>,
    geoJson,
    qmlStyle,
    popupTemplate,
  );

  return (
    <>
      <div className={`relative ${className}`}>
        <div
          ref={mapContainerRef}
          className="w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />
      </div>

    </>
  );
}

