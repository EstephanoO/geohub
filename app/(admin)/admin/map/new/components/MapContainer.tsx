"use client";

import { useRef } from "react";
import { useMapLibre } from "../hooks/useMap";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapContainerProps {
  className?: string;
  geoJson?: any;
  qmlStyle?: any;
  popupTemplate?: string;
}

export function MapContainer({
  className = "",
  geoJson,
  qmlStyle,
  popupTemplate,
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
      <style jsx>{`
        :global(.maplibregl-popup) {
          position: absolute !important;
          z-index: 999999 !important;
        }

        :global(.maplibregl-popup-content) {
          background: white !important;
          color: black !important;
          padding: 10px !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
          border: 2px solid #5f85af !important;
          max-width: 300px !important;
          font-size: 13px !important;
          line-height: 1.4 !important;
          z-index: 999999 !important;
          font-weight: 500 !important;
        }

        :global(.maplibregl-popup-tip) {
          border-top-color: white !important;
          border-width: 8px !important;
          z-index: 999999 !important;
        }

        /* Dark mode popup styles */
        html.dark :global(.maplibregl-popup-content) {
          background: #1f2937 !important;
          color: white !important;
          border-color: #4f82a6 !important;
        }

        html.dark :global(.maplibregl-popup-tip) {
          border-top-color: #1f2937 !important;
        }

        /* Make sure popup is visible */
        :global(.map-popup) {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      `}</style>
    </>
  );
}

