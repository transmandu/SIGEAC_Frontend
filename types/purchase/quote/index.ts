export interface QuoteableRequisition {
  id: number;
  order_number: string;
  requested_by: string;
  justification: string;
  batch: {
    batch_articles: {
      article_part_number: string;
      article_alt_part_number?: string;
      quantity: number;
      unit?: {
        id: number;
      } | null;
    }[];
    name: string;
    category?: string;
  }[];
}