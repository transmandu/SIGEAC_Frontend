import type { Quote } from "@/types/purchase"

type ScopableQuote = Pick<Quote, "quote_number"> & {
    requisition_order: Pick<Quote["requisition_order"], "type">
}

/**
 * Extrae el sufijo de correlativo (-A, -G) directamente del quote_number,
 * asignado por el backend según el tipo de la requisición de origen.
 * Devuelve null para compañías no-OMAC (sin sufijo) o datos legacy.
 */
function extractOrderNumberSuffix(orderNumber: string | undefined | null): "A" | "G" | null {
    if (!orderNumber) return null

    if (orderNumber.endsWith("-A")) return "A"
    if (orderNumber.endsWith("-G")) return "G"

    return null
}

/**
 * Una cotización pertenece al ámbito aeronáutico si su sufijo es -A. Sin
 * sufijo (no-OMAC) o legacy sin sufijo reconocible, se cae al tipo de la
 * requisición de origen.
 */
export function isAeronauticalQuoteScope(quote: ScopableQuote): boolean {
    const suffix = extractOrderNumberSuffix(quote.quote_number)

    if (suffix === "A") return true
    if (suffix === "G") return false

    return quote.requisition_order?.type !== "GENERAL"
}

/**
 * Una cotización pertenece al ámbito general si su sufijo es -G. Sin sufijo
 * (no-OMAC) o legacy sin sufijo reconocible, se cae al tipo de la requisición
 * de origen.
 */
export function isGeneralQuoteScope(quote: ScopableQuote): boolean {
    const suffix = extractOrderNumberSuffix(quote.quote_number)

    if (suffix === "G") return true
    if (suffix === "A") return false

    return quote.requisition_order?.type !== "AERONAUTICAL"
}
