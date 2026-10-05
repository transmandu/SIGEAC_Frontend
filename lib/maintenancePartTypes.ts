// Orden y etiqueta de los tipos de parte relevantes a Control de Mantenimiento,
// compartido entre el formulario de creación/edición y el page de gestión
// para que ambos se refieran a "Motor", "Turbina", "Hélice", "APU" igual.
export const PART_TYPE_ORDER: Record<string, number> = {
  MOTOR: 0,
  TURBINA: 1,
  HELICE: 2,
  APU: 3,
};

export const PART_TYPE_LABELS: Record<string, string> = {
  MOTOR: "Motor",
  TURBINA: "Turbina",
  HELICE: "Hélice",
  APU: "APU",
};

export function partTypeRank(type?: string): number {
  return PART_TYPE_ORDER[(type ?? "").toUpperCase()] ?? 99;
}

export function partTypeLabel(type?: string): string {
  return PART_TYPE_LABELS[(type ?? "").toUpperCase()] ?? type ?? "Otro";
}
