import type { TagTone } from "@/components/misc/TagBadge";
import { formatCalendarDate } from "@/lib/date";
import type {
  AssignmentChangeType,
  EmploymentEndType,
  EmploymentStartType,
} from "@/types";

interface Meta {
  label: string;
  tone: TagTone;
}

export const END_TYPE_META: Record<EmploymentEndType, Meta> = {
  RESIGNATION: { label: "Renuncia", tone: "amber" },
  DISMISSAL: { label: "Despido", tone: "rose" },
  CONTRACT_END: { label: "Fin de contrato", tone: "amber" },
  MUTUAL_AGREEMENT: { label: "Mutuo acuerdo", tone: "amber" },
  RETIREMENT: { label: "Jubilación", tone: "slate" },
  DISABILITY: { label: "Incapacidad", tone: "slate" },
  DEATH: { label: "Fallecimiento", tone: "slate" },
  JOB_ABANDONMENT: { label: "Abandono del cargo", tone: "rose" },
  OTHER: { label: "Otro motivo", tone: "slate" },
};

export const CHANGE_TYPE_META: Record<AssignmentChangeType, Meta> = {
  INITIAL: { label: "Asignación inicial", tone: "blue" },
  PROMOTION: { label: "Ascenso", tone: "emerald" },
  DEMOTION: { label: "Descenso", tone: "amber" },
  LATERAL_MOVE: { label: "Movimiento lateral", tone: "blue" },
  RESTRUCTURING: { label: "Reestructuración", tone: "violet" },
  OPERATIONAL_NEED: { label: "Necesidad operativa", tone: "sky" },
  EMPLOYEE_REQUEST: { label: "Solicitud del empleado", tone: "sky" },
  OTHER: { label: "Otro motivo", tone: "slate" },
};

export const START_TYPE_LABEL: Record<EmploymentStartType, string> = {
  HIRE: "Ingreso",
  REHIRE: "Reingreso",
};

/** Los que una persona puede elegir; INITIAL solo lo escribe el sistema. */
export const SELECTABLE_END_TYPES = [
  "RESIGNATION",
  "DISMISSAL",
  "CONTRACT_END",
  "MUTUAL_AGREEMENT",
  "RETIREMENT",
  "DISABILITY",
  "DEATH",
  "JOB_ABANDONMENT",
  "OTHER",
] as const satisfies readonly EmploymentEndType[];

export const SELECTABLE_CHANGE_TYPES = [
  "PROMOTION",
  "DEMOTION",
  "LATERAL_MOVE",
  "RESTRUCTURING",
  "OPERATIONAL_NEED",
  "EMPLOYEE_REQUEST",
  "OTHER",
] as const satisfies readonly AssignmentChangeType[];

/** Egresos que exigen explicar qué pasó (igual que en el backend). */
export const END_TYPES_REQUIRING_REASON: readonly EmploymentEndType[] = [
  "DISMISSAL",
  "JOB_ABANDONMENT",
  "OTHER",
];

export const REASON_MAX = 500;

/** Tramo de fechas del historial: vigente, de un solo día o entre dos fechas. */
export const formatDayRange = (from: string, to: string | null): string => {
  const day = (value: string) => formatCalendarDate(value, "date", "—");

  if (to === null) return `Desde el ${day(from)}`;
  if (to === from) return `El ${day(from)}, solo ese día`;

  return `${day(from)} – ${day(to)}`;
};
