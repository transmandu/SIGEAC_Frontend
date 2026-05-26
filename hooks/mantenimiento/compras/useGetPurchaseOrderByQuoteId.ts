'use client';

import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';

interface PurchaseOrderByQuoteResponse {
  order_number: string;
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
  return useQuery<PurchaseOrderByQuoteResponse | null, Error>({
    queryKey: ['purchaseOrderByQuote', company, quoteId],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${company}/purchase-orders/by-quote`,
        { params: { quote_id: quoteId } }
      );

      return data;
    },
    enabled: enabled && !!company && !!quoteId,
    retry: false, // 👈 CRÍTICO (evita tus 3 requests)
  });
};