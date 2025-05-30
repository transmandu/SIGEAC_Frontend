import axios from '@/lib/axios';
import { MaintenanceAircraft } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchAircrafts = async (): Promise<MaintenanceAircraft[]> => {
  const {data} = await axios.get('/hangar74/aircrafts');
  return data;
};

export const useGetMaintenanceAircrafts = () => {
  return useQuery<MaintenanceAircraft[], Error>({
    queryKey: ["aircrafts"],
    queryFn: fetchAircrafts,
  });
};
