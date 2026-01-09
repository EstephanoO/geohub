
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
export function buildPopupHTML({ title, fields, selected }: BuildPopupHTMLParams): string {
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

// Suggested CSS (you can place this in your global.css or module.css)
// .popup-container {
//   font-family: Inter, sans-serif;
//   color: #1a1a1a;
//   min-width: 200px;
//   padding: 6px 8px;
// }
// .popup-title {
//   font-weight: 600;
//   margin-bottom: 6px;
//   font-size: 14px;
// }
// .popup-body {
//   display: flex;
//   flex-direction: column;
//   gap: 4px;
// }
// .popup-row {
//   display: flex;
//   justify-content: space-between;
//   border-bottom: 1px solid #e5e5e5;
//   padding-bottom: 2px;
// }
// .popup-label {
//   font-weight: 500;
//   font-size: 13px;
// }
// .popup-value {
//   font-size: 13px;
// }
