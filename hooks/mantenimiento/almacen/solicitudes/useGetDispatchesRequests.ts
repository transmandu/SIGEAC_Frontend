import axios from '@/lib/axios';
import { Article, Batch, DispatchRequest, WorkOrder } from '@/types';
import { useMutation } from '@tanstack/react-query';

interface IDispatch {
  id: number;
  requested_by: string;
  created_by: string;
  justification: string;
  destination_place: string;
  submission_date: string;
  status: 'PROCESO' | 'APROBADO' | 'RECHAZADO';
  work_order?: WorkOrder;
  articles: {
    id: number;
    part_number: string;
    serial: string;
    description: string;
    quantity: string;
  }[];
}

const fetchDispatchesRequests = async ({
  location_id,
  company,
}: {
  location_id: number;
  company?: string;
}): Promise<IDispatch[]> => {
  const { data } = await axios.post(`/${company}/show-dispatch`, { location_id });
  console.log(data);
  return data;
};

export const useGetDispatchesByLocation = () => {
  return useMutation<IDispatch[], Error, { company?: string; location_id: number }>({
    mutationKey: ['dispatches-requests', 'company'],
    mutationFn: fetchDispatchesRequests,
  });
};
