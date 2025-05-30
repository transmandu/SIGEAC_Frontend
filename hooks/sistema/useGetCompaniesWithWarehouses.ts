import axiosInstance from '@/lib/axios';
import { Company, Warehouse } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface TempCompany {
  [company: string]: {
    id: number,
    name: string,
  }
}

const fetchCompaniesWithWarehouses = async (): Promise<TempCompany> => {
  const  {data}  = await axiosInstance.get('/company-warehouse');
  return data;
};

export const useGetCompaniesWithWarehouses = () => {
  return useQuery<TempCompany>({
    queryKey: ['companieswithwarehouses'],
    queryFn: fetchCompaniesWithWarehouses,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
