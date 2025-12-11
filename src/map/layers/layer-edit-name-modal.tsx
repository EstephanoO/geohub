
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

import { Pencil, X, Check } from "lucide-react";
import { LayerInfo } from "./layer-list";

interface Props {
  open: boolean;
  layer: LayerInfo | null;
  onClose: () => void;
  onSave: (id: string, cfg: Partial<LayerInfo>) => void;
}

// OPERATORS corrected to Mapbox syntax
const OPERATORS = ["==", "!=", ">", "<", ">=", "<="];

export default function EditLayerModal({ open, layer, onClose, onSave }: Props) {
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState("#00bcd4");
  const [fields, setFields] = React.useState<string[]>([]);
  const [booleanStyles, setBooleanStyles] = React.useState<LayerInfo["booleanStyles"]>({});

  const [rules, setRules] = React.useState<LayerInfo["rules"]>([]);
  const [popupTemplate, setPopupTemplate] = React.useState("");

  const numericFields = React.useMemo(() => {
    const props = layer?.data.features?.[0]?.properties || {};
    return Object.entries(props).filter(([_, v]) => typeof v === "number").map(([k]) => k);
  }, [layer]);

  const detectedBooleanKeys = React.useMemo(() => {
    const props = layer?.data.features?.[0]?.properties || {};
    return Object.entries(props).filter(([_, v]) => typeof v === "boolean").map(([k]) => k);
  }, [layer]);

  React.useEffect(() => {
    if (!layer) return;
    setName(layer.name);
    setColor(layer.color);
    setFields(layer.fields || []);
    setBooleanStyles(layer.booleanStyles || {});
    setRules((layer.rules || []).map((r) => ({ ...r })));
    setPopupTemplate(layer.popupTemplate || "<h3>{name}</h3><p>{description}</p>");
  }, [layer]);

  if (!layer) return null;

  const previewHTML = popupTemplate.replace(/\{(.*?)\}/g, (_, k) => layer.data.features[0]?.properties?.[k] ?? "");

  const toggleField = (f: string) => {
    setFields((p) => (p.includes(f) ? p.filter((x) => x !== f) : [...p, f]));
  };

  // sanitize rules on save: ensure operator is one of allowed and colors are strings
  const handleSave = () => {
    const validOps = ["==", "!=", ">", ">=", "<", "<="];
    const cleanRules = (rules || [])
      .map((r) => ({ ...r }))
      .filter((r) => r && r.fieldA && r.fieldB && r.op && validOps.includes(r.op))
      .map((r) => ({ ...r, color: typeof r.color === "string" && r.color.trim() ? r.color : "#000000" }));

    // ensure booleanStyles has string colors
    const bs: any = {};
    for (const k of Object.keys(booleanStyles || {})) {
      const cfg = booleanStyles[k] || {};
      bs[k] = {
        enabled: !!cfg.enabled,
        trueColor: typeof cfg.trueColor === "string" && cfg.trueColor.trim() ? cfg.trueColor : color,
        falseColor: typeof cfg.falseColor === "string" && cfg.falseColor.trim() ? cfg.falseColor : color,
      };
    }

    onSave(layer.id, {
      name,
      color,
      fields,
      booleanStyles: bs,
      rules: cleanRules,
      popupTemplate,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[92%] rounded-2xl border border-neutral-200 shadow-xl bg-white p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-2 border-b bg-neutral-50">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Pencil size={20} className="text-blue-600" />
            Editar capa
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid grid-cols-3 w-full rounded-none border-b">
            <TabsTrigger value="appearance">Apariencia</TabsTrigger>
            <TabsTrigger value="rules">Reglas</TabsTrigger>
            <TabsTrigger value="popup">Popup</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance">
            <ScrollArea className="max-h-[65vh] p-5 space-y-6">
              <section>
                <label className="text-sm font-medium text-neutral-700">Nombre de la capa</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
              </section>

              <section className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Color principal</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                  <span className="text-sm text-neutral-600">{color}</span>
                </div>
              </section>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="rules">
            <ScrollArea className="max-h-[65vh] p-5 space-y-6">
              <section className="space-y-3">
                <label className="text-sm font-medium text-neutral-700">Reglas para atributos booleanos</label>
                <div className="flex flex-col gap-3">
                  {detectedBooleanKeys.map((key) => {
                    const cfg = booleanStyles[key] || { enabled: false };
                    return (
                      <Card key={key} className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{key}</span>
                          <Switch checked={!!cfg.enabled} onCheckedChange={(v) => setBooleanStyles((p) => ({ ...p, [key]: { ...p[key], enabled: v } }))} />
                        </div>

                        {cfg.enabled && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-neutral-500">TRUE</span>
                              <div className="flex items-center gap-2">
                                <input type="color" value={cfg.trueColor ?? color} onChange={(e) => setBooleanStyles((p) => ({ ...p, [key]: { ...p[key], trueColor: e.target.value } }))} className="w-10 h-8 rounded" />
                                <span className="text-xs text-neutral-600">{cfg.trueColor ?? color}</span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-neutral-500">FALSE</span>
                              <div className="flex items-center gap-2">
                                <input type="color" value={cfg.falseColor ?? color} onChange={(e) => setBooleanStyles((p) => ({ ...p, [key]: { ...p[key], falseColor: e.target.value } }))} className="w-10 h-8 rounded" />
                                <span className="text-xs text-neutral-600">{cfg.falseColor ?? color}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-3">
                <label className="text-sm font-medium text-neutral-700">Reglas condicionales (solo campos numéricos)</label>

                <div className="flex flex-col gap-4">
                  {rules.map((rule, i) => (
                    <Card key={i} className="p-4 space-y-3">
                      <div className="grid grid-cols-4 gap-3">
                        <select value={rule.fieldA} onChange={(e) => setRules((r) => r.map((x, idx) => (idx === i ? { ...x, fieldA: e.target.value } : x)))} className="border rounded px-2 py-1 text-sm">
                          <option value="">Campo A</option>
                          {numericFields.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>

                        <select value={rule.op} onChange={(e) => setRules((r) => r.map((x, idx) => (idx === i ? { ...x, op: e.target.value } : x)))} className="border rounded px-2 py-1 text-sm">
                          {OPERATORS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>

                        <select value={rule.fieldB} onChange={(e) => setRules((r) => r.map((x, idx) => (idx === i ? { ...x, fieldB: e.target.value } : x)))} className="border rounded px-2 py-1 text-sm">
                          <option value="">Campo B</option>
                          {numericFields.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>

                        <div className="flex items-center">
                          <input type="color" value={rule.color} onChange={(e) => setRules((r) => r.map((x, idx) => (idx === i ? { ...x, color: e.target.value } : x)))} className="w-10 h-8 rounded" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button className="w-full bg-neutral-200 text-neutral-700 hover:bg-neutral-300" onClick={() => setRules((p) => [...p, { fieldA: "", op: "==", fieldB: "", color: "#000000" }])}>
                  + Agregar regla
                </Button>
              </section>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="popup">
            <ScrollArea className="max-h-[65vh] p-5 space-y-6">
              <section className="space-y-3">
                <label className="text-sm font-medium text-neutral-700">Popup Editor (Plantilla)</label>
                <Textarea value={popupTemplate} onChange={(e) => setPopupTemplate(e.target.value)} className="min-h-[140px]" />
                <Card className="p-4 border mt-3">
                  <div dangerouslySetInnerHTML={{ __html: previewHTML }} className="prose max-w-full" />
                </Card>
              </section>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="p-4 border-t bg-neutral-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            <X size={16} /> Cancelar
          </Button>

          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1">
            <Check size={16} /> Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
