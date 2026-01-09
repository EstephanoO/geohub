import QgisParser from "geostyler-qgis-parser";
import MapboxParser from "geostyler-mapbox-parser";
import xml2js from "xml2js";

/* =========================
   TYPES
========================= */

export interface QMLStyle {
  categorized?: Array<{
    id: string;
    filter: any;
    layers: any[];
  }>;
}

/* =========================
   PARSER
========================= */

export class QMLStyleParser {
  private qgisParser = new QgisParser();
  private mapboxParser = new MapboxParser();
  private qmlContent?: string;

  /* =========================
     QML → MAPBOX
  ========================= */

  async parseQML(qmlContent: string): Promise<QMLStyle> {
    this.qmlContent = qmlContent;

    const qgisResult = await this.qgisParser.readStyle(qmlContent);
    if (!qgisResult.output) {
      throw new Error("❌ QML inválido");
    }

    const geoStyle = qgisResult.output;
    const rules = geoStyle.rules ?? [];

    const categorized: QMLStyle["categorized"] = [];

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (!rule) continue;

      const safeSymbolizers =
        rule.symbolizers?.filter(
          (s: any) => s.kind === "Fill" || s.kind === "Line",
        ) ?? [];

      if (!safeSymbolizers.length) continue;

      const safeStyle = {
        ...geoStyle,
        rules: [{ ...rule, symbolizers: safeSymbolizers }],
      };

      try {
        const mapboxResult = await this.mapboxParser.writeStyle(safeStyle);
        const layers = mapboxResult.output?.layers ?? [];

        if (!layers.length) continue;

        categorized.push({
          id: `category-${i}`,
          filter: rule.filter,
          layers,
        });
      } catch (err) {
        console.warn("❌ Error convirtiendo regla", err);
      }
    }

    return categorized.length ? { categorized } : {};
  }

  /* =========================
     APPLY TO MAPLIBRE
  ========================= */

  applyStylesToMap(map: any, sourceId: string, styles: QMLStyle) {
    if (!styles.categorized) return;

    // limpiar capas previas
    map.getStyle()?.layers?.forEach((l: any) => {
      if (l.id.startsWith(sourceId) && map.getLayer(l.id)) {
        map.removeLayer(l.id);
      }
    });

    const outlines = this.extractOutlineStyles(this.qmlContent);

    styles.categorized.forEach((cat, i) => {
      cat.layers.forEach((layer: any) => {
        const layerId = `${sourceId}-${i}-${layer.type}`;

        const paint = { ...layer.paint };

        // 🔥 FIX TRANSPARENCIA REAL
        this.fixTransparency(layer.type, paint);

        // outline width desde QML
        if (layer.type === "line" && outlines[i]) {
          paint["line-width"] = outlines[i].width;
        }

        map.addLayer({
          id: layerId,
          type: layer.type,
          source: sourceId,
          filter: cat.filter ?? ["==", "$type", "Polygon"],
          paint,
          layout: {
            ...layer.layout,
            visibility: "visible",
          },
        });
      });
    });
  }

  /* =========================
     TRANSPARENCY FIX (REAL)
  ========================= */

  private fixTransparency(type: string, paint: Record<string, any>) {
    if (type === "fill") {
      this.extractRGBA(paint, "fill-color", "fill-opacity");
    }

    if (type === "line") {
      this.extractRGBA(paint, "line-color", "line-opacity");
    }
  }

  private extractRGBA(
    paint: Record<string, any>,
    colorKey: string,
    opacityKey: string,
  ) {
    const raw = paint[colorKey];

    if (typeof raw !== "string") return;
    if (!raw.includes(",")) return;

    const [r, g, b, a = 255] = raw.split(",").map(Number);

    paint[colorKey] = `rgb(${r}, ${g}, ${b})`;
    paint[opacityKey] = +(a / 255).toFixed(3);
  }

  /* =========================
     OUTLINE FROM QML
  ========================= */

  private extractOutlineStyles(
    qml?: string,
  ): Array<{ color: string; width: number }> {
    if (!qml) return [];

    const styles: Array<{ color: string; width: number }> = [];
    const symbols = qml.match(/<symbol[\s\S]*?<\/symbol>/g) ?? [];

    symbols.forEach((xml) => {
      const width = xml.match(/outline_width" value="([^"]+)"/)?.[1];
      if (width) {
        styles.push({
          color: "#000",
          width: parseFloat(width),
        });
      }
    });

    return styles;
  }

  /* =========================
     VALIDATION
  ========================= */

  validateQMLContent(content: string): boolean {
    try {
      xml2js.parseString(content, () => {});
      return true;
    } catch {
      return false;
    }
  }
}
