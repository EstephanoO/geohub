import QgisParser from "geostyler-qgis-parser";
import MapboxParser from "geostyler-mapbox-parser";
import xml2js from "xml2js";

export interface QMLStyle {
  fill?: any;
  line?: any;
  symbol?: any;
  categorized?: any[];
}

export class QMLStyleParser {
  private qgisParser = new QgisParser();
  private mapboxParser = new MapboxParser();
  private qmlContent?: string;

  /* -------------------- PARSE QML -------------------- */

  async parseQML(qmlContent: string): Promise<QMLStyle> {
    try {
      console.log("🔄 Parsing QML with GeoStyler...");
      this.qmlContent = qmlContent;

      const qgisResult = await this.qgisParser.readStyle(qmlContent);
      if (!qgisResult.output) {
        throw new Error("No se pudo parsear el estilo QML");
      }

      console.log("✅ QML → GeoStyler:", qgisResult.output);

      const mapboxResult = await this.mapboxParser.writeStyle(
        qgisResult.output,
      );

      if (!mapboxResult.output) {
        throw new Error("No se pudo convertir a formato Mapbox");
      }

      console.log("✅ GeoStyler → Mapbox:", mapboxResult.output);

      return this.parseLayers(mapboxResult.output, qmlContent);
    } catch (error) {
      console.error("❌ Error parsing QML:", error);
      throw new Error(
        `Error parsing QML: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /* -------------------- PARSE LAYERS -------------------- */

  private parseLayers(mapboxStyle: any, qmlContent?: string): QMLStyle {
    const style: QMLStyle = {};
    const layers = mapboxStyle?.layers;

    if (!Array.isArray(layers)) return style;

    const allLayers = layers;
    console.log("🔍 Total layers found:", allLayers.length);

    /* -------- CATEGORIZED -------- */

    // GeoStyler ya crea las capas line con el grosor correcto del QML
    // Solo necesitamos agruparlas por categoría
    const categorizedLayers: any[] = [];
    const categoryMap = new Map();

    allLayers.forEach((layer: any) => {
      // Extraer el índice de la categoría del ID (ej: r0_sy0_st0 -> categoría 0)
      const categoryMatch = layer.id.match(/^r(\d+)_/);
      if (categoryMatch) {
        const categoryIndex = parseInt(categoryMatch[1]);
        
        if (!categoryMap.has(categoryIndex)) {
          categoryMap.set(categoryIndex, []);
        }
        
        categoryMap.get(categoryIndex).push(layer);
      }
    });

    // Ordenar categorías y crear el estilo
    const sortedCategories = Array.from(categoryMap.entries()).sort((a, b) => a[0] - b[0]);
    
    if (sortedCategories.length > 1) {
      style.categorized = sortedCategories.map(([categoryIndex, categoryLayers]: [number, any[]]) => {
        // Combinar todas las capas de esta categoría (fill + line)
        const combinedStyle = {
          id: `category-${categoryIndex}`,
          type: "group", // Tipo especial para indicar que es un grupo
          filter: categoryLayers[0]?.filter,
          layers: categoryLayers.map(layer => ({
            id: layer.id,
            type: layer.type,
            paint: layer.paint,
            layout: layer.layout ?? {},
          })),
        };
        
        return combinedStyle;
      });

      return style;
    }

    /* -------- SINGLE STYLE -------- */

    layers.forEach((layer: any) => {
      switch (layer.type) {
        case "fill":
          style.fill = {
            type: "fill",
            paint: layer.paint ?? {},
            layout: layer.layout ?? {},
          };
          break;

        case "line":
          style.line = {
            type: "line",
            paint: layer.paint ?? {},
            layout: layer.layout ?? {},
          };
          break;

        case "circle":
        case "symbol":
          style.symbol = {
            type: layer.type,
            paint: layer.paint ?? {},
            layout: layer.layout ?? {},
          };
          break;
      }
    });

    return style;
  }

  /* -------------------- APPLY TO MAP -------------------- */

  applyStylesToMap(map: any, sourceId: string, styles: QMLStyle): void {
    try {
      console.log("🎨 Applying styles...");

      const removeLayer = (id: string) => {
        if (map.getLayer(id)) map.removeLayer(id);
      };

      removeLayer(`${sourceId}-fill`);
      removeLayer(`${sourceId}-line`);
      removeLayer(`${sourceId}-symbol`);

      styles.categorized?.forEach((_, i) => {
        removeLayer(`${sourceId}-cat-fill-${i}`);
        removeLayer(`${sourceId}-cat-line-${i}`);
      });

      /* -------- CATEGORIZED -------- */

      if (styles.categorized) {
        console.log("🔍 Applying categorized styles...");
        const outlines = this.extractOutlineStyles(this.qmlContent);
        
        styles.categorized.forEach((categoryGroup, i) => {
          console.log(`📂 Processing category ${i}:`, categoryGroup);
          
          // Cada categoría puede tener múltiples capas (fill + line)
          categoryGroup.layers?.forEach((layer: any) => {
            const layerId = `${sourceId}-cat-${layer.id}`;
            
            let paint = { ...layer.paint };
            
            // Si es una capa line y tenemos el grosor del QML, sobreescribirlo
            if (layer.type === "line" && outlines[i]) {
              const qmlWidth = outlines[i].width;
              const originalWidth = paint["line-width"];
              paint["line-width"] = qmlWidth;
              console.log(`🎨 Line layer ${layerId} - line-width: ${originalWidth} → ${qmlWidth}px (from QML)`);
            }
            
            console.log(`🎨 Adding layer ${layerId}:`, layer.type, paint);
            
            map.addLayer({
              id: layerId,
              type: layer.type,
              source: sourceId,
              filter: categoryGroup.filter ?? ["==", "$type", "Polygon"],
              paint: paint,
              layout: {
                ...layer.layout,
                visibility: "visible"
              },
            });
          });
        });
        return;
      }

      /* -------- NORMAL -------- */

      if (styles.fill) {
        const outlines = this.extractOutlineStyles(this.qmlContent);
        const outline = outlines[0];

        // FILL layer (sin outline)
        const fillPaint = { ...styles.fill.paint };
        delete fillPaint["fill-outline-color"]; // Eliminar completamente outline del fill
        
        map.addLayer({
          id: `${sourceId}-fill`,
          type: "fill",
          source: sourceId,
          filter: ["==", "$type", "Polygon"],
          paint: fillPaint,
        });

        // LINE layer para el borde si existe
        if (outline) {
          map.addLayer({
            id: `${sourceId}-line`,
            type: "line",
            source: sourceId,
            filter: ["==", "$type", "Polygon"],
            paint: {
              "line-color": outline.color,
              "line-width": outline.width,
              "line-join": "round",
              "line-cap": "round",
            },
          });
        }
      }

      if (styles.line) {
        map.addLayer({
          id: `${sourceId}-line`,
          type: "line",
          source: sourceId,
          filter: [
            "any",
            ["==", "$type", "Polygon"],
            ["==", "$type", "LineString"],
          ],
          paint: styles.line.paint,
        });
      }

      if (styles.symbol) {
        map.addLayer({
          id: `${sourceId}-symbol`,
          type: styles.symbol.type,
          source: sourceId,
          filter: ["==", "$type", "Point"],
          paint: styles.symbol.paint,
          layout: styles.symbol.layout,
        });
      }

      console.log("✅ Styles applied");
    } catch (error) {
      console.error("❌ Error applying styles:", error);
    }
  }

  /* -------------------- OUTLINE EXTRACTION -------------------- */

  private extractOutlineStyles(
    qml?: string,
  ): Array<{ color: string; width: number }> {
    if (!qml) return [];

    const styles: Array<{ color: string; width: number }> = [];
    const symbols = qml.match(/<symbol[\s\S]*?<\/symbol>/g) ?? [];

    symbols.forEach((xml) => {
      const color = xml.match(/outline_color" value="([^"]+)"/)?.[1];
      const width = xml.match(/outline_width" value="([^"]+)"/)?.[1];

      if (color && width) {
        const widthValue = parseFloat(width);
        styles.push({
          color: `rgba(${color})`,
          width: widthValue,
        });
        console.log(`🎯 Extracted outline - Color: rgba(${color}), Width: ${widthValue}px`);
      }
    });

    console.log(`📋 Total outlines extracted: ${styles.length}`, styles);
    return styles;
  }

  /* -------------------- VALIDATION -------------------- */

  validateQMLContent(content: string): boolean {
    try {
      xml2js.parseString(content, () => {});
      return true;
    } catch {
      return false;
    }
  }
}

