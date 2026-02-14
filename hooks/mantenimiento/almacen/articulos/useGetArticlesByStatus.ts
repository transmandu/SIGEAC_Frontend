import { IncomingArticle } from '@/app/[company]/control_calidad/incoming/IncomingTypes';
import axiosInstance from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useQuery } from '@tanstack/react-query';

const fetchArticles = async (status: string, company?: string, ): Promise<IncomingArticle[]> => {
  const  {data}  = await axiosInstance.get(`/${company}/articles-by-status`, { params: { status } });
  return data;
};

export const useGetArticlesByStatus = (status: string) => {
  const {selectedCompany} = useCompanyStore();
  return useQuery<IncomingArticle[]>({
    queryKey: ['articles', selectedCompany?.slug, status],
    queryFn: () => fetchArticles(status, selectedCompany?.slug),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!selectedCompany?.slug, // Solo ejecutar si el slug de la empresa está disponible
  });
};
