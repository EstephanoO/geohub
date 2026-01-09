"use client";

import { useEffect, useState, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { 
  MapPin, 
  Search, 
  Plus, 
  Filter,
  Globe,
  Mountain,
  Compass
} from "lucide-react";

interface MapItem {
  id: string;
  name: string;
  description: string;
  category: string;
  lat: number;
  lng: number;
  zoom?: number;
}

// Mock data for map catalog
const mockMaps: MapItem[] = [
  {
    id: "1",
    name: "Mapa Base del Mundo",
    description: "Vista mundial con países y fronteras",
    category: "Político",
    lat: 20,
    lng: 0,
    zoom: 2
  },
  {
    id: "2", 
    name: "Relieve Terrestre",
    description: "Topografía y elevación del terreno",
    category: "Geográfico",
    lat: 40,
    lng: -100,
    zoom: 4
  },
  {
    id: "3",
    name: "Satélite Nocturno",
    description: "Imágenes satelitales nocturnas",
    category: "Satélite",
    lat: 30,
    lng: 0,
    zoom: 3
  },
  {
    id: "4",
    name: "Calles Urbanas",
    description: "Mapa detallado de calles urbanas",
    category: "Urbano",
    lat: 19.4326,
    lng: -99.1332,
    zoom: 10
  }
];

function MapWithSidebar({ showAdminControls = false }: { showAdminControls?: boolean }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [selectedMap, setSelectedMap] = useState<MapItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredMaps = mockMaps.filter(map => {
    const matchesSearch = map.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         map.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || map.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...new Set(mockMaps.map(map => map.category))];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
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
      center: selectedMap ? [selectedMap.lng, selectedMap.lat] : [-100, 40],
      zoom: selectedMap?.zoom || 4,
      pitch: 0,
      bearing: 0,
    });

    mapRef.current = map;

    // Add navigation control
    const nav = new maplibregl.NavigationControl();
    map.addControl(nav, 'top-left');

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [selectedMap]);

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">
              {showAdminControls ? "Admin - GeoHub" : "GeoHub Maps"}
            </h1>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar mapas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Categoría</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === "all" ? "Todos" : category}
              </option>
            ))}
          </select>
        </div>

        {/* Map Catalog */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-sm text-gray-600 mb-3">
            {filteredMaps.length} {filteredMaps.length === 1 ? "mapa encontrado" : "mapas encontrados"}
          </div>
          
          {filteredMaps.map(map => (
            <button
              key={map.id}
              type="button"
              onClick={() => setSelectedMap(map)}
              className={`w-full text-left p-4 border rounded-lg transition-all hover:shadow-md ${
                selectedMap?.id === map.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{map.name}</h3>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {map.category}
                </span>
              </div>
              <p className="text-sm text-gray-600">{map.description}</p>
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <MapPin className="h-3 w-3 mr-1" />
                {map.lat.toFixed(2)}, {map.lng.toFixed(2)}
              </div>
            </button>
          ))}
        </div>

        {/* Admin Controls */}
        {showAdminControls && (
          <div className="p-4 border-t border-gray-200">
            <button 
              type="button"
              onClick={() => {}}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Mapa</span>
            </button>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div 
          ref={mapContainerRef}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Map Info Overlay */}
        {selectedMap && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{selectedMap.name}</h3>
              <button
                type="button"
                onClick={() => setSelectedMap(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">{selectedMap.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center">
                <Compass className="h-3 w-3 mr-1" />
                {selectedMap.lat.toFixed(4)}, {selectedMap.lng.toFixed(4)}
              </span>
              <span className="flex items-center">
                <Mountain className="h-3 w-3 mr-1" />
                {selectedMap.category}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapWithSidebar;