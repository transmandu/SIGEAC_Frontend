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

const fetchArticlesByCategory = async (
  location_id: number,
  category: string,
  company?: string
): Promise<IArticleByCategory[]> => {
  const { data } = await axios.post(`/${company}/articles-by-category/${category}`, { location_id });
  return data;
};

export const useGetArticlesByCategory = (
  location_id: number,
  category: string,
  company?: string
) => {
  return useMutation<IArticleByCategory[], Error>({
    mutationKey: ["articles-by-category", company, location_id, category],
    mutationFn: () => fetchArticlesByCategory(location_id, category, company!),
  });
};
