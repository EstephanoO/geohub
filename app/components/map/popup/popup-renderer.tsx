
// src/map/popup/PopupRenderer.tsx
import mapboxgl from "mapbox-gl";
import React from "react";
import { createRoot } from "react-dom/client";

/**
 * popupConfig shape:
 * {
 *   titleField?: string,
 *   subtitleField?: string,
 *   fieldsToShow: string[], // order matters
 *   footerField?: string,
 *   styles?: {
 *     titleColor?: string,
 *     headerBg?: string,
 *     rowBorder?: string
 *   }
 * }
 */

export function showFeaturePopup(
  map: mapboxgl.Map,
  lngLat: mapboxgl.LngLatLike,
  properties: Record<string, any>,
  popupConfig: any = {}
) {
  // create container element
  const container = document.createElement("div");
  container.className = "map-popup-root"; // for global custom css if needed

  // Use React to render a small component into the DOM element so we can style easily
  const root = createRoot(container);
  root.render(
    <PopupCard properties={properties} config={popupConfig} />
  );

  // show Mapbox popup
  new mapboxgl.Popup({ closeButton: true, closeOnClick: true, offset: 12 })
    .setLngLat(lngLat)
    .setDOMContent(container)
    .addTo(map);

  // cleanup will be handled by Mapbox when popup removed
}

/* Small presentational popup card (single-feature row mode) */
function PopupCard({ properties, config }: { properties: any; config: any }) {
  const title = config?.titleField ? properties[config.titleField] : null;
  const subtitle = config?.subtitleField ? properties[config.subtitleField] : null;
  const fields: string[] = config?.fieldsToShow ?? Object.keys(properties);

  const headerBg = config?.styles?.headerBg ?? "rgba(0,0,0,0.03)";
  const titleColor = config?.styles?.titleColor ?? "#111827";
  const rowBorder = config?.styles?.rowBorder ?? "rgba(0,0,0,0.06)";
  const highlightColor = config?.highlightColor ?? "#ef4444";

  // small helper to format numbers (thousands)
  const fmt = (v: any) =>
    typeof v === "number" ? v.toLocaleString() : String(v ?? "—");

  return (
    <div className="w-[320px] max-w-[90vw] font-sans bg-white rounded-lg shadow-lg overflow-hidden border"
      style={{ borderColor: "rgba(0,0,0,0.06)" }}
    >
      {/* Header */}
      <div className="p-4" style={{ background: headerBg }}>
        <div className="text-sm font-semibold" style={{ color: titleColor }}>
          {title ?? "—"}
        </div>
        {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
      </div>

      {/* Body: table rows */}
      <div className="p-0">
        {fields.map((f) => {
          const value = properties?.[f];
          const isBool = typeof value === "boolean";
          // If config has attributeStyles choose highlight
          const attrStyle = config?.attributeStyles?.[f];
          const showHighlight = isBool && attrStyle?.enabled && value === true;
          return (
            <div
              key={f}
              className="flex items-center justify-between px-4 py-3"
              style={{
                borderTop: `1px solid ${rowBorder}`,
                background: showHighlight ? `${attrStyle.color}10` : "transparent",
              }}
            >
              <div className="flex items-center gap-3">
                {isBool && attrStyle?.enabled ? (
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: attrStyle.color }}
                    title={f}
                  />
                ) : null}
                <div className="text-sm text-gray-700">{f}</div>
              </div>

              <div className="text-sm font-medium text-gray-900">
                {typeof value === "number" ? value.toLocaleString() : String(value ?? "—")}
                {(config?.percentFields ?? []).includes(f) ? <span className="text-xs text-gray-500 ml-2">%</span> : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {config?.footerField ? (
        <div className="px-4 py-2 text-xs text-gray-500 border-t" style={{ borderTop: `1px solid ${rowBorder}` }}>
          {String(properties[config.footerField] ?? "")}
        </div>
      ) : null}
    </div>
  );
}
