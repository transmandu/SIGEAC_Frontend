import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import type { PurchaseOrder } from '@/types/purchase';

const fetchPurchaseOrders = async (companyId: string | null, locationId: string | null): Promise<PurchaseOrder[]> => {
  const {data} = await axios.get(`/${companyId}/${locationId}/purchase-orders`);
  return data;
};

export const useGetPurchaseOrders = (companyId: string | null, locationId: string | null) => {
  return useQuery<PurchaseOrder[]>({
    // company/location forman parte de la key: sin ellos, cambiar de
    // estación reutilizaba la caché de la anterior.
    queryKey: ["purchase-orders", companyId, locationId],
    queryFn: () => fetchPurchaseOrders(companyId, locationId),
    enabled: !!companyId && !!locationId,
    staleTime: 1000 * 60 * 2,
  });
};