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
  fromUnitId: number | null | undefined,
  baseUnitId: number | null | undefined,
  conversions: GeneralArticleConversion[] | undefined,
): number {
  if (
    fromUnitId == null ||
    baseUnitId == null ||
    fromUnitId === baseUnitId ||
    !conversions?.length
  ) {
    return cost
  }

  for (const conversion of conversions) {
    const primaryId = Number(conversion.primary_unit)
    const secondaryId = Number(conversion.secondary_unit)
    const equivalence = Number(conversion.equivalence)

    if (!(equivalence > 0)) continue

    // equivalence = "1 primaria = equivalence secundarias".
    if (primaryId === fromUnitId && secondaryId === baseUnitId) {
      return cost / equivalence
    }

    if (primaryId === baseUnitId && secondaryId === fromUnitId) {
      return cost * equivalence
    }
  }

  // Sin conversión disponible: se conserva el costo crudo.
  return cost
}
