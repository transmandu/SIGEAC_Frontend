import axiosInstance from '@/lib/axios';
import { MaintenanceClient } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchClients = async (company: string | null): Promise<MaintenanceClient[]> => {
  const  {data}  = await axiosInstance.get(`/${company}/clients`);
  return data;
};

export const useGetClients = (company: string | null) => {
  return useQuery<MaintenanceClient[]>({
    queryKey: ['clients'],
    queryFn: () => fetchClients(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company
  });
};
