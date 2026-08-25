import axios from '@/lib/axios';
import { MaintenanceCompliance } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchMaintenanceCompliances = async (
  company: string | undefined,
  acronym: string | undefined,
): Promise<MaintenanceCompliance[]> => {
  const { data } = await axios.get(`/${company}/maintenance-compliances`, {
    params: acronym ? { acronym } : undefined,
  });
  return data;
};

export const useGetMaintenanceCompliances = (company: string | undefined, acronym?: string) => {
  return useQuery<MaintenanceCompliance[], Error>({
    queryKey: ["maintenance-compliances", company, acronym],
    queryFn: () => fetchMaintenanceCompliances(company, acronym),
    enabled: !!company,
  });
};
