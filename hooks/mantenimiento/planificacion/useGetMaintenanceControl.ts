import axios from '@/lib/axios';
import { MaintenanceControl } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchMaintenanceControl = async (company: string | undefined, id: string | number): Promise<MaintenanceControl> => {
  const { data } = await axios.get(`/${company}/maintenance-controls/${id}`);
  return data;
};

export const useGetMaintenanceControl = (company: string | undefined, id: string | number | undefined) => {
  return useQuery<MaintenanceControl, Error>({
    queryKey: ["maintenance-controls", company, id],
    queryFn: () => fetchMaintenanceControl(company, id as string | number),
    enabled: !!company && !!id,
  });
};
