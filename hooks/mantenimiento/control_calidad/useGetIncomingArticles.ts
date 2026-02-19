import { IncomingArticle } from '@/app/[company]/control_calidad/incoming/IncomingTypes';
import axiosInstance from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useQuery } from '@tanstack/react-query';

const fetchIncomingArticles = async (company?: string): Promise<IncomingArticle[]> => {
  const  {data}  = await axiosInstance.get(`/${company}/incoming-articles`);
  return data;
};

export const useGetIncomingArticles = () => {
  const {selectedCompany} = useCompanyStore();
  return useQuery<IncomingArticle[]>({
    queryKey: ['incoming-articles', selectedCompany?.slug],
    queryFn: () => fetchIncomingArticles(selectedCompany?.slug),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!selectedCompany?.slug, // Solo ejecutar si el slug de la empresa está disponible
  });
};
