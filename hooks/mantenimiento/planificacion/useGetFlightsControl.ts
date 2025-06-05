import axios from '@/lib/axios';
import { FlightControl, MaintenanceAircraftPart } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchFlightControl = async (company: string | undefined): Promise<FlightControl[]> => {
  const {data} = await axios.get(`/${company}/flight-control`);
  return data;
};

export const useGetFlightControl = (company: string | undefined) => {
  return useQuery<FlightControl[], Error>({
    queryKey: ["flight-control"],
    queryFn: () => fetchFlightControl(company),
    enabled: !!company
  });
};
