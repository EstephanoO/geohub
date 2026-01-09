
// src/map/MapUploader.tsx
'use client';

import React from 'react';
import { reprojectGeoJSON } from './mapbox-helpers';

interface Props {
  onLoad: (data: any, fields: string[]) => void;
}

export default function MapUploader({ onLoad }: Props) {
  const upload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    let json = JSON.parse(text);

    console.log("📥 Cargando GeoJSON:", json);

    json = reprojectGeoJSON(json);

    const props = json.features[0]?.properties || {};
    const fields = Object.keys(props);

    onLoad(json, fields);
  };

  return (
    <input
      type="file"
      accept=".geojson,.json"
      onChange={upload}
      style={{
        position: 'absolute',
        zIndex: 10,
        top: 10,
        right: 10,
        padding: 6,
      }}
    />
  );
}
