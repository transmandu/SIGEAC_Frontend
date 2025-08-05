import axios from '@/lib/axios';
import { MaintenanceAircraft } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchAircrafts = async (company?: string): Promise<MaintenanceAircraft[]> => {
  const {data} = await axios.get(`/${company}/aircrafts`);
  return data;
};

export const useGetMaintenanceAircrafts = (company?: string) => {
  return useQuery<MaintenanceAircraft[], Error>({
    queryKey: ["aircrafts", company],
    queryFn: () => fetchAircrafts(company),
    enabled: !!company,
  });
};
