import axios from '@/lib/axios';
import { Article, Batch } from '@/types';
import { useMutation } from '@tanstack/react-query';

interface BatchesWithCountProp extends Batch {
  articles: Article[];
  batch_id: number;
}

const fetchBatchesWithInWarehouseArticles = async ({
  location_id,
  company,
}: {
  location_id: number;
  company: string;
}): Promise<BatchesWithCountProp[]> => {
  const { data } = await axios.post(`/${company}/items-for-dispatch`, { location_id });
  return data;
};

export const useGetBatchesWithInWarehouseArticles = () => {
  return useMutation<
    BatchesWithCountProp[],
    Error,
    { location_id: number; company: string }
  >({
    mutationKey: ['batches-in-warehouse'],
    mutationFn: fetchBatchesWithInWarehouseArticles,
  });
};
