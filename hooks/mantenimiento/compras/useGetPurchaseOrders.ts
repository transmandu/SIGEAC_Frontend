import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import type { PurchaseOrder } from '@/types/purchase';

const fetchPurchaseOrders = async (companyId: string | null, locationId: string | null): Promise<PurchaseOrder[]> => {
  const {data} = await axios.get(`/${companyId}/${locationId}/purchase-orders`);
  return data;
};

export const useGetPurchaseOrders = (companyId: string | null, locationId: string | null) => {
  return useQuery<PurchaseOrder[]>({
    queryKey: ["purchase-orders"],
    queryFn: () => fetchPurchaseOrders(companyId, locationId),
    enabled: !!companyId && !!locationId
  });
};