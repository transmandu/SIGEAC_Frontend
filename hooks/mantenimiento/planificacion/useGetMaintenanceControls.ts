import axios from '@/lib/axios';
import { MaintenanceControl } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchMaintenanceControls = async (company: string | undefined): Promise<MaintenanceControl[]> => {
  const { data } = await axios.get(`/${company}/maintenance-controls`);
  return data;
};

export const useGetMaintenanceControls = (company: string | undefined) => {
  return useQuery<MaintenanceControl[], Error>({
    queryKey: ["maintenance-controls", company],
    queryFn: () => fetchMaintenanceControls(company),
    enabled: !!company,
  });
};
