import axios from '@/lib/axios';
import { WorkOrder } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';

const fetchWorkOrders = async (location_id: string | null): Promise<WorkOrder[]> => {
  const {data} = await axios.get(`/hangar74/all-work-orders/${location_id}`);
  return data;
};

export const useGetWorkOrders = (location_id: string | null) => {
  return useQuery<WorkOrder[], Error>({
    queryKey: ["work-orders"],
    queryFn: () => fetchWorkOrders(location_id),
    enabled: !!location_id,
  });
};
