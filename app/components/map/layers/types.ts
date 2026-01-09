//---------------------------------------------
// types.ts
//---------------------------------------------
export interface BooleanStyleCfg {
  enabled: boolean;
  trueColor: string;
  falseColor: string;
}


export interface NumericRule {
  fieldA: string;
  op: string;
  fieldB: string;
  color: string;
}
