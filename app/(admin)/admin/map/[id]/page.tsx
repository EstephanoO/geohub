"use client";

import { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Eye, 
  EyeOff,
  Download,
  ArrowLeft,
  Copy,
  ExternalLink
} from "lucide-react";

interface MapData {
  id: string;
  name: string;
  description: string;
  tags: string[];
  geoJson?: any;
  qml?: string;
  isVisible: boolean;
  createdDate: string;
}

const mockMaps: MapData[] = [
  {
    id: "map_test_123456789_abc",
    name: "Mapa de Prueba",
    description: "Mapa de ejemplo del sistema",
    tags: ["demo", "prueba"],
    geoJson: {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {
            "name": "Punto de Interés",
            "description": "Ubicación importante"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [-74.0060, 40.7128]
          }
        }
      ]
    },
    isVisible: true,
    createdDate: "2026-01-08"
  }
];

export default function MapViewerPage() {
  const params = useParams();
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  
  const mapId = params?.id as string;
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const foundMap = mockMaps.find(map => map.id === mapId);
    setMapData(foundMap || null);
    setLoading(false);
  }, [mapId]);

  useEffect(() => {
    if (!mapContainerRef.current || !mapData) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            layout: { visibility: 'visible' }
          }
        ]
      },
      center: [-74.0060, 40.7128],
      zoom: 5,
    });

    if (mapData.geoJson) {
      map.addSource('map-data', {
        type: 'geojson',
        data: mapData.geoJson
      });

      map.addLayer({
        id: 'map-data-layer',
        type: 'circle',
        source: 'map-data',
        paint: {
          'circle-radius': 6,
          'circle-color': '#3B82F6',
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });
    }

    mapRef.current = map;

    const nav = new maplibregl.NavigationControl();
    map.addControl(nav, 'top-right');

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapData]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/map/${mapId}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    if (!mapData?.geoJson) return;
    
    const dataStr = JSON.stringify(mapData.geoJson, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `${mapData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.geojson`);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!mapData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-8">
          <div className="mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-xl font-bold mb-2">Mapa No Encontrado</h1>
          <p className="text-muted-foreground mb-4">El mapa no existe o no está disponible.</p>
          <Button onClick={() => router.push("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Panel
            </Button>
            <span className="font-medium text-foreground">{mapData.name}</span>
            <Badge variant={mapData.isVisible ? "secondary" : "outline"}>
              {mapData.isVisible ? (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Público
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Privado
                </>
              )}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {copySuccess ? (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Compartir
                </>
              )}
            </Button>
            
            {mapData.geoJson && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div 
          ref={mapContainerRef}
          className="w-full h-full"
        />
        
        {/* Map Info */}
        <div className="absolute bottom-4 left-4 max-w-sm">
          <Card className="p-4">
            <CardContent className="p-0">
              <h3 className="font-semibold text-foreground mb-2">{mapData.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{mapData.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creado:</span>
                  <span>{mapData.createdDate}</span>
                </div>
                {mapData.tags.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Etiquetas:</span>
                    <span>{mapData.tags.join(", ")}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}