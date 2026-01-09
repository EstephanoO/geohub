//---------------------------------------------
// BooleanRulesTab.tsx
//---------------------------------------------
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";


export default function BooleanRulesTab({ booleanStyles, setBooleanStyles, layer }: any) {
  const props = layer.data.features[0].properties;
  const booleanFields = Object.entries(props).filter(([, v]) => typeof v === "boolean").map(([k]) => k);


  return (
    <ScrollArea className="max-h-[70vh] p-5 space-y-6">
      {booleanFields.map((key) => {
        const cfg = booleanStyles[key] || { enabled: false };


        return (
          <Card key={key} className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">{key}</span>
              <Switch checked={cfg.enabled} onCheckedChange={(v) => setBooleanStyles((p: any) => ({ ...p, [key]: { ...p[key], enabled: v } }))} />
            </div>


            {cfg.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-neutral-500">TRUE</span>
                  <input type="color" value={cfg.trueColor ?? "#00ff00"} onChange={(e) => setBooleanStyles((p: any) => ({ ...p, [key]: { ...p[key], trueColor: e.target.value } }))} />
                </div>


                <div>
                  <span className="text-xs text-neutral-500">FALSE</span>
                  <input type="color" value={cfg.falseColor ?? "#ff0000"} onChange={(e) => setBooleanStyles((p: any) => ({ ...p, [key]: { ...p[key], falseColor: e.target.value } }))} />
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </ScrollArea>
  );
}
