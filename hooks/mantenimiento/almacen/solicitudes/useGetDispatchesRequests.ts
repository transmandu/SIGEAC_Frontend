import axios from '@/lib/axios';
import { Article, Batch, DispatchRequest, WorkOrder } from '@/types';
import { useMutation } from '@tanstack/react-query';

interface IDispatch {
    id: number,
    requested_by: string,
    created_by: string,
    justification: string,
    destination_place: string,
    submission_date: string,
    work_order?: WorkOrder,
    articles:
        {
            id: number,
            part_number: string,
            serial: string,
            description: string,
            quantity: string,
        }[],
}

const fetchDispatchesRequests = async (location_id: number): Promise<IDispatch[]> => {
  const {data} = await axios.post('/hangar74/show-dispatch', { location_id });
  return data;
};

export const useGetDispatchesByLocation = () => {
  return useMutation<IDispatch[], Error, number>({
    mutationKey: ["dispatches-requests"],
    mutationFn: fetchDispatchesRequests,
  });
};
