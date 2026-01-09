// styled-popup.tsx
// Option 1 → Popup HTML builder (string-based)

export interface PopupField {
  key: string;
  label?: string;
  value: any;
}

export interface BuildPopupHTMLParams {
  title: string;
  fields: PopupField[];
  selected: string[]; // selected field keys
}

/**
 * Builds a clean Mapbox popup HTML string.
 */
export function buildPopupHTML({
  title,
  fields,
  selected,
}: BuildPopupHTMLParams): string {
  const selectedFields = fields.filter((f) => selected.includes(f.key));

  const fieldRows = selectedFields
    .map((f) => {
      const label = f.label || f.key;
      const value = f.value ?? "—";
      return `
        <div class="popup-row">
          <span class="popup-label">${label}</span>
          <span class="popup-value">${value}</span>
        </div>`;
    })
    .join("\n");

  return `
    <div class="popup-container">
      <div class="popup-title">${title}</div>
      <div class="popup-body">
        ${fieldRows}
      </div>
    </div>
  `;
}
