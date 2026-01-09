/* =========================
   POPUP STYLES MANAGER
   AP / ELECTORAL COMPACT STYLE
   ========================= */

import { popupTemplates } from "../components/popup-templattes";

/**
 * Aplica estilos CSS al popup basados en el template seleccionado
 */
export class PopupStyleManager {
  private static instance: PopupStyleManager;
  private styleElement: HTMLStyleElement | null = null;

  private constructor() {}

  static getInstance(): PopupStyleManager {
    if (!PopupStyleManager.instance) {
      PopupStyleManager.instance = new PopupStyleManager();
    }
    return PopupStyleManager.instance;
  }

  applyStyles(templateName: string): void {
    const template =
      popupTemplates[templateName as keyof typeof popupTemplates];

    if (!template) {
      console.warn(`Template "${templateName}" not found, using default`);
      this.applyDefaultStyles();
      return;
    }

    this.removeStyles();
    this.createStyleElement();
    this.injectTemplateStyles(templateName, template);
  }

  removeStyles(): void {
    if (this.styleElement?.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }

  private createStyleElement(): void {
    this.styleElement = document.createElement("style");
    this.styleElement.setAttribute("data-popup-styles", "true");
    document.head.appendChild(this.styleElement);
  }

  private injectTemplateStyles(templateName: string, template: any): void {
    if (!this.styleElement) return;
    this.styleElement.textContent = this.generateTemplateCSS(
      templateName,
      template,
    );
  }

  private generateTemplateCSS(templateName: string, template: any): string {
    const { size, style } = template;

    return `
/* ==========================================
   POPUP STYLES - AP COMPACT
   ========================================== */

.maplibregl-popup.popup-${templateName} {
  max-width: ${size.width}px;
  min-width: ${size.width * 0.75}px;
}

/* =========================
   POPUP CONTENT
   ========================= */
.maplibregl-popup.popup-${templateName} .maplibregl-popup-content {
  width: 100%;
  background: ${style.background};
  border: 1px solid ${style.borderColor};
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  font-size: 12px;
  line-height: 1.2;
  color: ${style.textColor};
  padding: 0;
  margin: 0;
  overflow: hidden;
  z-index: 999999 !important;
}

/* =========================
   HEADER (AP STYLE)
   ========================= */
.maplibregl-popup.popup-${templateName} .popup-header {
  padding: 8px 10px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #e5e7eb;
  background: ${style.header.background};
  color: ${style.header.textColor};
  text-align: left;
}

.maplibregl-popup.popup-${templateName} .popup-title {
  margin: 0;
  line-height: 1.1;
}

.maplibregl-popup.popup-${templateName} .popup-subtitle {
  display: none;
}

/* =========================
   SECTION
   ========================= */
.maplibregl-popup.popup-${templateName} .popup-section {
  padding: 4px 0;
}

/* =========================
   TABLE (COMPACT)
   ========================= */
.maplibregl-popup.popup-${templateName} .popup-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin: 0;
}

.maplibregl-popup.popup-${templateName} .popup-table tr {
  border-bottom: 1px solid #e5e7eb;
}

.maplibregl-popup.popup-${templateName} .popup-table tr:last-child {
  border-bottom: none;
}

.maplibregl-popup.popup-${templateName} .popup-table th {
  padding: 6px 8px;
  font-weight: 500;
  color: #374151;
  text-align: left;
  white-space: nowrap;
}

.maplibregl-popup.popup-${templateName} .popup-table td {
  padding: 6px 8px;
  font-weight: 600;
  color: #111827;
  text-align: right;
}

/* =========================
   COMPACT VARIANT (ULTRA)
   ========================= */
.maplibregl-popup.popup-${templateName} .popup-table.compact th,
.maplibregl-popup.popup-${templateName} .popup-table.compact td {
  padding: 4px 6px;
  font-size: 11.5px;
}

/* =========================
   DIVIDER
   ========================= */
.maplibregl-popup.popup-${templateName} .popup-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
  border: none;
}

/* =========================
   FOOTER (UPDATED DATE)
   ========================= */
.maplibregl-popup.popup-${templateName} .popup-footer {
  padding: 6px 8px;
  font-size: 11px;
  color: #6b7280;
  text-align: right;
  border-top: 1px solid #e5e7eb;
  background: ${style.footer.background};
}

/* =========================
   RESPONSIVE
   ========================= */
@media (max-width: 480px) {
  .maplibregl-popup.popup-${templateName} {
    max-width: 90vw;
    min-width: 260px;
  }

  .maplibregl-popup.popup-${templateName} .popup-table th,
  .maplibregl-popup.popup-${templateName} .popup-table td {
    padding: 5px 6px;
  }
}
`;
  }

  private applyDefaultStyles(): void {
    this.removeStyles();
    this.createStyleElement();
    if (!this.styleElement) return;

    this.styleElement.textContent = `
.maplibregl-popup-content {
  background: #ffffff;
  color: #111827;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-family: Inter, Arial, sans-serif;
  font-size: 12px;
}
`;
  }
}

/* =========================
   UTILITY FUNCTIONS
   ========================= */

export function applyPopupStyles(templateName: string): void {
  PopupStyleManager.getInstance().applyStyles(templateName);
}

export function clearPopupStyles(): void {
  PopupStyleManager.getInstance().removeStyles();
}

export function getTemplateCSS(templateName: string): string {
  const template = popupTemplates[templateName as keyof typeof popupTemplates];
  if (!template) return "";
  const manager = PopupStyleManager.getInstance();
  return (manager as any).generateTemplateCSS(templateName, template);
}

