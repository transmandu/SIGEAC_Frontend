import axios from '@/lib/axios';
import { Quote } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchQuotes = async (companyId: string | null, locationId: string | null): Promise<Quote[]> => {
  const {data} = await axios.get(`/quotes/${companyId}/${locationId}`);
  return data;
};

export const useGetQuotes = (companyId: string | null, locationId: string | null) => {
  return useQuery<Quote[]>({
    queryKey: ["quotes"],
    queryFn: () => fetchQuotes(companyId, locationId),
    enabled: !!companyId && !!locationId
  });
};
