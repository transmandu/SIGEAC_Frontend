import axios from '@/lib/axios';
import { Category } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchCategory = async (): Promise<Category[]> => {
  const {data} = await axios.get(`/transmandu/accountants-categories`);
  return data;
};

export const useGetCategory = () => {
  return useQuery<Category[]>({
    queryKey: ["category"],
    queryFn: fetchCategory,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
