
"use client";

import React from "react";
import { Eye, EyeOff, Pencil, Trash2, Focus } from "lucide-react";

export interface LayerInfo {
  id: string;
  name: string;
  color: string;
  visible: boolean;

  data: any;

  /* Campos visibles en el popup */
  fields: string[];

  /* Estilos condicionales */
  booleanStyles: {
    [key: string]: {
      enabled: boolean;
      color: string;
    };
  };
}

interface Props {
  layers: LayerInfo[];
  onToggle: (id: string) => void;
  onEdit: (l: LayerInfo) => void;
  onDelete: (id: string) => void;
  onFocus: (l: LayerInfo) => void;
}

export default function LayerList({ layers, onToggle, onEdit, onDelete, onFocus }: Props) {
  return (
    <div
      className="
        absolute left-4 top-4 z-20
        w-[260px]
        bg-white/80 backdrop-blur-md
        shadow-xl border border-neutral-200
        rounded-2xl p-3
        space-y-3
      "
    >
      <h2 className="text-sm font-semibold text-neutral-700 px-1">Capas</h2>

      <div className="flex flex-col gap-3">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className="
              bg-white rounded-xl border border-neutral-200 shadow-sm
              p-3 flex flex-col gap-2 transition hover:shadow-md
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-neutral-800">
                {layer.name}
              </span>

              <button
                onClick={() => onToggle(layer.id)}
                className="p-1 hover:bg-neutral-100 rounded-md"
              >
                {layer.visible ? (
                  <Eye className="w-4 h-4 text-neutral-700" />
                ) : (
                  <EyeOff className="w-4 h-4 text-neutral-500" />
                )}
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                {/* Focus */}
                <button
                  onClick={() => onFocus(layer)}
                  className="p-1 hover:bg-neutral-100 rounded-md text-neutral-700"
                >
                  <Focus className="w-4 h-4" />
                </button>

                {/* Edit */}
                <button
                  onClick={() => onEdit(layer)}
                  className="p-1 hover:bg-neutral-100 rounded-md text-blue-600"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              {/* Delete */}
              <button
                onClick={() => onDelete(layer.id)}
                className="p-1 hover:bg-red-50 rounded-md text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Color preview */}
            <div className="h-1.5 w-full rounded-full mt-2" style={{ backgroundColor: layer.color }} />
          </div>
        ))}

        {layers.length === 0 && (
          <p className="text-xs text-neutral-500 text-center py-2">
            No hay capas cargadas
          </p>
        )}
      </div>
    </div>
  );
}
