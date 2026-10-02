import type { Quote, QuoteableRequisition } from "@/types/purchase";

/** Días sin cambios tras los que el backend avisa y, al doble, descarta. */
export const DRAFT_STALE_AFTER_DAYS = 10;
export const DRAFT_DISCARD_AFTER_DAYS = 20;

/**
 * Un borrador es general cuando **solo** tiene líneas de artículos generales.
 *
 * Se decide por las líneas y no por el `type` de la requisición porque es el
 * dato que el borrador trae consigo, y es lo que determina qué formulario sabe
 * editarlo. Un borrador recién abierto sobre una requisición sin artículos no
 * puede existir: la apertura lo rechaza.
 *
 * El orden de los chequeos importa: una requisición mixta (el backend las
 * admite, aunque hoy no haya ninguna) debe caer en el formulario aeronáutico,
 * que es el único que pinta las dos familias de artículo. El general solo pinta
 * las generales, así que clasificar una mixta como general escondería sus
 * líneas aeronáuticas y el siguiente guardado las dejaría sin tocar.
 */
export function isGeneralDraft(draft: Quote): boolean {
  if ((draft.article_quote_order ?? []).length > 0) return false;
  return (draft.general_article_quote_order ?? []).length > 0;
}

/**
 * Avance del borrador, sea aeronáutico o general: cuántas líneas tienen precio,
 * cuántas quedaron declaradas como no cotizadas y cuántas siguen sin respuesta.
 */
export function quoteDraftProgress(draft: Quote) {
  const lines = [
    ...(draft.article_quote_order ?? []),
    ...(draft.general_article_quote_order ?? []),
  ];

  const priced = lines.filter(
    (line) => !line.is_not_quoted && Number(line.unit_price) > 0,
  ).length;
  const excluded = lines.filter((line) => line.is_not_quoted).length;

  return {
    total: lines.length,
    priced,
    excluded,
    pending: Math.max(0, lines.length - priced - excluded),
  };
}

/** Días que lleva un borrador sin tocarse. */
export function quoteDraftDaysIdle(draft: Quote): number {
  const reference = draft.updated_at ?? draft.created_at ?? draft.quote_date;
  if (!reference) return 0;
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(reference).getTime()) / 86_400_000),
  );
}

/**
 * Reconstruye la requisición cotizable a partir del borrador.
 *
 * El borrador no devuelve la requisición con sus lotes, pero cada línea sí trae
 * su artículo de requisición con el lote, que es lo que el formulario necesita
 * para pintar las secciones agrupadas.
 */
export function requisitionFromDraft(draft: Quote): QuoteableRequisition {
  const byBatch = new Map<
    string,
    { name: string; category?: string | null; batch_articles: any[] }
  >();

  for (const line of draft.article_quote_order ?? []) {
    const article = line.article_requisition_order;
    if (!article) continue;

    const batch = (article as any).batch ?? null;
    const key = String(batch?.id ?? "sin-lote");

    if (!byBatch.has(key)) {
      byBatch.set(key, {
        name: batch?.name ?? "Sin lote",
        category: batch?.category ?? null,
        batch_articles: [],
      });
    }

    byBatch.get(key)!.batch_articles.push({
      id: article.id,
      article_part_number: article.article_part_number,
      article_alt_part_number: article.article_alt_part_number ?? undefined,
      quantity: article.quantity,
      unit: article.unit ? { id: article.unit.id } : null,
    });
  }

  const generalArticles = (draft.general_article_quote_order ?? [])
    .map((line) => {
      const article = line.general_article_requisition_order;
      if (!article) return null;

      return {
        id: article.id,
        description: article.description,
        variant_type: article.variant_type ?? null,
        quantity: article.quantity,
        unit: article.unit ? { id: article.unit.id } : null,
      };
    })
    .filter((article): article is NonNullable<typeof article> => article !== null);

  return {
    id: draft.requisition_order.id,
    order_number: draft.requisition_order.order_number,
    requested_by: draft.requisition_order.requested_by,
    justification: draft.requisition_order.justification ?? "",
    batch: [...byBatch.values()],
    general_articles: generalArticles,
  } as QuoteableRequisition;
}
