import axios from '@/lib/axios';
import { MaintenanceAircraftPart } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchAircraftParts = async (): Promise<MaintenanceAircraftPart[]> => {
  const {data} = await axios.get('/hangar74/aircrafts-parts');
  return data;
};

export const useGetAircraftsParts = () => {
  return useQuery<MaintenanceAircraftPart[], Error>({
    queryKey: ["aircraft-parts"],
    queryFn: fetchAircraftParts,
  });
};
