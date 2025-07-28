import axios from '@/lib/axios';
import { WorkOrder } from '@/types';
import { useQuery } from '@tanstack/react-query';

export interface DispachedArticles {
  id: number;
  batch_name: string;
  serial: string;
  justification: string;
  category: string;
  date: string;
  work_order: WorkOrder;
  articles: {
    part_number: string;
    id: number;
    serial: string;
    description: string;
  }[];
}

const fetchDispatchedArticles = async ({
  company,
  location_id,
}: {
  location_id: string;
  company?: string;
}): Promise<DispachedArticles[]> => {
  const { data } = await axios.get(`/${company}/dispatched-articles/${location_id}`);
  return data;
};

export const useGetDispatchedArticles = ({
  company,
  location_id,
}: {
  company?: string;
  location_id?: string;
}) => {
  return useQuery({
    queryKey: ['dispatched-articles', 'company'],
    queryFn: () =>
      fetchDispatchedArticles({company: company!, location_id: location_id!}),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company && !!location_id,
  });
};
