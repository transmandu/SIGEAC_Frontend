import axios from '@/lib/axios';
import { MaintenanceAircraftPart } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchAircraftParts = async (company?: string): Promise<MaintenanceAircraftPart[]> => {
  const {data} = await axios.get(`/${company}/aircrafts-parts`);
  return data;
};

export const useGetAircraftsParts = (company?: string) => {
  return useQuery<MaintenanceAircraftPart[], Error>({
    queryKey: ["aircraft-parts", company],
    queryFn: () => fetchAircraftParts(company),
  });
};
