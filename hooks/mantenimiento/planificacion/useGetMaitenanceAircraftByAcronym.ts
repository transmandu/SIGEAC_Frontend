import axios from '@/lib/axios';
import { MaintenanceAircraft } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchAircraftByAcronym = async (company?: string, acronym?: string): Promise<MaintenanceAircraft> => {
  const { data } = await axios.get(`/${company}/aircrafts/${acronym}`);
  return data;
};

export const useGetMaintenanceAircraftByAcronym = (company?: string, acronym?: string) => {
  return useQuery<MaintenanceAircraft, Error>({
    queryKey: ["aircraft", company, acronym],
    queryFn: () => fetchAircraftByAcronym(company, acronym),
    enabled: !!company && !!acronym,
  });
};
