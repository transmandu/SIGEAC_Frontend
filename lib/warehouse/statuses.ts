/**
 * Valores reales de `articles.status` (mayúsculas en BD). El orden refleja el
 * flujo del artículo.
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
  "SAFEKEEPING",
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

/** Traducción al español; debe coincidir con ArticleStatus::toNameSpanish del backend. */
const STATUS_ES: Record<string, string> = {
  INCOMING: "Inspección",
  RECEPTION: "Recepción",
  CHECKING: "Revisión",
  QUARANTINE: "Cuarentena",
  WAITING_FOR_FORMAT: "En espera de formato",
  WAITING_TO_LOCATE: "En espera de ubicación",
  TO_DETERMINATE: "Destino indeterminado",
  STORED: "Almacenado",
  RESERVED: "Reservado",
  INTOOLBOX: "En caja de herramientas",
  INUSE: "En uso",
  DISPATCHED: "Despachado",
  TRANSIT: "Tránsito",
  SAFEKEEPING: "Resguardo",
  SHELTERED: "Resguardado",
  MAINTENANCE: "Mantenimiento",
};

/** "Almacenado (Stored)" — el formato pedido para los selectores del header. */
export const statusOptionLabel = (status: string) => {
  const key = status.trim().toUpperCase();
  const en = formatStatusLabel(key);
  const es = STATUS_ES[key];
  return es ? `${es} (${en})` : en;
};

/** Estado de calibración de la herramienta: vive en `tools.status`, no en el artículo. */
export const TOOL_STATUSES = ["CALIBRADO", "VENCIDO", "EN CALIBRACION"] as const;

export type ToolStatus = (typeof TOOL_STATUSES)[number];

const TOOL_STATUS_EN: Record<ToolStatus, string> = {
  CALIBRADO: "Calibrated",
  VENCIDO: "Expired",
  "EN CALIBRACION": "In Calibration",
};

const TOOL_STATUS_ES: Record<ToolStatus, string> = {
  CALIBRADO: "Calibrado",
  VENCIDO: "Vencido",
  "EN CALIBRACION": "En calibración",
};

/**
 * Prefijo que distingue un subestado de herramienta de un `articles.status`.
 * Ambos comparten el mismo filtro de columna, pero se resuelven contra campos
 * distintos: sin el prefijo, "VENCIDO" se buscaría en articles.status.
 */
export const TOOL_STATUS_PREFIX = "tool:";

export const toolStatusFilterValue = (status: ToolStatus) =>
  `${TOOL_STATUS_PREFIX}${status}`;

/** Devuelve el subestado de herramienta si el filtro apunta a uno. */
export const parseToolStatusFilter = (value?: string | null) =>
  value?.startsWith(TOOL_STATUS_PREFIX)
    ? value.slice(TOOL_STATUS_PREFIX.length)
    : null;

export const ARTICLE_STATUS_OPTIONS = ARTICLE_STATUSES.map((value) => ({
  value,
  label: statusOptionLabel(value),
}));

export const TOOL_STATUS_OPTIONS = TOOL_STATUSES.map((value) => ({
  value: toolStatusFilterValue(value),
  label: `${TOOL_STATUS_ES[value]} (${TOOL_STATUS_EN[value]})`,
}));
