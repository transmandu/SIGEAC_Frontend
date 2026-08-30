import axios from '@/lib/axios';
import { CalendarVisibilityRule } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchAllCalendarVisibilityRules = async (company: string | undefined): Promise<CalendarVisibilityRule[]> => {
  const { data } = await axios.get(`/${company}/calendar-visibility-rules`);
  return data;
};

/**
 * Todas las reglas de la empresa en una sola consulta — el panel las reparte
 * por fuente/evento en el cliente. Comparte cache con
 * useGetCalendarVisibilityRules solo si algún día conviene, por ahora es su
 * propia entrada porque el shape (todas vs. filtradas) es distinto.
 */
export const useGetAllCalendarVisibilityRules = (company: string | undefined) => {
  return useQuery<CalendarVisibilityRule[], Error>({
    queryKey: ["calendar-visibility-rules", "all", company],
    queryFn: () => fetchAllCalendarVisibilityRules(company),
    enabled: !!company,
  });
};
