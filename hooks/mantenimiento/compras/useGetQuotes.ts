import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import type { Quote } from '@/types/purchase';

const fetchQuotes = async (companyId: string | null, locationId: string | null): Promise<Quote[]> => {
  const {data} = await axios.get(`/${companyId}/${locationId}/quotes`);
  return data;
};

export const useGetQuotes = (companyId: string | null, locationId: string | null) => {
  return useQuery<Quote[]>({
    // company/location forman parte de la key: sin ellos, cambiar de
    // estación reutilizaba la caché de la anterior.
    queryKey: ["quotes", companyId, locationId],
    queryFn: () => fetchQuotes(companyId, locationId),
    enabled: !!companyId && !!locationId,
    staleTime: 1000 * 60 * 2,
  });
};