import type { GeneralArticleConversion } from '@/types/purchase'

/**
 * Reexpresa un costo desde la unidad en que se registró hacia la unidad base
 * del artículo. Es SOLO presentación: el costo crudo (ej: "$10 por CAJA") no se
 * toca en el backend; aquí se deriva su equivalente por unidad base.
 *
 * `base_per_unit` es cuántas unidades base hay en 1 unidad de origen, así que
 * el costo por unidad base es el costo declarado dividido entre ese factor:
 * $10 / (1 CAJA = 20 UNID) = $0.50 por unidad. Es la operación inversa a la de
 * la cantidad (más unidades → menor costo unitario), y vale igual si la unidad
 * de origen es mayor o menor que la base. Espeja
 * `FilterDispatchCostRepository::costInBaseUnit` del backend.
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

  const conversion = conversions.find((row) => Number(row.unit_id) === from)
  const factor = Number(conversion?.base_per_unit)

  if (!(factor > 0)) return cost

  return cost / factor
}
