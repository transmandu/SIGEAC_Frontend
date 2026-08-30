import axios from '@/lib/axios';
import { CalendarEventDto } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchCalendarEvents = async (
  company: string | undefined,
  start: string,
  end: string,
): Promise<CalendarEventDto[]> => {
  const { data } = await axios.get(`/${company}/calendar-events`, { params: { start, end } });
  return data;
};

export const useGetCalendarEvents = (company: string | undefined, start: string | undefined, end: string | undefined) => {
  return useQuery<CalendarEventDto[], Error>({
    queryKey: ["calendar-events", company, start, end],
    queryFn: () => fetchCalendarEvents(company, start as string, end as string),
    enabled: !!company && !!start && !!end,
    // Sin esto, cada ida y vuelta entre dos meses ya visitados vuelve a
    // pedirlos al backend — los eventos no cambian segundo a segundo.
    staleTime: 60_000,
  });
};
