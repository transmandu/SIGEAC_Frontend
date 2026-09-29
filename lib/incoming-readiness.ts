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
};

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
