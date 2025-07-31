import axios from '@/lib/axios';
import { PurchaseOrder, Quote } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchPurchaseOrder = async (company: string | undefined, order_number: string | undefined): Promise<PurchaseOrder> => {
  const {data} = await axios.get(`/${company}/show-purchase-order/${order_number}`);
  return data[0];
};

export const useGetPurchaseOrder = (company: string | undefined, order_number: string | undefined) => {
  return useQuery<PurchaseOrder>({
    queryKey: ["purchase-order", company, order_number],
    queryFn: () => fetchPurchaseOrder(company, order_number),
    enabled: !!company && !!order_number
  });
};
