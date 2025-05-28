import axios from '@/lib/axios';
import { PurchaseOrder, Quote } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchPurchaseOrder = async (company: string | null, order_number: string | null): Promise<PurchaseOrder> => {
  const {data} = await axios.get(`/show-purchase-order/${company}/${order_number}`);
  return data[0];
};

export const useGetPurchaseOrder = (company: string | null, order_number: string | null) => {
  return useQuery<PurchaseOrder>({
    queryKey: ["purchase-order", company, order_number],
    queryFn: () => fetchPurchaseOrder(company, order_number),
    enabled: !!company && !!order_number
  });
};
