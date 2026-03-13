'use client';

import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';

interface PurchaseOrderByQuoteResponse {
  order_number: string; // order_number de la orden de compra
}

export const useGetPurchaseOrderByQuoteId = ({
  company,
  quoteId,
}: {
  company?: string | null;
  quoteId?: number;
}) => {
  return useQuery<PurchaseOrderByQuoteResponse | null, Error>({
    queryKey: ['purchaseOrderByQuote', company, quoteId],
    queryFn: async () => {
      if (!company || !quoteId) return null;

      const { data } = await axios.get<PurchaseOrderByQuoteResponse>(
        `/${company}/purchase-orders/by-quote`,
        { params: { quote_id: quoteId } }
      );

      return data;
    },
    enabled: !!company && !!quoteId,
  });
};