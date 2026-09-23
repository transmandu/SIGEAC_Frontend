// Espejo de PlanificationAuditLog::REASONS del backend. Solo ERROR_CAPTURA
// cuenta como error en la auditoría de ediciones de Planificación.
export const EDIT_REASONS = [
  "ERROR_CAPTURA",
  "DATO_FALTANTE",
  "CAMBIO_OPERACIONAL",
  "AJUSTE_MENOR",
] as const;

export type EditReason = (typeof EDIT_REASONS)[number];

export const EDIT_REASON_LABELS: Record<EditReason | "SIN_CLASIFICAR", string> = {
  ERROR_CAPTURA: "Error de captura",
  DATO_FALTANTE: "Dato faltante / completar",
  CAMBIO_OPERACIONAL: "Cambio operacional",
  AJUSTE_MENOR: "Ajuste menor (ortografía, formato)",
  SIN_CLASIFICAR: "Sin clasificar",
};

export const EDIT_REASON_HINTS: Record<EditReason, string> = {
  ERROR_CAPTURA: "El dato se cargó mal.",
  DATO_FALTANTE: "Se completa información que no se tenía al cargar.",
  CAMBIO_OPERACIONAL: "Cambió la realidad: desvío, cambio de aeronave, reprogramación…",
  AJUSTE_MENOR: "Corrección de forma que no altera el dato.",
};
