import { description } from '@/components/misc/TestChart';
import axios from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
import { PlanificationEvent } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';


const fetchPlanificationEvents = async ({company, location_id}: {company?: string, location_id: string | null }): Promise<PlanificationEvent[]> => {
  const { data } = await axios.get(`/${company}/${location_id}/planification-events`);
  const events  = data.map((event: PlanificationEvent) => ({
    ...event,
    start: format(event.start_date, "yyyy-MM-dd HH:mm"),
    end: format(event.end_date, "yyyy-MM-dd HH:mm"),
    calendarId: event.priority
  }));
  return events
};

export const useGetPlanificationEvents = () => {
  const {selectedCompany, selectedStation} = useCompanyStore();
  return useQuery<PlanificationEvent[], Error>({
    queryKey: ["planification-events", selectedStation, selectedCompany?.slug],
    queryFn: () => fetchPlanificationEvents({ company: selectedCompany?.slug, location_id: selectedStation }),
    enabled: !!selectedCompany && !!selectedStation,
  });
};
