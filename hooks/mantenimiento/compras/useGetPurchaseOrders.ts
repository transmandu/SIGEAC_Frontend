import axios from '@/lib/axios';
import { PurchaseOrder, Quote } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchPurchaseOrders = async (companyId: string | null, locationId: string | null): Promise<PurchaseOrder[]> => {
  const {data} = await axios.get(`/purchase-orders/${companyId}/${locationId}`);
  return data;
};

export const useGetPurchaseOrders = (companyId: string | null, locationId: string | null) => {
  return useQuery<PurchaseOrder[]>({
    queryKey: ["purchase-orders"],
    queryFn: () => fetchPurchaseOrders(companyId, locationId),
    enabled: !!companyId && !!locationId
  });
};
