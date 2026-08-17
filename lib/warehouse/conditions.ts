export type ConditionLabel = { es: string; en: string }

const CONDITIONS: Array<{ value: string; es: string; en: string }> = [
  { value: "NEW", es: "Nuevo", en: "New" },
  { value: "OVERHAULED", es: "Reacondicionado", en: "Overhauled" },
  { value: "FACTORY NEW", es: "Nuevo de fábrica", en: "Factory New" },
  { value: "REPAIRED", es: "Reparado", en: "Repaired" },
  { value: "REPAIRABLE", es: "Reparable", en: "Repairable" },
  { value: "TESTED", es: "Probado", en: "Tested" },
  { value: "AS REMOVED", es: "Removido", en: "As Removed" },
  { value: "INSPECTED", es: "Inspeccionado", en: "Inspected" },
  { value: "SAFEKEEPING", es: "Resguardo", en: "Safekeeping" },
];

const CONDITION_MAP = new Map<string, ConditionLabel>(
  CONDITIONS.map((c) => [c.value.trim().toUpperCase(), { es: c.es, en: c.en }])
)

export function formatCondition(value?: string | null): ConditionLabel | null {
  if (!value) return null
  const key = String(value).trim().toUpperCase()
  return CONDITION_MAP.get(key) ?? { es: String(value), en: String(value) }
}

/** "Nuevo (New)" — el formato con que se muestran las condiciones en la tabla. */
export const conditionOptionLabel = (value: string) => {
  const c = formatCondition(value)
  if (!c) return value
  return c.es === c.en ? c.es : `${c.es} (${c.en})`
}

/**
 * Opciones del selector de Condición. El valor es el `conditions.name` crudo
 * que guarda la BD, así el filtro compara contra lo que trae el artículo.
 */
export const CONDITION_OPTIONS = CONDITIONS.map((c) => ({
  value: c.value,
  label: c.es === c.en ? c.es : `${c.es} (${c.en})`,
}))