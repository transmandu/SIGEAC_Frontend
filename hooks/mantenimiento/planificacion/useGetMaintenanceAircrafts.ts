import axios from '@/lib/axios';
import { AeronauticalAircraft } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchAircrafts = async (company?: string): Promise<AeronauticalAircraft[]> => {
  const {data} = await axios.get(`/${company}/aeronautical/aircrafts`);
  return data;
};

export const useGetMaintenanceAircrafts = (company?: string) => {
  return useQuery<AeronauticalAircraft[], Error>({
    queryKey: ["aircrafts", company],
    queryFn: () => fetchAircrafts(company),
    enabled: !!company,
  });
};
