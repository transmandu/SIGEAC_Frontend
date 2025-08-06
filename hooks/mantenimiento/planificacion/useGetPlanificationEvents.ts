import axios from '@/lib/axios';
import { PlanificationEvent } from '@/types';
import { useQuery } from '@tanstack/react-query';

// Función para formatear fechas (si es necesario)
const formatToScheduleXDate = (dateString: string): string => {
  // Ejemplo: Si tu API devuelve 'DD/MM/YYYY HH:mm' → 'YYYY-MM-DD HH:mm'
  const [datePart, timePart] = dateString.split(' ');
  const [day, month, year] = datePart.split('/');
  return `${year}-${month}-${day} ${timePart}`;
};

const fetchPlanificationEvents = async (company: string | undefined): Promise<PlanificationEvent[]> => {
  const { data } = await axios.get(`/${company}/planification-events`);
  return data.map((event: PlanificationEvent) => ({
    ...event,
    start: formatToScheduleXDate(event.start), // Aplica formato si es necesario
    end: formatToScheduleXDate(event.end),
  }));
};

export const useGetPlanificationEvents = (company: string | undefined) => {
  return useQuery<PlanificationEvent[], Error>({
    queryKey: ["planification-events", company],
    queryFn: () => fetchPlanificationEvents(company),
    enabled: !!company,
  });
};
