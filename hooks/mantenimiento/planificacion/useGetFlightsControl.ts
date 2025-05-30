import axios from '@/lib/axios';
import { FlightControl, MaintenanceAircraftPart } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchFlightControl = async (): Promise<FlightControl[]> => {
  const {data} = await axios.get('/hangar74/flights');
  return data;
};

export const useGetFlightControl = () => {
  return useQuery<FlightControl[], Error>({
    queryKey: ["flight-control"],
    queryFn: fetchFlightControl,
  });
};
