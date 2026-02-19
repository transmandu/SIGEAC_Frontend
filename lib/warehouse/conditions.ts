export type ConditionLabel = { es: string; en: string }

const CONDITIONS: Array<{ value: string; es: string; en: string }> = [
  { value: "NEW", es: "Nuevo", en: "New" },
  { value: "OVERHAULED", es: "Reacondicionado", en: "Overhauled" },
  { value: "FACTORY NEW", es: "Nuevo de fábrica", en: "Factory New" },
  { value: "REPAIRED", es: "Reparado", en: "Repaired" },
  { value: "REPAIRABLE", es: "Reparable", en: "Repairable" },
  { value: "TESTED", es: "Probado", en: "Tested" },
  { value: "AS REMOVED", es: "Removido", en: "As Removed" },
  { value: "INSPECTION", es: "Inspección", en: "Inspection" },
]

const CONDITION_MAP = new Map<string, ConditionLabel>(
  CONDITIONS.map((c) => [c.value.trim().toUpperCase(), { es: c.es, en: c.en }])
)

export function formatCondition(value?: string | null): ConditionLabel | null {
  if (!value) return null
  const key = String(value).trim().toUpperCase()
  return CONDITION_MAP.get(key) ?? { es: String(value), en: String(value) }
}
