import axios from '@/lib/axios';
import { CalendarEventType } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchCalendarEventTypes = async (company: string | undefined): Promise<CalendarEventType[]> => {
  const { data } = await axios.get(`/${company}/calendar-event-types`);
  return data;
};

export const useGetCalendarEventTypes = (company: string | undefined) => {
  return useQuery<CalendarEventType[], Error>({
    queryKey: ["calendar-event-types", company],
    queryFn: () => fetchCalendarEventTypes(company),
    enabled: !!company,
  });
};
