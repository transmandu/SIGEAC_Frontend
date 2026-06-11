import type { Unit, Vendor } from '@/types';

/** Mutation payload for creating a quote order. */
export interface CreateQuoteData {
    justification: string,
    articles: {
      part_number: string,
      alt_part_number?: string,
      quantity: number,
      unit: string,
      unit_price: string,
    }[],
    sub_total: number,
    total: number,
    vendor_id: number,
    requisition_order_id: number,
    location_id: number,
    quote_date: Date,
    created_by: string,
    company: string,
}

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

export interface Quote {
  id: number;
  quote_number: string;
  justification: string;
  article_quote_order: {
    batch: {
      name: string;
    };
    article_part_number: string;
    article_alt_part_number?: string;
    quantity: number;
    unit_price: string;
    unit?: Unit;
    image: string;
  }[];
  sub_total: number;
  total: number;
  vendor: Vendor;
  requisition_order: {
    id: number;
    order_number: string;
  };
  quote_date: string;
  created_by: string;
  status: string;
  observation?: string;
}