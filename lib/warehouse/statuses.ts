/**
 * Valores reales de `articles.status` (mayúsculas en BD). Se muestran en inglés
 * por pedido de almacén; el orden refleja el flujo del artículo.
 */
export const ARTICLE_STATUSES = [
  "INCOMING",
  "RECEPTION",
  "CHECKING",
  "QUARANTINE",
  "WAITING_FOR_FORMAT",
  "WAITING_TO_LOCATE",
  "TO_DETERMINATE",
  "STORED",
  "RESERVED",
  "INTOOLBOX",
  "INUSE",
  "DISPATCHED",
  "TRANSIT",
  "SHELTERED",
  "MAINTENANCE",
] as const;

export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

/** Etiqueta legible en inglés; los valores con guión bajo se muestran separados. */
export const formatStatusLabel = (status: string) =>
  status
    .trim()
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const ARTICLE_STATUS_OPTIONS = ARTICLE_STATUSES.map((value) => ({
  value,
  label: formatStatusLabel(value),
}));

/** Estado de calibración de la herramienta: vive en `tools.status`, no en el artículo. */
export const TOOL_STATUSES = ["CALIBRADO", "VENCIDO", "EN CALIBRACION"] as const;
