import type { FilterFn } from '@tanstack/react-table'

import type { Requisition } from '@/types/purchase'

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

/**
 * Texto sobre el que busca el buscador global. Además de los campos de la
 * solicitud incluye los artículos, porque el usuario busca por material
 * ("thinner", un P/N) y espera ver las solicitudes que lo contienen.
 */
const getSearchableText = (requisition: Requisition): string => {
  const parts: (string | null | undefined)[] = [
    requisition.order_number,
    requisition.requested_by,
  ]

  for (const batch of requisition.batch ?? []) {
    parts.push(batch.name)

    for (const article of batch.batch_articles ?? []) {
      parts.push(article.article_part_number)
      // El alterno no está en el tipo de la vista de lista, pero el backend
      // lo envía en algunas solicitudes.
      parts.push((article as { article_alt_part_number?: string }).article_alt_part_number)
    }
  }

  for (const article of requisition.general_articles ?? []) {
    parts.push(article.description)
    parts.push(article.variant_type)
  }

  return normalize(parts.filter(Boolean).join(' '))
}

/**
 * Todos los términos deben aparecer (AND), así "thinner azul" acota en vez
 * de ampliar.
 */
export const requisitionGlobalFilter: FilterFn<Requisition> = (row, _columnId, filterValue) => {
  const terms = normalize(String(filterValue ?? '')).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true

  const haystack = getSearchableText(row.original)

  return terms.every((term) => haystack.includes(term))
}
