/**
 * Cómo se mide lo que se pide en una solicitud según la categoría del renglón.
 *
 * Un consumible se pide en una cantidad con su unidad. Componente, parte y
 * herramienta son entidades únicas (cada una se distingue por su serial): la
 * cantidad es cuántos artículos se piden y no hay unidad que declarar. Espeja
 * `Batch::UNITARY_CATEGORIES` del backend.
 */
const UNITARY_CATEGORIES = new Set([
  "COMPONENT",
  "PART",
  "TOOL",
  // Grafías heredadas en español que aún pueden llegar.
  "COMPONENTE",
  "PARTE",
  "HERRAMIENTA",
]);

/** Lo que se muestra donde haya un lugar de unidad y la categoría no la tiene. */
export const UNITARY_UNIT_LABEL = "UND";

export const isUnitaryCategory = (category?: string | null): boolean =>
  UNITARY_CATEGORIES.has((category ?? "").toUpperCase().trim());

/** Solo el consumible lleva unidad de medida. */
export const isConsumableCategory = (category?: string | null): boolean =>
  ["CONSUMABLE", "CONSUMIBLE"].includes((category ?? "").toUpperCase().trim());
