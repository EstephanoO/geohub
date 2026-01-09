export interface PopupStyleConfig {
  background: string;
  borderColor: string;
  borderRadius: string;
  boxShadow: string;
  fontFamily: string;
  fontSize: string;
  textColor: string;
  header: {
    background: string;
    textColor: string;
    padding: string;
    fontSize: string;
    fontWeight: number | string;
    borderBottom: string;
  };
  section: {
    padding: string;
    gap: string;
  };
  separator: {
    height: string;
    background: string;
    margin: string;
    borderRadius?: string;
  };
  table: {
    width: string;
    borderCollapse: string;
    borderSpacing: string;
    fontSize: string;
  };
  tableRow: {
    borderBottom: string;
    backgroundColor: string;
    borderRadius?: string;
    borderLeft?: string;
    borderRight?: string;
  };
  tableLabel: {
    color: string;
    fontWeight: number | string;
    padding: string;
    width: string;
    textAlign: string;
    borderLeft: string;
    textTransform?: string;
    fontSize?: string;
    letterSpacing?: string;
  };
  tableValue: {
    color: string;
    fontWeight: number | string;
    padding: string;
    textAlign: string;
    fontSize?: string;
  };
  footer: {
    background: string;
    padding: string;
    fontSize: string;
    color: string;
    textAlign: string;
    borderTop: string;
    fontWeight?: number | string;
    letterSpacing?: string;
  };
}

export interface PopupLayoutConfig {
  sections: string[];
  contentLayout: string;
}

export interface PopupTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  colors: string[];
  size: { width: number; minHeight: number };
  style: PopupStyleConfig;
  layout: PopupLayoutConfig;
  isCustom?: boolean;
  createdBy?: string;
  createdAt?: string;
}

export interface MapData {
  id: string;
  name: string;
  description: string;
  tags: string[];
  geoJson?: any;
  qml?: string | undefined;
  isVisible: boolean;
  createdDate: string;
  popupTemplate?: string | undefined;
  customPopupTemplates?: PopupTemplate[] | undefined;
}

export interface MapConfig {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface FileUploadHandler {
  (event: React.ChangeEvent<HTMLInputElement>): void;
}