import { isConsumableCategory } from "@/lib/purchases/requisition-measure";
import type { ArticleDocumentRequirementSummary } from "@/types";
import type {
  IncomingBlockingReason,
  IncomingReadiness,
} from "@/types/inventory/queues";

/**
 * Traducción de los motivos por los que un artículo no puede pasar a incoming.
 *
 * Vive fuera de las pantallas porque las dos que los muestran —recepción de
 * almacén y compras · en tránsito— deben nombrarlos igual: son la misma regla
 * legal vista desde los dos lados del flujo.
 */
export const INCOMING_REASON_LABELS: Record<IncomingBlockingReason, string> = {
  MISSING_PURCHASE_ORDER: "Sin número de orden de compra",
  MISSING_DOCUMENT_REQUIREMENTS: "Sin documentación requerida indicada",
  PENDING_DOCUMENTS: "Documentación requerida sin cargar",
  MISSING_IDENTITY: "Sin serial que lo distinga",
};

/**
 * Qué se espera de cada rol ante el mismo motivo. Declarar qué documentos exige
 * el artículo no es competencia exclusiva de almacén, pero por conocimiento
 * técnico son quienes mejor saben cuáles corresponden.
 */
export const INCOMING_REASON_ACTIONS: Record<
  IncomingBlockingReason,
  { purchasing: string; warehouse: string }
> = {
  MISSING_PURCHASE_ORDER: {
    purchasing: "Asigna el número de orden de compra.",
    warehouse: "Compras debe asignar el número de orden de compra.",
  },
  MISSING_DOCUMENT_REQUIREMENTS: {
    purchasing: "Indica qué documentación requiere el artículo.",
    warehouse: "Indícala tú, para que compras pueda conseguirla.",
  },
  PENDING_DOCUMENTS: {
    purchasing: "Carga los documentos requeridos.",
    warehouse: "Compras debe cargar los documentos requeridos.",
  },
  // No es un pendiente de un área en particular: lo registra quien lo tenga a
  // la mano. Compras lo conoce si viene en los documentos del vendedor; almacén
  // lo lee en el propio artículo. `{article}` lo resuelve `reasonAction`.
  MISSING_IDENTITY: {
    purchasing:
      "Si el serial viene en los documentos, regístralo desde el detalle del artículo; si no, almacén lo lee en {article}.",
    warehouse:
      "Léelo en {article} y regístralo desde el detalle del artículo (en una herramienta sin número de parte, su especificación).",
  },
};

const ARTICLE_BY_CATEGORY: Record<string, string> = {
  TOOL: "la herramienta",
  HERRAMIENTA: "la herramienta",
  PART: "la parte",
  PARTE: "la parte",
  COMPONENT: "el componente",
  COMPONENTE: "el componente",
};

/**
 * Qué se espera ante un motivo, nombrando al artículo por su categoría
 * ("la herramienta", "la parte", "el componente") en vez de un genérico.
 */
export const reasonAction = (
  reason: IncomingBlockingReason,
  audience: "purchasing" | "warehouse",
  category?: string | null,
): string | undefined => {
  const noun =
    ARTICLE_BY_CATEGORY[(category ?? "").toUpperCase().trim()] ?? "el artículo";

  return INCOMING_REASON_ACTIONS[reason]?.[audience].replace("{article}", noun);
};

/**
 * ¿Hay que confirmar la cantidad al pasar el artículo a recepción? Solo en un
 * consumible: una compra suya puede llegar en varias cajas. Los demás
 * artículos son uno a uno y se reciben tal cual.
 */
export const needsReceivedQuantity = (article: {
  batch?: { category?: string | null } | null;
  quantity?: number | null;
}): boolean =>
  isConsumableCategory(article.batch?.category) &&
  Number(article.quantity ?? 0) > 0;

/** Los motivos ya traducidos, en el orden en que llegan del backend. */
export const readinessLabels = (readiness?: IncomingReadiness): string[] =>
  (readiness?.reasons ?? []).map(
    (reason) => INCOMING_REASON_LABELS[reason] ?? reason,
  );

/**
 * Un artículo sin `incoming_readiness` se trata como listo: es el caso de una
 * respuesta vieja en caché, y bloquear por un campo ausente dejaría la pantalla
 * inoperante en vez de degradarse al comportamiento anterior. El backend valida
 * de todos modos.
 */
export const isReadyForIncoming = (readiness?: IncomingReadiness): boolean =>
  readiness?.ready ?? true;

/**
 * Documentos requeridos aún sin archivo, que impiden pasar a recepción. En un
 * consumible también: lo que se le perdona es la retención en el incoming, que
 * pasa con aviso (`incoming_readiness.warnings`), no este requisito.
 */
export const blockingPendingRequirements = (article: {
  document_requirements?: ArticleDocumentRequirementSummary[] | null;
}): ArticleDocumentRequirementSummary[] =>
  (article.document_requirements ?? []).filter(
    (requirement) => (requirement.documents ?? []).length === 0,
  );

/** Faltantes de documentación con los que un consumible pasa igual a incoming. */
export const readinessWarnings = (
  readiness?: IncomingReadiness,
): IncomingBlockingReason[] => readiness?.warnings ?? [];
