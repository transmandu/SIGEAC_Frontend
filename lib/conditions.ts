export interface Condition {
  value: string;
  label: string;
  label_en: string;
}

export const conditions = [
  { value: 'Nuevo', label: "Nuevo", label_en: "New" },
  { value: 'Overhauled', label: "Overhauled", label_en: "Overhauled" },
  { value: 'Inspeccionado', label: "Inspeccionado", label_en: "Inspected" },
  { value: 'Reparable', label: "Reparable", label_en: "Repairable" },
  { value: 'Usado', label: "Usado", label_en: "Used" },
  { value: 'Reparado', label: "Reparado", label_en: "Repaired" },
  { value: 'Serviciable', label: "Serviciable", label_en: "Serviceable" },
];