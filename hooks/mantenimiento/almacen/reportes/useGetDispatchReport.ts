import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

export interface DispatchReport {
  id: number,
  request_number: string;
  status: string,
  requested_by: string,
  approved_by: string,
  delivered_by: string,
  created_by: string,
  justification: string,
  destination_place: string,
  submission_date: string,
  work_order?: string,
  aircraft?: number,
  articles: {
    id: number,
    part_number: string,
    alternative_part_number?: string[],
    serial?: string,
    description: string,
    quantity: number,
  }[];
}[]


const fetchDispatchReport = async (location_id: string | null): Promise<DispatchReport[]> => {
  const {data} = await axios.get(`hangar74/report-dispatch-orders/${location_id}`);
  return data;
};

export const useGetDispatchReport = (location_id: string | null) => {
  return useQuery<DispatchReport[], Error>({
    queryKey: ["dispatch-report"],
    queryFn: () => fetchDispatchReport(location_id),
    enabled: !!location_id,
  });
};
