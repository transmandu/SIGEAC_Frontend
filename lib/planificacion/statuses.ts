/**
 * Estados del ciclo de órdenes de trabajo. Debe coincidir con
 * WorkOrder::STATUSES del backend, que comparten la orden, sus tareas, las
 * no-rutinarias y las tareas de éstas.
 *
 * OPEN es disponibilidad para trabajar, no avance: agregar una tarea a una
 * orden no cerrada la devuelve a OPEN.
 */
export const WORK_ORDER_STATUSES = ["OPEN", "CLOSED"] as const;

export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

const WORK_ORDER_STATUS_ES: Record<string, string> = {
  OPEN: "Abierta",
  CLOSED: "Cerrada",
};

export const workOrderStatusLabelEs = (status?: string | null) => {
  if (!status) return "N/A";
  const key = status.trim().toUpperCase();
  return WORK_ORDER_STATUS_ES[key] ?? key;
};

/** Igual que workOrderStatusLabelEs, en mayúsculas: "ABIERTA". */
export const workOrderStatusLabelEsUpper = (status?: string | null) =>
  workOrderStatusLabelEs(status).toLocaleUpperCase("es");
