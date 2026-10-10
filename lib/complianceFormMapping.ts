import { MaintenanceCountingMethod } from "@/types";
import { parseISO } from "date-fns";

/**
 * Lo que el formulario de un control muestra como "aplicación" de un ítem sale
 * de su cumplimiento vigente: la fecha, la lectura de cada unidad y, en
 * componentes, lo que traía consumido. Un ítem sin cumplimiento vigente no
 * tiene nada de eso (se muestra vacío y se deja como está al guardar).
 */
type CurrentCompliance = {
  applied_date: string;
  applied_hours?: number | string | null;
  applied_cycles?: number | string | null;
  consumed_hours?: number | string | null;
  consumed_cycles?: number | string | null;
  consumed_days?: number | string | null;
} | null;

const toNumber = (value: number | string | null | undefined) =>
  value === null || value === undefined ? undefined : Number(value);

export const appliedDateOf = (compliance?: CurrentCompliance) =>
  compliance ? parseISO(compliance.applied_date) : undefined;

/** La lectura de la unidad del intervalo (los días no se leen). */
export const appliedReadingOf = (
  compliance: CurrentCompliance | undefined,
  unit: MaintenanceCountingMethod,
) =>
  unit === "HOURS"
    ? toNumber(compliance?.applied_hours)
    : unit === "CYCLES"
      ? toNumber(compliance?.applied_cycles)
      : undefined;

/** Lo consumido al iniciar, en la unidad del intervalo (solo componentes). */
export const consumedAtStartOf = (
  compliance: CurrentCompliance | undefined,
  unit: MaintenanceCountingMethod,
) =>
  toNumber(
    unit === "HOURS"
      ? compliance?.consumed_hours
      : unit === "CYCLES"
        ? compliance?.consumed_cycles
        : compliance?.consumed_days,
  );
