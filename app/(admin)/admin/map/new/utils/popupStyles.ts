/* =========================
   POPUP STYLES MANAGER
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

  /**
   * Aplica estilos del template al DOM
   */
  applyStyles(templateName: string): void {
    const template = popupTemplates[templateName as keyof typeof popupTemplates];
    if (!template) {
      console.warn(`Template "${templateName}" not found, using default`);
      this.applyDefaultStyles();
      return;
    }

    this.removeStyles();
    this.createStyleElement();
    this.injectTemplateStyles(templateName, template);
  }

  /**
   * Elimina estilos existentes del DOM
   */
  removeStyles(): void {
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }

  /**
   * Crea elemento de estilos en el head
   */
  private createStyleElement(): void {
    this.styleElement = document.createElement("style");
    this.styleElement.setAttribute("data-popup-styles", "true");
    document.head.appendChild(this.styleElement);
  }

  /**
   * Inyecta estilos específicos del template
   */
  private injectTemplateStyles(templateName: string, template: any): void {
    if (!this.styleElement) return;

    const styles = this.generateTemplateCSS(templateName, template);
    this.styleElement.textContent = styles;
  }

  /**
   * Genera CSS para un template específico
   */
  private generateTemplateCSS(templateName: string, template: any): string {
    const { size, style } = template;
    
    return `
/* ==========================================
   POPUP STYLES - ${template.name}
   ========================================== */

.maplibregl-popup.popup-${templateName} {
  max-width: ${size.width}px;
  min-width: ${size.width * 0.8}px;
}

.maplibregl-popup.popup-${templateName} .maplibregl-popup-content {
  width: 100%;
  min-width: auto;
  background: ${style.background};
  border: 1px solid ${style.borderColor};
  border-radius: ${style.borderRadius};
  box-shadow: ${style.boxShadow};
  font-family: ${style.fontFamily};
  font-size: ${style.fontSize};
  color: ${style.textColor};
  padding: 0;
  margin: 0;
  overflow: hidden;
  z-index: 999999 !important;
}

/* Header Styles */
.maplibregl-popup.popup-${templateName} .popup-header {
  background: ${style.header.background};
  color: ${style.header.textColor};
  padding: ${style.header.padding};
  font-size: ${style.header.fontSize};
  font-weight: ${style.header.fontWeight};
  border-bottom: ${style.header.borderBottom || 'none'};
  text-align: center;
  position: relative;
}

.maplibregl-popup.popup-${templateName} .popup-title {
  font-weight: 700;
  margin: 0 0 2px 0;
  line-height: 1.2;
}

.maplibregl-popup.popup-${templateName} .popup-subtitle {
  opacity: 0.9;
  font-size: 0.85em;
  margin: 0;
}

/* Section Styles */
.maplibregl-popup.popup-${templateName} .popup-section {
  padding: ${style.section.padding};
  gap: ${style.section.gap};
  background: transparent;
}

.maplibregl-popup.popup-${templateName} .popup-section-title {
  font-weight: 600;
  color: ${style.textColor};
  margin: 0 0 8px 0;
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.maplibregl-popup.popup-${templateName} .popup-muted {
  opacity: 0.7;
  font-size: 0.9em;
}

/* Divider Styles */
.maplibregl-popup.popup-${templateName} .popup-divider {
  height: ${style.separator.height};
  background: ${style.separator.background};
  margin: ${style.separator.margin};
  border: none;
}

/* Table Styles */
.maplibregl-popup.popup-${templateName} .popup-table {
  width: ${style.table.width};
  border-collapse: ${style.table.borderCollapse};
  font-size: ${style.table.fontSize};
  margin: 0;
}

.maplibregl-popup.popup-${templateName} .popup-table tr {
  border-bottom: ${style.tableRow.borderBottom || 'none'};
  ${style.tableRow.backgroundColor ? `background: ${style.tableRow.backgroundColor};` : ''}
  ${style.tableRow.borderLeft ? `border-left: ${style.tableRow.borderLeft};` : ''}
  ${style.tableRow.borderRight ? `border-right: ${style.tableRow.borderRight};` : ''}
  ${style.tableRow.borderRadius ? `border-radius: ${style.tableRow.borderRadius};` : ''}
}

.maplibregl-popup.popup-${templateName} .popup-table th {
  color: ${style.tableLabel.color};
  font-weight: ${style.tableLabel.fontWeight};
  padding: ${style.tableLabel.padding};
  width: ${style.tableLabel.width};
  text-align: ${style.tableLabel.textAlign};
  border-left: ${style.tableLabel.borderLeft || 'none'};
  font-size: ${style.tableLabel.fontSize || 'inherit'};
  text-transform: ${style.tableLabel.textTransform || 'none'};
  letter-spacing: ${style.tableLabel.letterSpacing || 'normal'};
}

.maplibregl-popup.popup-${templateName} .popup-table td {
  color: ${style.tableValue.color};
  font-weight: ${style.tableValue.fontWeight};
  padding: ${style.tableValue.padding};
  text-align: ${style.tableValue.textAlign};
  font-size: ${style.tableValue.fontSize || 'inherit'};
}

/* Footer Styles */
.maplibregl-popup.popup-${templateName} .popup-footer {
  background: ${style.footer.background};
  padding: ${style.footer.padding};
  font-size: ${style.footer.fontSize};
  color: ${style.footer.color};
  text-align: ${style.footer.textAlign};
  border-top: ${style.footer.borderTop};
  font-weight: ${style.footer.fontWeight || 'normal'};
  letter-spacing: ${style.footer.letterSpacing || 'normal'};
}

/* Compact Table Variant */
.maplibregl-popup.popup-${templateName} .popup-table.compact th,
.maplibregl-popup.popup-${templateName} .popup-table.compact td {
  padding: 8px 12px;
  font-size: 0.9em;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .maplibregl-popup.popup-${templateName} {
    max-width: 90vw;
    min-width: 280px;
  }
  
  .maplibregl-popup.popup-${templateName} .popup-table th,
  .maplibregl-popup.popup-${templateName} .popup-table td {
    padding: 8px 10px;
    font-size: 0.85em;
  }
}
`;
  }

  /**
   * Aplica estilos por defecto
   */
  private applyDefaultStyles(): void {
    this.removeStyles();
    this.createStyleElement();
    
    if (!this.styleElement) return;
    
    this.styleElement.textContent = `
/* Default popup styles */
.maplibregl-popup .maplibregl-popup-content {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 16px;
  z-index: 999999 !important;
}
`;
  }
}

/* =========================
   UTILITY FUNCTIONS
   ========================= */

/**
 * Aplica estilos de popup dinámicamente
 */
export function applyPopupStyles(templateName: string): void {
  const manager = PopupStyleManager.getInstance();
  manager.applyStyles(templateName);
}

/**
 * Limpia todos los estilos de popup
 */
export function clearPopupStyles(): void {
  const manager = PopupStyleManager.getInstance();
  manager.removeStyles();
}

/**
 * Obtiene CSS para un template específico (para debugging)
 */
export function getTemplateCSS(templateName: string): string {
  const template = popupTemplates[templateName as keyof typeof popupTemplates];
  if (!template) return '';
  
  const manager = PopupStyleManager.getInstance();
  return (manager as any).generateTemplateCSS(templateName, template);
}