
//---------------------------------------------
// AppearanceTab.tsx — FINAL LIMPIO
//---------------------------------------------
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Feature } from "geojson";
import { LayerInfo } from "./layer-list";

export interface AppearanceTabProps {
  layer: LayerInfo;

  name: string;
  setName: (v: string) => void;

  color: string;
  setColor: (v: string) => void;

  textField: string | null;
  setTextField: (v: string | null) => void;

  categoryValues: Record<string, string>;
  setCategoryValues: (
    v:
      | Record<string, string>
      | ((prev: Record<string, string>) => Record<string, string>)
  ) => void;

  dataFeatures: Feature[];
}

export default function AppearanceTab({
  layer,
  name,
  setName,
  color,
  setColor,
  textField,
  setTextField,
  categoryValues,
  setCategoryValues,
  dataFeatures,
}: AppearanceTabProps) {
  // propiedades del primer feature
  const props = dataFeatures?.[0]?.properties ?? {};

  // campos tipo string
  const stringFields = React.useMemo(
    () =>
      Object.entries(props)
        .filter(([, v]) => typeof v === "string")
        .map(([k]) => k),
    [props]
  );

  // =============================================================
  //  Mantener categorías sincronizadas cuando cambia textField
  // =============================================================
  React.useEffect(() => {
    if (!textField) return;

    const values = new Set<string>();

    dataFeatures.forEach((f) => {
      const v = (f.properties as any)?.[textField];
      if (typeof v === "string") values.add(v);
    });

    const newKeys = [...values];
    const oldKeys = Object.keys(categoryValues);

    const same =
      newKeys.length === oldKeys.length &&
      newKeys.every((k) => k in categoryValues);

    if (same) return;

    const updated: Record<string, string> = {};
    newKeys.forEach((k) => {
      updated[k] = categoryValues[k] ?? "#cccccc";
    });

    setCategoryValues(updated);
  }, [textField, dataFeatures]);

  // =============================================================
  //  UI
  // =============================================================
  return (
    <ScrollArea className="max-h-[70vh] p-5 space-y-6">
      {/* Nombre */}
      <section>
        <label className="text-sm font-medium">Nombre de la capa</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1"
        />
      </section>

      {/* Color principal */}
      <section className="space-y-2">
        <label className="text-sm font-medium">Color principal</label>

        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <span className="text-sm text-neutral-600">{color}</span>
        </div>
      </section>

      {/* Reglas de categoría */}
      <section className="space-y-3">
        <label className="text-sm font-medium">Color por categoría</label>

        <select
          value={textField ?? ""}
          onChange={(e) => setTextField(e.target.value || null)}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="">Sin reglas</option>
          {stringFields.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>

        {/* Lista compacta */}
        {textField && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {Object.entries(categoryValues).map(([val, col]) => (
              <Card
                key={val}
                className="px-3 py-2 flex items-center justify-between rounded-lg border shadow-sm"
              >
                <div className="flex flex-col truncate">
                  <span className="text-sm font-medium truncate">{val}</span>
                  <span className="text-xs text-neutral-500">{col}</span>
                </div>

                <input
                  type="color"
                  value={col ?? "#cccccc"}
                  onChange={(e) =>
                    setCategoryValues((prev) => ({
                      ...prev,
                      [val]: e.target.value,
                    }))
                  }
                  className="w-7 h-7 rounded cursor-pointer ml-4"
                />
              </Card>
            ))}
          </div>
        )}
      </section>
    </ScrollArea>
  );
}
