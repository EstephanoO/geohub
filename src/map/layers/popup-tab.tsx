
//---------------------------------------------
// PopupTab.tsx
//---------------------------------------------
"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

import { LayerInfo } from "./layer-list";

/* =======================
   TIPOS
======================= */

interface Props {
  layer: LayerInfo;
  popupTemplate: string;
  setPopupTemplate: (v: string) => void;
}

/* =======================
   COMPONENTE
======================= */

export default function PopupTab({
  layer,
  popupTemplate,
  setPopupTemplate,
}: Props) {
  const props = layer.data.features?.[0]?.properties ?? {};
  const fields = Object.keys(props);

  return (
    <ScrollArea className="max-h-[70vh] p-5 space-y-5">
      {/* TEMPLATE */}
      <Card className="p-4 space-y-2">
        <label className="text-sm font-medium">
          Plantilla HTML del popup
        </label>

        <Textarea
          value={popupTemplate}
          onChange={(e) => setPopupTemplate(e.target.value)}
          rows={8}
          placeholder={`Ejemplo:
<h3>{name}</h3>
<p>{description}</p>`}
          className="font-mono text-sm"
        />

        <p className="text-xs text-neutral-500">
          Usa <code>{"{campo}"}</code> para insertar atributos
        </p>
      </Card>

      {/* CAMPOS DISPONIBLES */}
      <Card className="p-4 space-y-2">
        <label className="text-sm font-medium">
          Campos disponibles
        </label>

        <div className="flex flex-wrap gap-2">
          {fields.map((f) => (
            <code
              key={f}
              className="px-2 py-1 text-xs rounded bg-neutral-100 border"
            >
              {"{" + f + "}"}
            </code>
          ))}

          {fields.length === 0 && (
            <p className="text-xs text-neutral-500">
              No hay campos detectados
            </p>
          )}
        </div>
      </Card>
    </ScrollArea>
  );
}
