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

/**
 * `start` y `end` son días de calendario ("yyyy-MM-dd"), no instantes: el
 * backend recorta por día y la grilla del mes siempre pide el mismo rango.
 * Con timestamps ISO al milisegundo, dos visitas al MISMO mes podían diferir
 * en unos milisegundos y crear dos entradas de caché distintas para la misma
 * respuesta — refetch garantizado en cada ida y vuelta, y la caché creciendo
 * con duplicados que nunca se reusan.
 */
export const useGetCalendarEvents = (company: string | undefined, start: string | undefined, end: string | undefined) => {
  return useQuery<CalendarEventDto[], Error>({
    queryKey: ["calendar-events", company, start, end],
    queryFn: () => fetchCalendarEvents(company, start as string, end as string),
    enabled: !!company && !!start && !!end,
    // Los eventos no cambian segundo a segundo; sin esto, cada ida y vuelta
    // entre dos meses ya visitados vuelve a pedirlos. Una escritura propia no
    // espera este plazo: las mutations invalidan ["calendar-events"] entero.
    staleTime: 60_000,
  });
};
