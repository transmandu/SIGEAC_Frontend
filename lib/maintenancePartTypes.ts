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

type OrderablePart = {
  id?: number | string;
  type?: string;
  current_assignment?: { part_order?: number | null } | null;
};

/**
 * Orden único de las partes en todo el sistema: tipo (motor, turbina...) y
 * luego el `part_order` de su asignación a la aeronave, que se edita en el
 * formulario de la aeronave. Es lo que fija qué parte es "Motor 1".
 */
export function comparePartsByOrder(
  a: OrderablePart,
  b: OrderablePart,
): number {
  const orderOf = (part: OrderablePart) =>
    part.current_assignment?.part_order ?? Number.MAX_SAFE_INTEGER;

  return (
    partTypeRank(a.type) - partTypeRank(b.type) ||
    orderOf(a) - orderOf(b) ||
    Number(a.id) - Number(b.id)
  );
}

export function partTypeLabel(type?: string): string {
  return PART_TYPE_LABELS[(type ?? "").toUpperCase()] ?? type ?? "Otro";
}
