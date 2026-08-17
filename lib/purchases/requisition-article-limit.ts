import { toast } from "sonner";

// Business rule: a single requisition may not request more than this many
// distinct articles (line items), regardless of requisition type. This caps
// the number of items, not the quantity within an item.
export const MAX_REQUISITION_ARTICLES = 15;

// Call before appending a new article to a requisition's article list. Shows
// a toast and returns false when `currentCount` has already reached the cap,
// so the caller can bail out without mutating state.
export function canAddRequisitionArticle(currentCount: number): boolean {
  if (currentCount >= MAX_REQUISITION_ARTICLES) {
    toast.warning("Límite de artículos alcanzado", {
      description: `Cada requisición admite un máximo de ${MAX_REQUISITION_ARTICLES} artículos. Si necesita solicitar más, genere una nueva requisición.`,
    });
    return false;
  }
  return true;
}
