// @ts-nocheck

// ===============================
//  EditLayerModal (REWORK FINAL)
// ===============================

"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Pencil, X, Check } from "lucide-react";

// types
import { LayerInfo } from "./layer-list";

// sub tabs
import AppearanceTab from "./appearance-tab";
import BorderTab from "./border-tab";
import BooleanRulesTab from "./boolean-rules-tab";
import NumericRulesTab from "./numeric-rules-tab";
import PopupTab from "./popup-tab";

interface Props {
  open: boolean;
  layer: LayerInfo | null;
  onClose: () => void;
  onSave: (id: string, cfg: Partial<LayerInfo>) => void;
}

export default function EditLayerModal({
  open,
  layer,
  onClose,
  onSave,
}: Props) {
  // ===============================
  // State local sincronizado
  // ===============================
  const [local, setLocal] = React.useState<LayerInfo | null>(null);

  React.useEffect(() => {
    if (!open || !layer) return;
    // copia profunda pero sin romper referenciales
    setLocal(JSON.parse(JSON.stringify(layer)));
  }, [layer, open]);

  if (!open || !local) return null;

  // update helper
  const update = (patch: Partial<LayerInfo>) => {
    setLocal((prev) => ({ ...prev!, ...patch }));
  };

  const handleSave = () => {
    onSave(local.id, local);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[92%] rounded-2xl border shadow-xl bg-white p-0 overflow-hidden">
        {/* HEADER */}
        <DialogHeader className="p-5 pb-2 border-b bg-neutral-50">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Pencil size={20} className="text-blue-600" />
            Editar capa
          </DialogTitle>
        </DialogHeader>

        {/* TABS */}
        <Tabs defaultValue="appearance">
          <TabsList className="grid grid-cols-4 border-b rounded-none">
            <TabsTrigger value="appearance">Apariencia</TabsTrigger>
            <TabsTrigger value="border">Borde</TabsTrigger>
            <TabsTrigger value="rules">Reglas</TabsTrigger>
            <TabsTrigger value="popup">Popup</TabsTrigger>
          </TabsList>

          {/* APARIENCIA */}
          <TabsContent value="appearance">

            <AppearanceTab
              layer={local}

              name={local.name}
              setName={(v) => update({ name: v })}

              color={local.color}
              setColor={(v) => update({ color: v })}

              textField={local.textCategories?.field ?? null}
              setTextField={(v) =>
                update({
                  textCategories: v
                    ? {
                      field: v,
                      values: local.textCategories?.values ?? {},
                    }
                    : null,
                })
              }

              categoryValues={local.textCategories?.values ?? {}}
              setCategoryValues={(next) =>
                setLocal((prev) => {
                  const resolved =
                    typeof next === "function"
                      ? next(prev!.textCategories?.values ?? {})
                      : next;

                  return {
                    ...prev!,
                    textCategories: {
                      field: prev!.textCategories!.field,
                      values: resolved,
                    },
                  };
                })
              }

              dataFeatures={local.data?.features ?? []}
            />
          </TabsContent>

          {/* BORDER */}
          <TabsContent value="border">
            <BorderTab
              strokeColor={local.strokeColor}
              setStrokeColor={(v) => update({ strokeColor: v })}

              strokeWidth={local.strokeWidth}
              setStrokeWidth={(v) => update({ strokeWidth: v })}

              strokeOpacity={local.strokeOpacity}
              setStrokeOpacity={(v) => update({ strokeOpacity: v })}

              strokeRules={local.strokeRules}
              setStrokeRules={(next) =>
                update({
                  strokeRules:
                    typeof next === "function"
                      ? next(local.strokeRules)
                      : next,
                })
              }

              fields={local.fields}
            />
          </TabsContent>

          {/* RULES */}
          <TabsContent value="rules">
            <BooleanRulesTab layer={local} update={update} />

            <NumericRulesTab
              layer={local}
              rules={local.numericRules ?? []}
              setRules={(
                next: (prev: LayerInfo["numericRules"]) => LayerInfo["numericRules"]
              ) =>
                update({
                  numericRules: next(local.numericRules ?? []),
                })
              }
            />
          </TabsContent>

          {/* POPUP */}
          <TabsContent value="popup">
            <PopupTab
              layer={local}
              popupTemplate={local.popupTemplate ?? ""}
              setPopupTemplate={(v) => update({ popupTemplate: v })}
            />
          </TabsContent>
        </Tabs>

        {/* FOOTER */}
        <DialogFooter className="p-4 border-t bg-neutral-50">
          <Button variant="outline" onClick={onClose}>
            <X size={16} /> Cancelar
          </Button>

          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
          >
            <Check size={16} /> Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
