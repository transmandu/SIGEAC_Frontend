import axios from '@/lib/axios';
import { WorkOrder } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';

const fetchWorkOrders = async (location_id: string | null, company?: string): Promise<WorkOrder[]> => {
  const {data} = await axios.get(`/${company}/${location_id}/all-work-orders`);
  return data;
};

export const useGetWorkOrders = (location_id: string | null, company?: string) => {
  return useQuery<WorkOrder[], Error>({
    queryKey: ["work-orders", location_id, company],
    queryFn: () => fetchWorkOrders(location_id, company),
    enabled: !!location_id && !!company,
  });
};
