import axios from '@/lib/axios';
import { MaintenanceService } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchServices = async (): Promise<MaintenanceService[]> => {
  const {data} = await axios.get('/hangar74/service-task');
  return data;
};

export const useGetMaintenanceServices = () => {
  return useQuery<MaintenanceService[], Error>({
    queryKey: ["maintenance-services"],
    queryFn: fetchServices,
  });
};
