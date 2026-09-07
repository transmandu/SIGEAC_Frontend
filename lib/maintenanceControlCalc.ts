import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ComputedMaintenanceInterval, MaintenanceControlItem, MaintenanceItemStatus } from "@/types";

// Reexport: varios consumidores ya importan el tipo de estado desde acá.
export type ItemStatus = MaintenanceItemStatus;

/**
 * Las mismas 4 franjas en todos lados que muestran estado de un ítem (tabla
 * de gestión, snapshot histórico): color y qué significan en texto llano.
 * Vivía duplicado como const local de la página de detalle.
 */
export const STATUS_META: Record<ItemStatus, { label: string; dot: string; text: string; row: string }> = {
  OK: {
    label: "Vigente",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    row: "",
  },
  WARNING: {
    label: "Alerta temprana",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    row: "bg-amber-500/[0.04]",
  },
  CRITICAL: {
    label: "Crítico",
    dot: "bg-orange-500",
    text: "text-orange-700 dark:text-orange-400",
    row: "bg-orange-500/[0.04]",
  },
  OVERDUE: {
    label: "Vencido",
    dot: "bg-red-600",
    text: "text-red-700 dark:text-red-400",
    row: "bg-red-600/[0.04]",
  },
};

export interface SingleLimitResult {
  frequency: string;
  next: string;
  remaining: string;
  estimate: string;
  status: ItemStatus;
}

export interface ComputedMaintenanceItem {
  frequency: string;
  applied: string;
  appliedSub?: string;
  next: string;
  remaining: string;
  estimate: string;
  status: ItemStatus;
  providerName: string;
  /**
   * Intervalos adicionales ("lo que ocurra primero" — ej. 6000 Hrs Ó 1825
   * Días Ó 3000 Ciclos): mismas cinco piezas que el intervalo principal, uno
   * por cada intervalo extra que declaró el ítem.
   */
  extras: SingleLimitResult[];
}

const UNIT_LABEL: Record<string, string> = { HOURS: "Horas", CYCLES: "Ciclos", DAYS: "Días" };
const UNIT_SHORT: Record<string, string> = { HOURS: "hrs", CYCLES: "cic", DAYS: "días" };

// Enteros sin separador de miles (26739, no 26.739 ni 26,739); si hay
// decimales, van con coma (100,24). `toLocaleString` con "es-VE" agrupa de
// más, así que se arma el string a mano.
export const fmtNumber = (value: number) => {
  const [intPart, decPart] = value.toFixed(2).split(".");
  const trimmedDecimals = decPart === "00" ? "" : decPart.replace(/0+$/, "");
  return trimmedDecimals ? `${intPart},${trimmedDecimals}` : intPart;
};
const fmtDate = (date: Date) => format(date, "dd/MM/yyyy", { locale: es });

/**
 * Traduce UN intervalo ya calculado por el backend (MaintenanceControlCalculator)
 * a las cinco piezas que muestra la tabla. Puramente presentación: la
 * aritmética (próximo/remanente/estimación/estado) ya vino resuelta —
 * antes vivía acá y duplicada a medias en
 * MaintenanceControlFormPdfService::buildRow(), con riesgo real de que
 * divergieran.
 */
function formatInterval(interval: ComputedMaintenanceInterval): SingleLimitResult {
  const unit = interval.counting_method;
  const frequency = `${fmtNumber(Number(interval.limit_value))} ${UNIT_LABEL[unit]}`;

  if (unit === "DAYS") {
    const remainingDays = interval.remaining_value;
    return {
      frequency,
      next: interval.next_date ? fmtDate(parseISO(interval.next_date)) : "—",
      remaining:
        remainingDays === null
          ? "—"
          : remainingDays < 0
            ? `Vencido hace ${Math.abs(remainingDays)} días`
            : `${remainingDays} días`,
      estimate: "—",
      status: interval.status ?? "OK",
    };
  }

  if (interval.remaining_value === null || interval.next_value === null) {
    // No debería pasar (el formulario exige lectura inicial en horas/ciclos),
    // pero sin el dato no hay con qué mostrar próximo/remanente. El backend
    // manda status null en ese caso: no cuenta para el estado del ítem.
    return { frequency, next: "—", remaining: "Falta lectura inicial", estimate: "—", status: interval.status ?? "OK" };
  }

  return {
    frequency,
    next: `${fmtNumber(interval.next_value)} ${UNIT_SHORT[unit]}`,
    remaining:
      interval.remaining_value < 0
        ? `Vencido (${fmtNumber(Math.abs(interval.remaining_value))} ${UNIT_SHORT[unit]})`
        : `${fmtNumber(interval.remaining_value)} ${UNIT_SHORT[unit]}`,
    // Ya vencido no se estima nada hacia adelante (el backend manda
    // estimate_date null ahí), y sin vuelos recientes tampoco hay promedio
    // con qué proyectar: son dos "sin estimación" distintos.
    estimate: interval.estimate_date
      ? fmtDate(parseISO(interval.estimate_date))
      : interval.remaining_value < 0
        ? "—"
        : "Sin vuelos en los últimos 30 días",
    status: interval.status ?? "OK",
  };
}

/**
 * Traduce un certificado/servicio a lo que se muestra en el page de gestión:
 * Frecuencia, Aplicada, Próximo, Remanente y Estimación. Todo el cálculo
 * (incluido el estado combinado de varios intervalos, "lo que ocurra
 * primero") ya viene resuelto en `item.computed` desde el backend — acá solo
 * se formatea para pantalla.
 */
/**
 * Solo lo que hace falta para calcular: un MaintenanceControlItem completo
 * lo cumple, y también un MaintenanceControlSnapshotItem (estado a una
 * fecha pasada) que no trae los demás campos del ítem.
 */
type ComputableItem = Pick<MaintenanceControlItem, "computed" | "latest_compliance" | "maintenance_provider">;

export function computeMaintenanceItem(item: ComputableItem): ComputedMaintenanceItem {
  const computed = item.computed;
  const latest = item.latest_compliance;

  // Defensivo: computed siempre debería venir del backend (index/show ya lo
  // adjuntan); sin él no hay con qué calcular nada.
  if (!computed) {
    return {
      frequency: "—",
      applied: "—",
      next: "—",
      remaining: "—",
      estimate: "—",
      status: "OK",
      providerName: latest?.maintenance_provider?.name ?? item.maintenance_provider?.name ?? "—",
      extras: [],
    };
  }

  const [primaryInterval, ...extraIntervals] = computed.intervals;
  const primary = formatInterval(primaryInterval);
  const extras = extraIntervals.map(formatInterval);

  return {
    ...primary,
    applied: fmtDate(parseISO(computed.applied_date)),
    appliedSub:
      computed.applied_value !== null && computed.applied_unit
        ? `${fmtNumber(computed.applied_value)} ${UNIT_SHORT[computed.applied_unit]}`
        : undefined,
    providerName: computed.provider_name ?? "—",
    status: computed.status,
    extras,
  };
}
