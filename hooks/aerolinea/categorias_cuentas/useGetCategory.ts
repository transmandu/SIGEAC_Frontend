import axios from '@/lib/axios';
import { Category } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchCategory = async (company?: string): Promise<Category[]> => {
  const {data} = await axios.get(`/${company}/accountants-categories`);
  return data;
};

export const useGetCategory = (company?: string) => {
  return useQuery<Category[]>({
    queryKey: ["category"],
    queryFn: () => fetchCategory(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
