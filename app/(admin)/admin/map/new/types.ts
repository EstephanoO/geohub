export interface MapData {
  id: string;
  name: string;
  description: string;
  tags: string[];
  geoJson?: any;
  qml?: string;
  isVisible: boolean;
  createdDate: string;
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