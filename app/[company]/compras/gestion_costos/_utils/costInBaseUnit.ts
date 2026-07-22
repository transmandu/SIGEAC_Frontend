import type { GeneralArticleConversion } from '@/types/purchase'

/**
 * Reexpresa un costo desde la unidad en que se registró hacia la unidad base
 * del artículo. Es SOLO presentación: el costo crudo (ej: "$10 por CAJA") no se
 * toca en el backend; aquí se deriva su equivalente por unidad base.
 *
 * El costo por unidad base es el costo declarado dividido entre cuántas
 * unidades base caben en 1 unidad de origen: $10 / (1 CAJA = 20 UNID) = $0.50
 * por unidad. Es la operación inversa a la de la cantidad (más unidades → menor
 * costo unitario). Espeja `FilterDispatchCostRepository::costInBaseUnit` del
 * backend.
 *
 * Si no hay unidad de origen, ya coincide con la base, o no hay conversión
 * registrada entre ambas, se devuelve el costo crudo (mejor el dato real que
 * inventar una conversión).
 */
export function costInBaseUnit(
  cost: number,
  fromUnitId: number | string | null | undefined,
  baseUnitId: number | string | null | undefined,
  conversions: GeneralArticleConversion[] | undefined,
): number {
  // El JSON del backend puede traer los IDs como string; se normalizan a número
  // para que las comparaciones no fallen por tipo (5 vs "5").
  const from = fromUnitId != null ? Number(fromUnitId) : null
  const base = baseUnitId != null ? Number(baseUnitId) : null

  if (
    from == null ||
    base == null ||
    Number.isNaN(from) ||
    Number.isNaN(base) ||
    from === base ||
    !conversions?.length
  ) {
    return cost
  }

  for (const conversion of conversions) {
    const primaryId = Number(conversion.primary_unit)
    const secondaryId = Number(conversion.secondary_unit)
    const equivalence = Number(conversion.equivalence)

    if (!(equivalence > 0)) continue

    // La unidad base siempre vale 1. Buscamos cuántas unidades base hay en 1
    // unidad de origen (ej: 1 CAJA = 20 UNID, 1 ROLLO = 175 METROS) y dividimos
    // el costo entre eso: $10 / 20 = $0.50 por unidad base.

    // equivalence = "1 primaria = equivalence secundarias".
    // origen=primaria, base=secundaria → 1 origen = equivalence base → /equiv.
    if (primaryId === from && secondaryId === base) {
      return cost / equivalence
    }

    // origen=secundaria, base=primaria → 1 base = equivalence origen →
    // 1 origen = 1/equivalence base → *equiv (inverso).
    if (primaryId === base && secondaryId === from) {
      return cost * equivalence
    }
  }

  // Sin conversión disponible entre ambas unidades: se conserva el costo crudo.
  return cost
}
