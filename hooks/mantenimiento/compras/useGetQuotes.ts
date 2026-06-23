import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import type { Quote } from '@/types/purchase';

const fetchQuotes = async (companyId: string | null, locationId: string | null): Promise<Quote[]> => {
  const {data} = await axios.get(`/${companyId}/${locationId}/quotes`);
  return data;
};

export const useGetQuotes = (companyId: string | null, locationId: string | null) => {
  return useQuery<Quote[]>({
    queryKey: ["quotes"],
    queryFn: () => fetchQuotes(companyId, locationId),
    enabled: !!companyId && !!locationId
  });
};