import axios from '@/lib/axios';
import { Requisition } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchRequisition = async (companyId: string | null, locationId: string | null): Promise<Requisition[]> => {
  const {data} = await axios.get(`/requisition-orders/${companyId}/${locationId}`);
  return data;
};

export const useGetRequisition = (companyId: string | null, locationId: string | null) => {
  return useQuery<Requisition[]>({
    queryKey: ["requisitions-orders"],
    queryFn: () => fetchRequisition(companyId, locationId),
    enabled: !!companyId && !!locationId
  });
};
