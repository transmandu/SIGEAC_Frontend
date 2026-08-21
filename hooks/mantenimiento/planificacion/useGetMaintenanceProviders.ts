import axios from '@/lib/axios';
import { MaintenanceProvider } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchMaintenanceProviders = async (company: string | undefined): Promise<MaintenanceProvider[]> => {
  const { data } = await axios.get(`/${company}/maintenance-providers`);
  return data;
};

export const useGetMaintenanceProviders = (company: string | undefined) => {
  return useQuery<MaintenanceProvider[], Error>({
    queryKey: ["maintenance-providers", company],
    queryFn: () => fetchMaintenanceProviders(company),
    enabled: !!company,
  });
};
