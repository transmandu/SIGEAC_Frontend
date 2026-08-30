import axios from '@/lib/axios';
import { ManualCalendarEvent } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchManualCalendarEvents = async (company: string | undefined): Promise<ManualCalendarEvent[]> => {
  const { data } = await axios.get(`/${company}/calendar-manual-events`);
  return data;
};

export const useGetManualCalendarEvents = (company: string | undefined) => {
  return useQuery<ManualCalendarEvent[], Error>({
    queryKey: ["calendar-manual-events", company],
    queryFn: () => fetchManualCalendarEvents(company),
    enabled: !!company,
  });
};
