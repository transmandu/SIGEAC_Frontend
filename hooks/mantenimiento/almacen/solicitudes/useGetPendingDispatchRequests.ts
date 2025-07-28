import axios from '@/lib/axios';
import { DispatchRequest } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchPendingDispatchesRequests = async ({
  company,
  location_id,
}: {
  company: string;
  location_id?: string;
}): Promise<DispatchRequest[]> => {
  const { data } = await axios.get(`/${company}/show-dispatch-in-process/${location_id}`);
  return data;
};

export const useGetPendingDispatches = ({
  company,
  location_id,
}: {
  company?: string;
  location_id?: string;
}) => {
  return useQuery<DispatchRequest[], Error>({
    queryKey: ['dispatches-requests-in-process', company, location_id],
    queryFn: () => fetchPendingDispatchesRequests({ company: company!, location_id: location_id!}),
    enabled: !!location_id && !!company,
  });
};
