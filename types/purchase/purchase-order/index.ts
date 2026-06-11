import type { Unit, Vendor, Location } from '@/types';

/** Articles tracking info used during purchase completion. */
export interface POArticles {
  article_part_number: string;
  article_purchase_order_id: number;
  usa_tracking: string;
  ock_tracking: string;
  article_location: string;
}

/** Mutation payload for creating a purchase order. */
export interface CreatePurchaseOrderData {
  status: string;
  justification: string;
  purchase_date: Date;
  sub_total: number;
  total: number;
  vendor_id: number;
  created_by: string;
  quote_order_id: number;
  articles_purchase_orders: {
    batch: {
        name: string;
    };
    article_part_number: string;
    article_alt_part_number?: string;
    quantity: number;
    unit_price: string;
    image: string;
  }[];
}

export interface PurchaseOrderArticle {
  batch?: {
    name: string;
  };
  id: number;
  article_part_number: string;
  article_alt_part_number?: string;
  quantity: number;
  unit?: Unit;
  unit_price: string;
  article_tax: number;
  usa_tracking: string;
  ock_tracking: string;
  article_location: string;
}

export interface PurchaseOrderBankAccount {
  id: number;
  name: string;
  account_number: string;
  bank: {
    id: number;
    name: string;
  };
}

export interface PurchaseOrderCard {
  id: number;
  name: string;
  card_number: string;
  bank_account: PurchaseOrderBankAccount;
}

export interface PurchaseOrderQuoteRef {
  id: number;
  quote_number: string;
}

export interface PurchaseOrder {
  id: number;
  order_number: string;
  justification: string;
  article_purchase_order: PurchaseOrderArticle[];
  articles: PurchaseOrderArticle[];
  status: string;
  purchase_date: string;
  tax: number;
  wire_fee: number;
  card?: PurchaseOrderCard;
  bank_account?: PurchaseOrderBankAccount;
  handling_fee: number;
  shipping_fee: number;
  ock_shipping: number;
  usa_shipping: number;
  sub_total: number;
  total: number;
  vendor: Vendor;
  requisition_order: {
    id: number;
    order_number: string;
  };
  quote_order: PurchaseOrderQuoteRef;
  quote: PurchaseOrderQuoteRef;
  location: Location;
  created_by: string;
  company: string;
}