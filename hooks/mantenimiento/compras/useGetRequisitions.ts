import axios from '@/lib/axios';
import { Requisition } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchRequisition = async (company?: string, location_id?: string): Promise<Requisition[]> => {
  const {data} = await axios.get(`/${company}/${location_id}/requisition-orders`);
  return data;
};

export const useGetRequisition = (company?: string, location_id?: string) => {
  return useQuery<Requisition[]>({
    queryKey: ["requisitions-orders"],
    queryFn: () => fetchRequisition(company, location_id),
    enabled: !!company && !!location_id
  });
};
