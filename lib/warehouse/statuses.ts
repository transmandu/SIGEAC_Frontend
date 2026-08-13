/**
 * Valores reales de `articles.status` (mayúsculas en BD). El orden refleja el
 * flujo del artículo.
 */
export const ARTICLE_STATUSES = [
  "INCOMING",
  "RECEPTION",
  "CHECKING",
  "QUARANTINE",
  "PENDING_REINSPECTION",
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
  PENDING_REINSPECTION: "Pendiente de re-inspección",
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

/** Solo el español; para las vistas que no muestran el valor en inglés. */
export const statusLabelEs = (status?: string | null) => {
  if (!status) return "N/A";
  const key = status.trim().toUpperCase();
  return STATUS_ES[key] ?? formatStatusLabel(key);
};

/** Igual que statusLabelEs, en mayúsculas: "ALMACENADO". */
export const statusLabelEsUpper = (status?: string | null) =>
  statusLabelEs(status).toLocaleUpperCase("es");

/** Estados de una entrada de artículo general (general_article_intakes). */
const INTAKE_STATUS_ES: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  REJECTED: "Rechazada",
  DELIVERED: "Entregada",
};

export const intakeStatusLabelEs = (status?: string | null) => {
  if (!status) return "N/A";
  const key = status.trim().toUpperCase();
  return INTAKE_STATUS_ES[key] ?? formatStatusLabel(key);
};

/** Igual que intakeStatusLabelEs, en mayúsculas: "CONFIRMADA". */
export const intakeStatusLabelEsUpper = (status?: string | null) =>
  intakeStatusLabelEs(status).toLocaleUpperCase("es");

/** "Almacenado (Stored)" — el formato pedido para los selectores del header. */
export const statusOptionLabel = (status: string) => {
  const key = status.trim().toUpperCase();
  const en = formatStatusLabel(key);
  const es = STATUS_ES[key];
  return es ? `${es} (${en})` : en;
};

/**
 * Estados en que el artículo está bajo control del almacén y por tanto se puede
 * editar o eliminar. En el resto está despachado, en tránsito o en revisión de
 * calidad: modificarlo ahí desincronizaría el inventario con lo que hay en piso.
 *
 * INTOOLBOX entra porque la herramienta en caja sigue siendo del almacén.
 *
 * Los dos estados del ciclo de cuarentena quedan fuera a propósito: ahí el
 * artículo se corrige desde el submódulo de compras, que registra qué cambió
 * para que el inspector lo verifique. Editarlo por el camino del almacén se
 * saltaría ese registro.
 */
const MODIFIABLE_STATUSES = new Set([
  "STORED",
  "CHECKING",
  "INTOOLBOX",
]);

/** El estado llega en mayúsculas de BD, pero hay vistas que lo pasan en minúsculas. */
export const canModifyArticle = (status?: string | null) =>
  MODIFIABLE_STATUSES.has(String(status ?? "").trim().toUpperCase());

/**
 * Hitos que `movements` registra pero que no son un `articles.status`: vienen del
 * ciclo de despacho. Aparecen en el historial de estados junto a los estados.
 */
const MOVEMENT_MILESTONE_ES: Record<string, string> = {
  REGISTERED: "Registrado",
  RETURNED: "Devuelto",
  CANCELLED: "Cancelado",
  DELETED: "Eliminado",
};

export const isMovementMilestone = (value?: string | null) =>
  !!value && value.trim().toUpperCase() in MOVEMENT_MILESTONE_ES;

/** Etiqueta de una entrada del historial, sea un estado o un hito de movimiento. */
export const timelineEntryLabel = (value: string) => {
  const key = value.trim().toUpperCase();
  const es = MOVEMENT_MILESTONE_ES[key];
  return es ? `${es} (${formatStatusLabel(key)})` : statusOptionLabel(key);
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
