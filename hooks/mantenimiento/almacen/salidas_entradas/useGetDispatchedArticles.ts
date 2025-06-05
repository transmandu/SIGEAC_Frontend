import axios from '@/lib/axios';
import { WorkOrder } from '@/types';
import { useQuery } from '@tanstack/react-query';

export interface DispachedArticles {
  id: number,
  batch_name: string,
  serial: string,
  justification: string,
  category: string,
  date: string,
  work_order: WorkOrder,
  articles: {
    part_number: string,
    id: number,
    serial: string,
    description: string,
  }[]
}

const fetchDispatchedArticles = async (location_id?: string) => {
  const {data} = await axios.get(`/hangar74/dispatched-articles/${location_id}`);
  return data;
};

export const useGetDispatchedArticles = (location_id?: string) => {
  return useQuery({
    queryKey: ['dispatched-articles'],
    queryFn: () => fetchDispatchedArticles(location_id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!location_id
  });
};
