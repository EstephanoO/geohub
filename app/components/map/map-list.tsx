"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { MapIcon, Eye, Calendar, Layers } from "lucide-react";
import { apiClient } from "@/app/services/api";

interface Map {
  id: number;
  name: string;
  description?: string;
  fileName: string;
  featureCount: number;
  bounds?: number[];
  createdAt: string;
}

interface MapListProps {
  onMapSelect?: (map: Map) => void;
  selectedMapId?: number | null;
}

export function MapList({ onMapSelect, selectedMapId }: MapListProps) {
  const [maps, setMaps] = useState<Map[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar mapas desde la API
  useEffect(() => {
    const loadMaps = async () => {
      try {
        setLoading(true);
        console.log("🗺️ Cargando mapa con ID:", 10);
        
        // Como tu API no tiene /api/maps, voy a intentar obtener el mapa que guardamos
        // Por ahora voy a crear un mapa de prueba con el ID que conocemos
        const testMap: Map = {
          id: 10,
          name: "Test GeoHub Integration",
          description: "Prueba de conexión con API Fastify",
          fileName: "test.geojson",
          featureCount: 2,
          bounds: [-77.0365, 38.8977, -77.0355, 38.8987],
          createdAt: new Date().toISOString()
        };
        
        setMaps([testMap]);
        
        // TODO: Cuando tengas el endpoint /api/maps implementado, usa esto:
        // const response = await apiClient.getMaps();
        // setMaps(response.maps || []);
        
      } catch (err) {
        console.error("Error loading maps:", err);
        setError("No se pudieron cargar los mapas");
      } finally {
        setLoading(false);
      }
    };

    loadMaps();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-muted-foreground">Cargando mapas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-red-500">{error}</div>
      </div>
    );
  }

  if (maps.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-muted-foreground">
          No hay mapas disponibles. Sube tu primer GeoJSON.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapIcon className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Mapas Disponibles</h3>
        <Badge variant="secondary">{maps.length}</Badge>
      </div>

      <div className="space-y-3">
        {maps.map((map) => (
          <Card 
            key={map.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedMapId === map.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onMapSelect?.(map)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{map.name}</CardTitle>
                  {map.description && (
                    <p className="text-sm text-muted-foreground">
                      {map.description}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  ID: {map.id}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    <span>{map.featureCount} features</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(map.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMapSelect?.(map);
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
              </div>

              {map.fileName && (
                <div className="mt-2 text-xs text-muted-foreground">
                  📄 {map.fileName}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}