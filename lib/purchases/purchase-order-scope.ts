type ScopablePurchaseOrder = {
    order_number?: string | null
    quote_order?: { quote_number?: string | null } | null
    article_purchase_order?: unknown[] | null
    general_article_purchase_order?: unknown[] | null
}

/**
 * Extrae el sufijo de correlativo (-A, -G) directamente del order_number,
 * asignado por el backend según el tipo de la requisición de origen (ver
 * QuoteOrderController/PurchaseOrderController). Devuelve null para
 * compañías no-OMAC (sin sufijo) o datos legacy.
 */
function extractOrderNumberSuffix(orderNumber: string | undefined | null): "A" | "G" | null {
    if (!orderNumber) return null

    if (orderNumber.endsWith("-A")) return "A"
    if (orderNumber.endsWith("-G")) return "G"

    return null
}

/**
 * Una orden de compra pertenece al ámbito aeronáutico si su order_number
 * termina en -A. Sin sufijo reconocible (compañías no-OMAC, o datos legacy
 * previos a la convención -A/-G) se cae en cascada a:
 *   1. el sufijo de la cotización de origen (quote_order.quote_number),
 *   2. si tiene artículos por lote (article_purchase_order) — aeronáutico —
 *      frente a solo artículos generales (general_article_purchase_order).
 * Una orden sin ningún artículo y sin sufijo reconocible se asume general,
 * para no ocultar un costo real sin certeza del ámbito.
 */
export function isAeronauticalPurchaseOrder(po: string | null | undefined | ScopablePurchaseOrder): boolean {
    if (typeof po === "string" || po == null) {
        return extractOrderNumberSuffix(po) === "A"
    }

    const ownSuffix = extractOrderNumberSuffix(po.order_number)
    if (ownSuffix === "A") return true
    if (ownSuffix === "G") return false

    const quoteSuffix = extractOrderNumberSuffix(po.quote_order?.quote_number)
    if (quoteSuffix === "A") return true
    if (quoteSuffix === "G") return false

    return (po.article_purchase_order?.length ?? 0) > 0
}

/**
 * Una orden de compra pertenece al ámbito general si su order_number termina
 * en -G, o si la cascada de respaldo de isAeronauticalPurchaseOrder no la
 * identifica como aeronáutica.
 */
export function isGeneralPurchaseOrder(po: string | null | undefined | ScopablePurchaseOrder): boolean {
    return !isAeronauticalPurchaseOrder(po)
}
