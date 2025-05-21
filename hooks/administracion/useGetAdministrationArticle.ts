import axiosInstance from '@/lib/axios';
import { AdministrationArticle } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchAdministrationArticle = async (): Promise<AdministrationArticle[]> => {
  const  {data}  = await axiosInstance.get('/transmandu/articles');
  return data;
};

export const useGetAdministrationArticle = () => {
  return useQuery<AdministrationArticle[]>({
    queryKey: ['article'],
    queryFn: fetchAdministrationArticle,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
