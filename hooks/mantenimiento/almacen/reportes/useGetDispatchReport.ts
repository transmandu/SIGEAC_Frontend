import axios from '@/lib/axios';
import { Aircraft } from '@/types';
import { useQuery } from '@tanstack/react-query';

export interface DispatchReport {
  id: number;
  request_number: string;
  status: string;
  requested_by: string;
  approved_by: string;
  delivered_by: string;
  created_by: string;
  justification: string;
  destination_place: string;
  submission_date: string;
  work_order?: string;
  aircraft?: Aircraft;
  articles: {
    id: number;
    part_number: string;
    alternative_part_number?: string[];
    serial?: string;
    description: string;
    quantity: number;
    quantity_used: string;
    unit_label: string;
  }[];
}

const fetchDispatchReport = async (
  location_id: string,
  company?: string,
): Promise<DispatchReport[]> => {
  const { data } = await axios.get(
    `/${company}/${location_id}/report-dispatch-orders`
  );
  return data;
};

export const useGetDispatchReport = (
  location_id: string | null,
  company?: string,
) => {
  return useQuery<DispatchReport[], Error>({
    queryKey: ["dispatch-report", company, location_id],
    queryFn: () => fetchDispatchReport(location_id!, company!),
    enabled: false, // ⛔ nunca automático
  });
};
