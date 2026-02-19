import { IncomingArticle } from '@/app/[company]/control_calidad/incoming/IncomingTypes';
import axiosInstance from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useQuery } from '@tanstack/react-query';

const fetchToLocateArticles = async (company?: string): Promise<IncomingArticle[]> => {
  const  {data}  = await axiosInstance.get(`/${company}/waiting-to-locate-articles`);
  return data;
};

export const useGetWaitingToLocateArticles = () => {
  const {selectedCompany} = useCompanyStore();
  return useQuery<IncomingArticle[]>({
    queryKey: ['waiting-to-locate-articles', selectedCompany?.slug],
    queryFn: () => fetchToLocateArticles(selectedCompany?.slug),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!selectedCompany?.slug, // Solo ejecutar si el slug de la empresa está disponible
  });
};
