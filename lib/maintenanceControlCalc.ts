import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { MaintenanceControlItem } from "@/types";
import { AircraftDailyAverage } from "@/hooks/mantenimiento/planificacion/useGetAircraftDailyAverage";

// Niveles graduados en vez de un simple vigente/vencido: los dos cortes
// intermedios son múltiplos del propio % de remanente configurado en el
// control, así un mismo umbral define las 4 franjas de color.
export type ItemStatus = "OK" | "WARNING" | "CRITICAL" | "OVERDUE";

const STATUS_SEVERITY: Record<ItemStatus, number> = { OK: 0, WARNING: 1, CRITICAL: 2, OVERDUE: 3 };

/** El límite que esté peor manda: un ítem con límite dual vence apenas UNO de los dos lo hace. */
function worseStatus(a: ItemStatus, b: ItemStatus): ItemStatus {
  return STATUS_SEVERITY[b] > STATUS_SEVERITY[a] ? b : a;
}

interface SingleLimitResult {
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
   * Límite secundario ("lo que ocurra primero" — ej. 6000 Hrs Ó 1825 Días):
   * mismas cinco piezas que el límite principal, presente solo si el ítem
   * declaró un segundo counting_method. El "Aplicada"/proveedor no se
   * repiten: un mismo cumplimiento resetea ambos relojes a la vez.
   */
  secondary?: SingleLimitResult;
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
 * remaining/threshold ya viene en la misma unidad (días, u horas/ciclos).
 * threshold = límite * (% de remanente / 100), el mismo número que ya se
 * muestra como referencia en el Excel ("15% remanente"); acá se reusa como
 * la unidad de medida de las 4 franjas: por debajo de 0 ya venció, hasta 1x
 * el umbral es crítico, hasta 2x es alerta temprana, más allá está vigente.
 */
function classifyStatus(remaining: number, threshold: number): ItemStatus {
  if (remaining < 0) return "OVERDUE";
  if (threshold <= 0) return remaining === 0 ? "CRITICAL" : "OK";
  if (remaining <= threshold) return "CRITICAL";
  if (remaining <= threshold * 2) return "WARNING";
  return "OK";
}

/**
 * Calcula frecuencia/próximo/remanente/estimación/estado de UN límite (el
 * principal o el secundario) — separado para que un ítem con límite dual
 * ("lo que ocurra primero") pueda evaluar los dos con la misma lógica.
 */
function computeSingleLimit(params: {
  unit: string;
  limit: number;
  extraDays: number;
  appliedDate: Date;
  initialValue: number | null;
  currentValue: number;
  dailyAvg: number | null | undefined;
  threshold: number;
}): SingleLimitResult {
  const { unit, limit, extraDays, appliedDate, initialValue, currentValue, dailyAvg, threshold } = params;
  const frequency = `${fmtNumber(limit)} ${UNIT_LABEL[unit]}`;

  if (unit === "DAYS") {
    const nextDate = addDays(appliedDate, limit + extraDays);
    const remainingDays = differenceInCalendarDays(nextDate, new Date());

    return {
      frequency: extraDays > 0 ? `${frequency} (+${extraDays}d)` : frequency,
      next: fmtDate(nextDate),
      remaining: remainingDays < 0 ? `Vencido hace ${Math.abs(remainingDays)} días` : `${remainingDays} días`,
      estimate: "—",
      status: classifyStatus(remainingDays, threshold),
    };
  }

  if (initialValue === null) {
    // No debería pasar (el formulario lo exige para horas/ciclos), pero sin
    // el dato no hay con qué calcular.
    return { frequency, next: "—", remaining: "Falta lectura inicial", estimate: "—", status: "OK" };
  }

  const nextDue = initialValue + limit;
  const remainingValue = nextDue - currentValue;

  let estimate = "Sin vuelos en los últimos 30 días";
  if (dailyAvg && dailyAvg > 0) {
    const daysUntilDue = remainingValue / dailyAvg;
    estimate = fmtDate(addDays(new Date(), Math.round(daysUntilDue)));
  }

  return {
    frequency,
    next: `${fmtNumber(nextDue)} ${UNIT_SHORT[unit]}`,
    remaining:
      remainingValue < 0
        ? `Vencido (${fmtNumber(Math.abs(remainingValue))} ${UNIT_SHORT[unit]})`
        : `${fmtNumber(remainingValue)} ${UNIT_SHORT[unit]}`,
    estimate,
    status: classifyStatus(remainingValue, threshold),
  };
}

/**
 * Traduce un certificado/servicio a lo que se muestra en el page de gestión:
 * Frecuencia, Aplicada, Próximo, Remanente y Estimación.
 *
 * En DÍAS "Próximo" ya es una fecha exacta (fecha aplicada + límite), así
 * que no hace falta "Estimación" aparte.
 *
 * En HORAS/CICLOS "Próximo" es un valor (no una fecha, porque depende de
 * cuánto vuele la aeronave); "Estimación" proyecta esa fecha usando el
 * promedio de horas/ciclos volados por día en los últimos 30 días — misma
 * lógica que "PROMEDIO ÚLTIMO MES" del Excel de referencia. El remanente se
 * calcula contra las horas/ciclos TOTALES actuales de la aeronave, no
 * contra la lectura que tenía en la fecha de primera aplicación.
 *
 * El % de remanente del control no interviene en "Estimación": solo define
 * las franjas de color del estado.
 *
 * Si el ítem tiene cumplimientos registrados, "Aplicada" (y de ahí en más
 * todo el cálculo) usa el MÁS RECIENTE en vez del dato de creación — igual
 * "Realizado Por" refleja quién hizo ese último cumplimiento, no
 * necesariamente quien quedó anotado al crear el certificado/servicio.
 *
 * Límite secundario ("lo que ocurra primero", ej. 6000 Hrs Ó 1825 Días —
 * el Excel de referencia declara ambos en la misma fila de un componente):
 * mismo cumplimiento, dos relojes. El estado final del ítem es el peor de
 * los dos — replicado en PHP en MaintenanceControlFormPdfService::buildRow(),
 * misma regla, mantenerlos en sincronía si se toca uno.
 */
export function computeMaintenanceItem(
  item: MaintenanceControlItem,
  aircraft: { flight_hours: number | string; flight_cycles: number | string },
  dailyAverage: AircraftDailyAverage | undefined,
  remainingPercentage: number,
): ComputedMaintenanceItem {
  const latest = item.latest_compliance;
  const providerName = latest?.maintenance_provider?.name ?? item.maintenance_provider?.name ?? "—";
  const appliedDate = latest ? parseISO(latest.compliance_date) : parseISO(item.first_applied_date);
  const applied = fmtDate(appliedDate);

  const initialValueFor = (unit: string, firstAppliedValue: number | string | null | undefined): number | null => {
    if (latest) return Number(unit === "HOURS" ? latest.hours_reading : latest.cycles_reading);
    return firstAppliedValue !== null && firstAppliedValue !== undefined ? Number(firstAppliedValue) : null;
  };
  const currentValueFor = (unit: string) =>
    unit === "HOURS" ? Number(aircraft.flight_hours) : Number(aircraft.flight_cycles);
  const dailyAvgFor = (unit: string) =>
    unit === "HOURS" ? dailyAverage?.daily_average_hours : dailyAverage?.daily_average_cycles;

  const unit = item.counting_method;
  const limit = Number(item.limit_value);
  const extraDays = item.extra_days !== null && item.extra_days !== undefined ? Number(item.extra_days) : 0;
  const threshold = limit * (remainingPercentage / 100);

  const primaryInitialValue = unit === "DAYS" ? null : initialValueFor(unit, item.first_applied_value);

  const primary = computeSingleLimit({
    unit,
    limit,
    extraDays,
    appliedDate,
    initialValue: primaryInitialValue,
    currentValue: unit === "DAYS" ? 0 : currentValueFor(unit),
    dailyAvg: unit === "DAYS" ? null : dailyAvgFor(unit),
    threshold,
  });

  const base: ComputedMaintenanceItem = {
    ...primary,
    applied,
    appliedSub: primaryInitialValue !== null ? `${fmtNumber(primaryInitialValue)} ${UNIT_SHORT[unit]}` : undefined,
    providerName,
  };

  if (!item.secondary_counting_method) {
    return base;
  }

  const secondaryUnit = item.secondary_counting_method;
  const secondaryLimit = Number(item.secondary_limit_value);
  const secondaryThreshold = secondaryLimit * (remainingPercentage / 100);

  const secondary = computeSingleLimit({
    unit: secondaryUnit,
    limit: secondaryLimit,
    extraDays: 0,
    appliedDate,
    initialValue: secondaryUnit === "DAYS" ? null : initialValueFor(secondaryUnit, item.secondary_first_applied_value),
    currentValue: secondaryUnit === "DAYS" ? 0 : currentValueFor(secondaryUnit),
    dailyAvg: secondaryUnit === "DAYS" ? null : dailyAvgFor(secondaryUnit),
    threshold: secondaryThreshold,
  });

  return {
    ...base,
    status: worseStatus(base.status, secondary.status),
    secondary,
  };
}
