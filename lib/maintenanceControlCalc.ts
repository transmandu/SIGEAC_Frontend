import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { MaintenanceControlItem } from "@/types";
import { AircraftDailyAverage } from "@/hooks/mantenimiento/planificacion/useGetAircraftDailyAverage";

// Niveles graduados en vez de un simple vigente/vencido: los dos cortes
// intermedios son múltiplos del propio % de remanente configurado en el
// control, así un mismo umbral define las 4 franjas de color.
export type ItemStatus = "OK" | "WARNING" | "CRITICAL" | "OVERDUE";

export interface ComputedMaintenanceItem {
  frequency: string;
  applied: string;
  appliedSub?: string;
  next: string;
  remaining: string;
  estimate: string;
  status: ItemStatus;
}

const UNIT_LABEL: Record<string, string> = { HOURS: "Horas", CYCLES: "Ciclos", DAYS: "Días" };
const UNIT_SHORT: Record<string, string> = { HOURS: "hrs", CYCLES: "cic", DAYS: "días" };

const fmtNumber = (value: number) => value.toLocaleString("es-VE", { maximumFractionDigits: 2 });
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
 */
export function computeMaintenanceItem(
  item: MaintenanceControlItem,
  aircraft: { flight_hours: number | string; flight_cycles: number | string },
  dailyAverage: AircraftDailyAverage | undefined,
  remainingPercentage: number,
): ComputedMaintenanceItem {
  const unit = item.counting_method;
  const limit = Number(item.limit_value);
  const appliedDate = parseISO(item.first_applied_date);
  const frequency = `${fmtNumber(limit)} ${UNIT_LABEL[unit]}`;
  const applied = fmtDate(appliedDate);
  const threshold = limit * (remainingPercentage / 100);

  if (unit === "DAYS") {
    const nextDate = addDays(appliedDate, limit);
    const remainingDays = differenceInCalendarDays(nextDate, new Date());

    return {
      frequency,
      applied,
      next: fmtDate(nextDate),
      remaining: remainingDays < 0 ? `Vencido hace ${Math.abs(remainingDays)} días` : `${remainingDays} días`,
      estimate: "—",
      status: classifyStatus(remainingDays, threshold),
    };
  }

  const initialValue =
    item.first_applied_value !== null && item.first_applied_value !== undefined
      ? Number(item.first_applied_value)
      : null;

  if (initialValue === null) {
    // No debería pasar (el formulario lo exige para horas/ciclos), pero sin
    // el dato no hay con qué calcular.
    return { frequency, applied, next: "—", remaining: "Falta lectura inicial", estimate: "—", status: "OK" };
  }

  const currentValue = unit === "HOURS" ? Number(aircraft.flight_hours) : Number(aircraft.flight_cycles);
  const dailyAvg = unit === "HOURS" ? dailyAverage?.daily_average_hours : dailyAverage?.daily_average_cycles;

  const nextDue = initialValue + limit;
  const remainingValue = nextDue - currentValue;

  let estimate = "Sin vuelos en los últimos 30 días";
  if (dailyAvg && dailyAvg > 0) {
    const daysUntilDue = remainingValue / dailyAvg;
    estimate = fmtDate(addDays(new Date(), Math.round(daysUntilDue)));
  }

  return {
    frequency,
    applied,
    appliedSub: `${fmtNumber(initialValue)} ${UNIT_SHORT[unit]}`,
    next: `${fmtNumber(nextDue)} ${UNIT_SHORT[unit]}`,
    remaining:
      remainingValue < 0
        ? `Vencido (${fmtNumber(Math.abs(remainingValue))} ${UNIT_SHORT[unit]})`
        : `${fmtNumber(remainingValue)} ${UNIT_SHORT[unit]}`,
    estimate,
    status: classifyStatus(remainingValue, threshold),
  };
}
