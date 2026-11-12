import type { RequisitionCycleStage } from "@/types/purchase";

/**
 * "3 d 4 h", "45 min": la unidad mayor y la que le sigue. Se toman contiguas
 * —no las dos mayores con valor— para no producir saltos como "296 d 57 min",
 * que se lee como si faltara algo. Misma regla que el historial de estados de
 * un artículo.
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return "menos de 1 min";

  const units = [
    { label: "d", value: Math.floor(seconds / 86400) },
    { label: "h", value: Math.floor((seconds % 86400) / 3600) },
    { label: "min", value: Math.floor((seconds % 3600) / 60) },
  ];

  const first = units.findIndex((unit) => unit.value > 0);

  return units
    .slice(first, first + 2)
    .filter((unit) => unit.value > 0)
    .map((unit) => `${unit.value} ${unit.label}`)
    .join(" ");
};

/** Bajo el minuto no hay nada que medir: donde falta espacio se resume. */
export const compactDuration = (seconds: number): string =>
  seconds < 60 ? "< 1 min" : formatDuration(seconds);

/**
 * La etapa vigente crece con el reloj: el servidor da lo que llevaba al
 * responder y aquí se le suma lo transcurrido desde que llegó la respuesta.
 */
export const liveSeconds = (
  base: number | null,
  elapsedSinceFetchMs: number,
): number | null =>
  base === null
    ? null
    : base + Math.max(0, Math.floor(elapsedSinceFetchMs / 1000));

/** La etapa sigue corriendo: su permanencia no está cerrada. */
export const isRunning = (stage: RequisitionCycleStage): boolean =>
  stage.state === "current" || (stage.state === "partial" && !stage.left_at);

export const holdingEntries = (
  stage: RequisitionCycleStage,
): [string, number][] =>
  Array.isArray(stage.holding) ? [] : Object.entries(stage.holding);

/** Estados con que el almacén nombra a un artículo, para el detalle de Incoming. */
export const HOLDING_LABELS: Record<string, string> = {
  TRANSIT: "En tránsito",
  RECEPTION: "En recepción",
  INCOMING: "En inspección",
  CHECKING: "En revisión",
  QUARANTINE: "En cuarentena",
  PENDING_REINSPECTION: "Pendiente de re-inspección",
  WAITING_FOR_FORMAT: "En espera de formato",
  WAITING_TO_LOCATE: "En espera de ubicación",
  TO_DETERMINATE: "Destino indeterminado",
  PENDING: "Por confirmar",
  REJECTED: "Rechazada por almacén",
};
