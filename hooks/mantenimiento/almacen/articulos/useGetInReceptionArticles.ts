import axios from '@/lib/axios';
import { Article } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';

const fetchInReceptionArticles = async (location_id: string | null): Promise<Article[]> => {
  const {data} = await axios.get(`/hangar74/articles-in-reception/${location_id}`);
  return data;
};

export const useGetInReceptionArticles = (location_id: string | null) => {
  return useQuery<Article[], Error>({
    queryKey: ["in-reception-articles"],
    queryFn: () => fetchInReceptionArticles(location_id),
    enabled: !!location_id
  });
};
