import axiosInstance from '@/lib/axios';
import { MaintenanceAircraft } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchAircraftByAcronym = async (acronym: string, company?: string): Promise<MaintenanceAircraft> => {
  const {data} = await axiosInstance.get(`/${company}/aircrafts/${acronym}`);
  return data;
};

export const useGetMaintenanceAircraftByAcronym = (acronym: string, company?: string) => {
  return useQuery<MaintenanceAircraft, Error>({
    queryKey: ["aircraft-parts", acronym, company],
    queryFn: () => fetchAircraftByAcronym(acronym, company),
  });
};
