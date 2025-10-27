import axiosInstance from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
import { Condition } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchConditions = async (company?: string): Promise<Condition[]> => {
  const  {data}  = await axiosInstance.get(`/${company}/condition-article`);
  return data;
};

export const useGetConditions = () => {
  const { selectedCompany } = useCompanyStore();
  return useQuery<Condition[]>({
    queryKey: ["conditions"],
    queryFn: () => fetchConditions(selectedCompany?.slug),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!selectedCompany,
  });
};
