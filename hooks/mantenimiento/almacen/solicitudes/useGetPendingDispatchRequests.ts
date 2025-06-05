import axios from '@/lib/axios';
import { DispatchRequest } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';

const fetchPendingDispatchesRequests = async (location_id?: string): Promise<DispatchRequest[]> => {
  const {data} = await axios.get(`/hangar74/show-dispatch-in-process/${location_id}`);
  return data;
};

export const useGetPendingDispatches = (location_id?: string) => {
  return useQuery<DispatchRequest[], Error>({
    queryKey: ["dispatches-requests-in-process"],
    queryFn: () => fetchPendingDispatchesRequests(location_id),
    enabled: !!location_id
  });
};
