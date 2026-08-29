import axios from '@/lib/axios';
import { WorkOrder } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchWorkOrdersByAircraft = async (
  company: string | undefined,
  aircraftId: string | number | undefined,
): Promise<WorkOrder[]> => {
  const { data } = await axios.get(`/${company}/work-orders`, {
    params: { aircraft_id: aircraftId },
  });
  return data;
};

export const useGetWorkOrdersByAircraft = (
  company: string | undefined,
  aircraftId: string | number | undefined,
) => {
  return useQuery<WorkOrder[], Error>({
    queryKey: ["work-orders", "by-aircraft", company, aircraftId],
    queryFn: () => fetchWorkOrdersByAircraft(company, aircraftId),
    enabled: !!company && !!aircraftId,
  });
};
