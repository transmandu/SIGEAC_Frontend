export interface Condition {
  value: string;
  label: string;
  label_en: string;
}

export const conditions: Condition[] = [
  { value: '1', label: "Nuevo", label_en: "New" },
  { value: '5', label: "Nuevo de Fábrica", label_en: "Factory New" },
  { value: '4', label: "Overhauled", label_en: "Overhauled" },
  { value: '9', label: "Inspeccionado", label_en: "Inspected" },
  { value: '10', label: "Reparable", label_en: "Repairable" },
  { value: '3', label: "Reparado", label_en: "Repaired" },
  { value: '6', label: "Testeado", label_en: "Tested" },
  { value: '7', label: "Removido", label_en: "As Removed" },
];