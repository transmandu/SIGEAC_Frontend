import type { Condition } from "@/types";

export type ConditionLabel = { es: string; en: string };

/**
 * Traducción de los nombres de condición conocidos, solo para mostrarlos.
 * Qué condiciones existen lo dice la tabla `conditions` de cada compañía (ver
 * conditionOptions); un nombre que no esté aquí se muestra tal cual.
 */
const CONDITION_LABELS: Record<string, ConditionLabel> = {
  NEW: { es: "Nuevo", en: "New" },
  OVERHAULED: { es: "Reacondicionado", en: "Overhauled" },
  "FACTORY NEW": { es: "Nuevo de fábrica", en: "Factory New" },
  REPAIRED: { es: "Reparado", en: "Repaired" },
  REPAIRABLE: { es: "Reparable", en: "Repairable" },
  TESTED: { es: "Probado", en: "Tested" },
  "AS REMOVED": { es: "Removido", en: "As Removed" },
  INSPECTED: { es: "Inspeccionado", en: "Inspected" },
  SAFEKEEPING: { es: "Resguardo", en: "Safekeeping" },
};

export function formatCondition(value?: string | null): ConditionLabel | null {
  if (!value) return null;
  const key = String(value).trim().toUpperCase();
  return CONDITION_LABELS[key] ?? { es: String(value), en: String(value) };
}

/** "Nuevo (New)" — el formato con que se muestran las condiciones en la tabla. */
export const conditionOptionLabel = (value: string) => {
  const c = formatCondition(value);
  if (!c) return value;
  return c.es === c.en ? c.es : `${c.es} (${c.en})`;
};

/**
 * Opciones de filtro por condición a partir de la tabla `conditions` de la
 * compañía. El valor es el `conditions.name` crudo, que es contra lo que filtra
 * el servidor.
 */
export const conditionOptions = (
  conditions: Pick<Condition, "name">[] | undefined,
) =>
  (conditions ?? [])
    .map((condition) => condition.name?.trim())
    .filter((name): name is string => !!name)
    .map((name) => ({ value: name, label: conditionOptionLabel(name) }));
