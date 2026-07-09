'use client';

import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';

export interface PurchaseOrderByQuote {
  id: number;
  order_number: string;
  vendor_name: string | null;
  /** Present on general POs — the comercio / lugar de compra this order groups. */
  retailer_name: string | null;
}

export const useGetPurchaseOrderByQuoteId = ({
  company,
  quoteId,
  enabled = true,
}: {
  company?: string | null;
  quoteId?: number;
  enabled?: boolean;
}) => {
  return useQuery<PurchaseOrderByQuote[], Error>({
    queryKey: ['purchaseOrderByQuote', company, quoteId],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${company}/purchase-orders/by-quote`,
        { params: { quote_id: quoteId } }
      );

      return data.purchase_orders ?? [];
    },
    enabled: enabled && !!company && !!quoteId,
    retry: false, // 👈 CRÍTICO (evita tus 3 requests)
  });
};