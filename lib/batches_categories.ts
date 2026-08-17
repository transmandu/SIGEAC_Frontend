/**
 * Categoría del lote. Debe coincidir con Batch::CATEGORIES del backend, que
 * sirve el valor canónico en inglés: la traducción vive aquí.
 */
export const BATCH_CATEGORIES = [
  "CONSUMABLE",
  "COMPONENT",
  "TOOL",
  "PART",
] as const;

export type BatchCategory = (typeof BATCH_CATEGORIES)[number];

const BATCH_CATEGORY_ES: Record<string, string> = {
  CONSUMABLE: "Consumible",
  COMPONENT: "Componente",
  TOOL: "Herramienta",
  PART: "Parte",
};

export const batchCategoryLabelEs = (category?: string | null) => {
  if (!category) return "N/A";
  const key = category.trim().toUpperCase();
  return BATCH_CATEGORY_ES[key] ?? key;
};

/** Igual que batchCategoryLabelEs, en mayúsculas: "CONSUMIBLE". */
export const batchCategoryLabelEsUpper = (category?: string | null) =>
  batchCategoryLabelEs(category).toLocaleUpperCase("es");

export const batches_categories = BATCH_CATEGORIES.map((value) => ({
  value,
  label: batchCategoryLabelEsUpper(value),
}));
