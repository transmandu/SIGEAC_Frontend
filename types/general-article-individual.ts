/**
 * Artículo individual dentro de la existencia de un artículo general.
 * Mientras esté en el almacén (STORED / INTOOLBOX) cuenta dentro de `quantity`.
 */
export type IndividualType =
  "HARDWARE_TOOL" | "IT_EQUIPMENT" | "OTHER_EQUIPMENT";

export type IndividualStatus =
  | "STORED"
  | "INTOOLBOX"
  | "DISPATCHED"
  | "MAINTENANCE"
  | "IN_TRANSFER"
  | "DISPOSED";

export interface GeneralArticleIndividual {
  id: number;
  general_article_id: number;
  type: IndividualType;
  identifier: string;
  status: IndividualStatus;
  tool_box_id: number | null;
  /** Caja en la que está; solo viene en los listados que la cargan. */
  tool_box?: { id: number; name: string } | null;
  general_article_intake_id: number | null;
  disposed_reason: string | null;
  disposed_at: string | null;
  registered_by: string | null;
  created_at: string | null;
}

export interface IndividualsSummary {
  quantity: number;
  /** Artículos individuales que siguen en el almacén y cuentan dentro de `quantity`. */
  stocked: number;
  /** Lo que queda sin identificar. */
  anonymous: number;
  type: IndividualType | null;
  individualizable: boolean;
  blocker: string | null;
}

export interface IndividualsResponse {
  summary: IndividualsSummary;
  types: IndividualType[];
  individuals: GeneralArticleIndividual[];
}

/** Lo que el confirmation-preview responde sobre identificar artículos individuales al confirmar. */
export type IndividualizationPreview =
  | {
      status: "AVAILABLE";
      types: IndividualType[];
      locked_type: IndividualType | null;
      /** Cuántos artículos entran: tope de identificadores. */
      max: number;
    }
  | { status: "UNAVAILABLE"; reason: string };

export const INDIVIDUAL_TYPE_LABEL: Record<IndividualType, string> = {
  HARDWARE_TOOL: "Herramienta de ferretería",
  IT_EQUIPMENT: "Equipo informático",
  OTHER_EQUIPMENT: "Otro equipo",
};

export const INDIVIDUAL_TYPE_HINT: Record<IndividualType, string> = {
  HARDWARE_TOOL: "Se guarda en cajas de herramientas y vuelve tras cada uso.",
  IT_EQUIPMENT: "Teclados, ratones, monitores, equipos con serial.",
  OTHER_EQUIPMENT: "Cualquier otro artículo que deba llevarse por identificador.",
};

export const INDIVIDUAL_STATUS_LABEL: Record<IndividualStatus, string> = {
  STORED: "En almacén",
  INTOOLBOX: "En caja de herramientas",
  DISPATCHED: "Despachada",
  MAINTENANCE: "En taller",
  IN_TRANSFER: "En traslado",
  DISPOSED: "Dada de baja",
};

export const INDIVIDUAL_STATUS_TONE: Record<
  IndividualStatus,
  "emerald" | "blue" | "amber" | "violet" | "sky" | "slate"
> = {
  STORED: "emerald",
  INTOOLBOX: "blue",
  DISPATCHED: "amber",
  MAINTENANCE: "violet",
  IN_TRANSFER: "sky",
  DISPOSED: "slate",
};

export const isStockedIndividual = (status: IndividualStatus) =>
  status === "STORED" || status === "INTOOLBOX";

/**
 * Separa lo que el almacenista pegó o escribió en identificadores sueltos:
 * uno por línea, o separados por coma o punto y coma. Ignora vacíos.
 */
export function parseIdentifiers(raw: string): string[] {
  return raw
    .split(/[\n\r,;]+/)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

/** Identificadores que aparecen más de una vez (sin distinguir mayúsculas). */
export function repeatedIdentifiers(list: string[]): string[] {
  const seen = new Map<string, string>();
  const repeated = new Set<string>();

  for (const value of list) {
    const key = value.toLowerCase();
    if (seen.has(key)) repeated.add(seen.get(key)!);
    else seen.set(key, value);
  }

  return [...repeated];
}

/**
 * A quién se entregó lo que salió en una salida. `with_box` dice si salió CON su
 * caja o se pidió suelto para un trabajo concreto.
 */
export interface ToolHolder {
  request_number: string | null;
  who: string | null;
  destination?: string | null;
  with_box?: boolean;
  tool_box_id?: number | null;
  /** El hecho es un regreso: la entrega es la que se cerraba. */
  returned?: boolean;
}

/** Artículo individual de ferretería con su artículo, tal como la devuelven las cajas de herramientas. */
export interface ToolBoxIndividual {
  id: number;
  general_article_id: number;
  type: IndividualType;
  identifier: string;
  status: IndividualStatus;
  /** Quién lo tiene si está fuera de la caja. */
  holder?: ToolHolder | null;
  general_article?: {
    id: number;
    description: string;
    brand_model: string | null;
    variant_type: string | null;
  } | null;
}
