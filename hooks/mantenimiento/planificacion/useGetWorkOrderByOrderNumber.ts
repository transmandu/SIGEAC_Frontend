import axiosInstance from '@/lib/axios';
import { WorkOrder } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchWOByOrderNumber = async (order_number: string, company?: string): Promise<WorkOrder> => {
  const {data} = await axiosInstance.get(`/${company}/work-orders/${order_number}`);
  return data[0];
};

export const useGetWorkOrderByOrderNumber = (order_number: string, company?: string) => {
  return useQuery<WorkOrder, Error>({
    queryKey: ["work-order", order_number, company],
    queryFn: () => fetchWOByOrderNumber(order_number, company),
    enabled: !!company,
  });
};
