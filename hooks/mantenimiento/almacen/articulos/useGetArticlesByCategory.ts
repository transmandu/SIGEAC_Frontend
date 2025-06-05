import axios from '@/lib/axios';
import { useMutation } from '@tanstack/react-query';

export interface IArticleByCategory {
  id:number,
  article_type: string,
  status: string,
  serial: string,
  description: string,
  zone: string,
  brand: string,
  condition: string,
  weight: number,
  cost: number,
  batches_id: number,
  vendor_id: string,
  part_number: string,
  alternative_part_number: string,
  certificates?: string[],
  image: string,
}

const fetchArticlesByCategory = async (location_id: number, category: string): Promise<IArticleByCategory[]> => {
  const {data} = await axios.post(`/hangar74/articles-by-category/${category}`, {location_id});
  return data;
};

export const useGetArticlesByCategory = (location_id: number, category: string) => {
  return useMutation<IArticleByCategory[], Error, number>({
    mutationKey: ["articles"],
    mutationFn: () => fetchArticlesByCategory(location_id, category),
  });
};
