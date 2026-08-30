import axios from '@/lib/axios';
import { CalendarEventSourceInfo } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchCalendarEventSources = async (company: string | undefined): Promise<CalendarEventSourceInfo[]> => {
  const { data } = await axios.get(`/${company}/calendar-event-sources`);
  return data;
};

export const useGetCalendarEventSources = (company: string | undefined) => {
  return useQuery<CalendarEventSourceInfo[], Error>({
    queryKey: ["calendar-event-sources", company],
    queryFn: () => fetchCalendarEventSources(company),
    enabled: !!company,
  });
};
