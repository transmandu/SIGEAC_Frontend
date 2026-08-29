import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

export type AircraftDailyAverage = {
  daily_average_hours: number;
  daily_average_cycles: number;
  days_considered: number;
};

const fetchAircraftDailyAverage = async (company: string | undefined, acronym: string | undefined): Promise<AircraftDailyAverage> => {
  const { data } = await axios.get(`/${company}/aircraft-daily-average/${acronym}`);
  return data;
};

// Promedio de horas/ciclos volados por día en los últimos 30 días (incluye
// días sin vuelo), usado para proyectar la fecha de próximo cumplimiento
// cuando el control se lleva en horas/ciclos.
export const useGetAircraftDailyAverage = (company: string | undefined, acronym: string | undefined) => {
  return useQuery<AircraftDailyAverage, Error>({
    queryKey: ["aircraft-daily-average", company, acronym],
    queryFn: () => fetchAircraftDailyAverage(company, acronym),
    enabled: !!company && !!acronym,
  });
};
