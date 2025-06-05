import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

interface IArticlesInTransit {
  id?: number,
  part_number: string,
  serial?: string,
  name: string,
  description?: string,
  name_manufacturer?: string,
  condition?: string,
  image?: File | string,
}


const fetchInTransitArticles = async (location_id: string | null): Promise<IArticlesInTransit[]> => {
  const {data} = await axios.get(`/hangar74/articles-in-transit/${location_id}`);
  return data;
};

export const useGetInTransitArticles = (location_id: string | null) => {
  return useQuery<IArticlesInTransit[], Error>({
    queryKey: ["in-transit-articles"],
    queryFn: () => fetchInTransitArticles(location_id),
    enabled: !!location_id
  });
};
