
"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";

// ✅ IMPORTAR TIPOS DESDE LA FUENTE ÚNICA
import {
  StrokeRule,
  NumericOperator,
} from "./layer-list";

/* =======================
   PROPS
======================= */

interface BorderTabProps {
  strokeColor: string;
  setStrokeColor: (v: string) => void;

  strokeWidth: number;
  setStrokeWidth: (v: number) => void;

  strokeOpacity: number;
  setStrokeOpacity: (v: number) => void;

  strokeRules: StrokeRule[];
  setStrokeRules: (
    next: StrokeRule[] | ((prev: StrokeRule[]) => StrokeRule[])
  ) => void;

  fields: string[];
}

/* =======================
   CONSTANTES
======================= */

const OPERATORS: NumericOperator[] = [
  "==",
  "!=",
  ">",
  ">=",
  "<",
  "<=",
];

/* =======================
   COMPONENTE
======================= */

export default function BorderTab({
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  strokeOpacity,
  setStrokeOpacity,
  strokeRules,
  setStrokeRules,
  fields,
}: BorderTabProps) {
  const addRule = () => {
    setStrokeRules((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        field: fields[0] ?? "",
        op: "==",
        value: "",
        color: strokeColor,
        width: strokeWidth,
        opacity: strokeOpacity,
      },
    ]);
  };

  const updateRule = (id: string, patch: Partial<StrokeRule>) => {
    setStrokeRules((prev) =>
      prev.map((rule) =>
        rule.id === id ? { ...rule, ...patch } : rule
      )
    );
  };

  const deleteRule = (id: string) => {
    setStrokeRules((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <ScrollArea className="max-h-[70vh] p-4 space-y-4">
      {/* CONFIGURACIÓN BÁSICA */}
      <Card className="p-4 rounded-xl border space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Color del borde</label>
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="w-9 h-9 rounded-md cursor-pointer border"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Grosor</label>
          <Slider
            value={[strokeWidth]}
            min={0}
            max={20}
            step={0.5}
            onValueChange={([v]) => setStrokeWidth(v)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Opacidad</label>
          <Slider
            value={[strokeOpacity]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={([v]) => setStrokeOpacity(v)}
          />
        </div>
      </Card>

      {/* REGLAS AVANZADAS */}
      <Card className="p-4 rounded-xl border space-y-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Reglas avanzadas</label>
          <Button size="sm" variant="outline" onClick={addRule}>
            <Plus size={14} />
          </Button>
        </div>

        {strokeRules.length === 0 && (
          <p className="text-xs text-neutral-500">No hay reglas aún</p>
        )}

        <div className="space-y-3">
          {strokeRules.map((rule) => (
            <Card
              key={rule.id}
              className="p-3 rounded-lg border space-y-3 bg-neutral-50"
            >
              <div className="flex gap-2">
                <select
                  className="border rounded-md p-2 text-sm flex-1"
                  value={rule.field}
                  onChange={(e) =>
                    updateRule(rule.id, { field: e.target.value })
                  }
                >
                  {fields.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>

                <select
                  className="border rounded-md p-2 text-sm w-20"
                  value={rule.op}
                  onChange={(e) =>
                    updateRule(rule.id, {
                      op: e.target.value as NumericOperator,
                    })
                  }
                >
                  {OPERATORS.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                placeholder="Valor…"
                value={String(rule.value)}
                onChange={(e) =>
                  updateRule(rule.id, { value: e.target.value })
                }
                className="text-sm"
              />

              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Color</label>
                <input
                  type="color"
                  value={rule.color}
                  onChange={(e) =>
                    updateRule(rule.id, { color: e.target.value })
                  }
                  className="w-9 h-9 rounded"
                />
              </div>

              <Slider
                value={[rule.width]}
                min={0}
                max={20}
                step={0.5}
                onValueChange={([v]) =>
                  updateRule(rule.id, { width: v })
                }
              />

              <Slider
                value={[rule.opacity]}
                min={0}
                max={1}
                step={0.05}
                onValueChange={([v]) =>
                  updateRule(rule.id, { opacity: v })
                }
              />

              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => deleteRule(rule.id)}
              >
                <Trash2 size={14} /> Eliminar
              </Button>
            </Card>
          ))}
        </div>
      </Card>
    </ScrollArea>
  );
}
