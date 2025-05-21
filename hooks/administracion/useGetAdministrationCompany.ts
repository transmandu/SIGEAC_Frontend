import axiosInstance from '@/lib/axios';
import { AdministrationCompany } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchAdministrationCompany = async (): Promise<AdministrationCompany[]> => {
  const  {data}  = await axiosInstance.get('/transmandu/administration-company');
  return data;
};

export const useGetAdministrationCompany = () => {
  return useQuery<AdministrationCompany[]>({
    queryKey: ['admin-company'],
    queryFn: fetchAdministrationCompany,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
