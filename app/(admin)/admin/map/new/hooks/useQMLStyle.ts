import { useState, useCallback, useRef } from 'react';
import { QMLStyleParser, QMLStyle } from '../utils/qmlStyleParser';

interface UseQMLStyleReturn {
  loading: boolean;
  error: string | null;
  style: QMLStyle | null;
  loadQMLFile: (file: File) => Promise<void>;
  applyStylesToMap: (map: any, sourceId: string) => Promise<void>;
  clearStyles: () => void;
}

export const useQMLStyle = (): UseQMLStyleReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState<QMLStyle | null>(null);
  const parserRef = useRef<QMLStyleParser | null>(null);

  // Initialize parser on first use
  if (!parserRef.current) {
    parserRef.current = new QMLStyleParser();
  }

  const loadQMLFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    
    if (!parserRef.current) {
      setError('Parser no inicializado');
      setLoading(false);
      return;
    }
    
    try {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.qml')) {
        throw new Error('El archivo debe tener extensión .qml');
      }

      // Validate file size (max 5MB)
      const maxSizeInBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        throw new Error('El archivo es demasiado grande. El tamaño máximo es 5MB');
      }

      const content = await file.text();
      
      // Validate XML content
      if (!parserRef.current.validateQMLContent(content)) {
        throw new Error('El archivo no contiene XML válido');
      }

      console.log("📄 Reading QML file:", file.name);
      console.log("📊 File size:", (file.size / 1024).toFixed(2), 'KB');

      const parsedStyle = await parserRef.current.parseQML(content);
      setStyle(parsedStyle);
      
      console.log("✅ QML style loaded successfully:", parsedStyle);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al procesar el archivo QML';
      console.error("❌ Error loading QML file:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyStylesToMap = useCallback(async (map: any, sourceId: string) => {
    if (!style || !map || !parserRef.current) {
      throw new Error('No hay estilos cargados o mapa no disponible');
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🎨 Applying QML styles to map...");
      
      parserRef.current.applyStylesToMap(map, sourceId, style);
      
      console.log("✅ Styles applied successfully!");
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al aplicar estilos al mapa';
      console.error("❌ Error applying styles:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [style]);

  const clearStyles = useCallback(() => {
    setStyle(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    style,
    loadQMLFile,
    applyStylesToMap,
    clearStyles
  };
};