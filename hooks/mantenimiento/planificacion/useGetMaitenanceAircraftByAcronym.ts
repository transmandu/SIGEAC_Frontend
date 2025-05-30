import axiosInstance from '@/lib/axios';
import { MaintenanceAircraft } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchAircraftByAcronym = async (acronym: string): Promise<MaintenanceAircraft> => {
  const {data} = await axiosInstance.get(`/hangar74/aircrafts/${acronym}`);
  return data;
};

export const useGetMaintenanceAircraftByAcronym = (acronym: string) => {
  return useQuery<MaintenanceAircraft, Error>({
    queryKey: ["aircraft-parts"],
    queryFn: () => fetchAircraftByAcronym(acronym),
  });
};
