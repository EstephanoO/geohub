//---------------------------------------------
// NumericRulesTab.tsx
//---------------------------------------------
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export default function NumericRulesTab({ rules, setRules, layer }: any) {
  const props = layer.data.features[0].properties;
  const numericFields = Object.entries(props).filter(([, v]) => typeof v === "number").map(([k]) => k);
  const OPERATORS = ["==", "!=", ">", "<", ">=", "<="];


  return (
    <ScrollArea className="max-h-[70vh] p-5 space-y-6">
      {rules.map((r: any, i: number) => (
        <Card key={i} className="p-4 grid grid-cols-4 gap-3 items-center">
          <select value={r.fieldA} onChange={(e) => setRules((p: any) => p.map((x: any, id: number) => id === i ? { ...x, fieldA: e.target.value } : x))} className="border rounded px-1 py-1 text-sm">
            <option value="">Campo A</option>
            {numericFields.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>


          <select value={r.op} onChange={(e) => setRules((p: any) => p.map((x: any, id: number) => id === i ? { ...x, op: e.target.value } : x))} className="border rounded px-1 py-1 text-sm">
            {OPERATORS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>


          <select value={r.fieldB} onChange={(e) => setRules((p: any) => p.map((x: any, id: number) => id === i ? { ...x, fieldB: e.target.value } : x))} className="border rounded px-1 py-1 text-sm">
            <option value="">Campo B</option>
            {numericFields.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>


          <input type="color" value={r.color} onChange={(e) => setRules((p: any) => p.map((x: any, id: number) => id === i ? { ...x, color: e.target.value } : x))} className="w-10 h-8" />
        </Card>
      ))}


      <Button className="w-full bg-neutral-200 text-neutral-700" onClick={() => setRules((p: any) => [...p, { fieldA: "", op: "==", fieldB: "", color: "#000000" }])}>
        + Agregar regla
      </Button>
    </ScrollArea>
  );
}
