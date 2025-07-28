import axios from '@/lib/axios';
import { MaintenanceService } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchServices = async (company?: string): Promise<MaintenanceService[]> => {
  const {data} = await axios.get(`/${company}/service-task`);
  return data;
};

export const useGetMaintenanceServices = (company?: string) => {
  return useQuery<MaintenanceService[], Error>({
    queryKey: ["maintenance-services", company],
    queryFn: () => fetchServices(company),
  });
};
