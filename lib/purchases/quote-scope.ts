import type { Quote } from "@/types/purchase"

type ScopableQuote = Pick<Quote, "quote_number" | "general_article_quote_order" | "article_quote_order"> & {
    requisition_order: Pick<Quote["requisition_order"], "type">
}

/** Sufijos de correlativo válidos, en orden de prioridad (los de 2 letras antes que "S"). */
const ORDER_NUMBER_SUFFIXES = ["SL", "SG", "A", "G", "S"] as const

type OrderNumberSuffix = typeof ORDER_NUMBER_SUFFIXES[number]

/**
 * Extrae el sufijo de correlativo (-A, -G, -S, -SL, -SG) directamente del
 * quote_number, asignado por el backend según el tipo de la requisición de
 * origen. Devuelve null para compañías no-OMAC (sin sufijo) o datos legacy.
 */
function extractOrderNumberSuffix(orderNumber: string | undefined | null): OrderNumberSuffix | null {
    if (!orderNumber) return null

    return ORDER_NUMBER_SUFFIXES.find((suffix) => orderNumber.endsWith(`-${suffix}`)) ?? null
}

/**
 * Una cotización pertenece al ámbito aeronáutico si su sufijo es -A, o -SL
 * (mitad de lote de un STOCK dividido). El sufijo -S (stock no dividido) es
 * ambiguo por sí solo —puede ser de lote o de general— así que se desambigua
 * revisando si contiene artículos generales. Sin sufijo (no-OMAC) o legacy
 * sin sufijo reconocible, se cae al mismo criterio basado en artículos.
 */
export function isAeronauticalQuoteScope(quote: ScopableQuote): boolean {
    const suffix = extractOrderNumberSuffix(quote.quote_number)

    if (suffix === "A" || suffix === "SL") return true
    if (suffix === "G" || suffix === "SG") return false

    // suffix is "S" (no dividido) or unrecognized/non-OMAC: desambiguar por artículos.
    const type = quote.requisition_order?.type

    return (
        type !== "GENERAL" &&
        !(type === "STOCK" && (quote.general_article_quote_order?.length ?? 0) > 0)
    )
}

/**
 * Una cotización pertenece al ámbito general si su sufijo es -G, o -SG
 * (mitad general de un STOCK dividido). El sufijo -S (stock no dividido) es
 * ambiguo por sí solo, así que se desambigua revisando si contiene artículos
 * por lote. Sin sufijo (no-OMAC) o legacy sin sufijo reconocible, se cae al
 * mismo criterio basado en artículos.
 */
export function isGeneralQuoteScope(quote: ScopableQuote): boolean {
    const suffix = extractOrderNumberSuffix(quote.quote_number)

    if (suffix === "G" || suffix === "SG") return true
    if (suffix === "A" || suffix === "SL") return false

    // suffix is "S" (no dividido) or unrecognized/non-OMAC: desambiguar por artículos.
    const type = quote.requisition_order?.type

    return (
        type !== "AERONAUTICAL" &&
        !(type === "STOCK" && (quote.article_quote_order?.length ?? 0) > 0)
    )
}
