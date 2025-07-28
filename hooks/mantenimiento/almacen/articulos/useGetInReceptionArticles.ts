import axios from '@/lib/axios';
import { Article } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchInReceptionArticles = async (
  location_id: string | null,
  company?: string
): Promise<Article[]> => {
  const { data } = await axios.get(`/${company}/articles-in-reception/${location_id}`);
  return data;
};

export const useGetInReceptionArticles = (
  location_id: string | null,
  company?: string
) => {
  return useQuery<Article[], Error>({
    queryKey: ["in-reception-articles", company, location_id],
    queryFn: () => fetchInReceptionArticles(location_id, company!),
    enabled: !!location_id && !!company
  });
};
