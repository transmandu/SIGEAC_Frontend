import axios from '@/lib/axios';
import { Article, Batch } from '@/types';
import { useMutation } from '@tanstack/react-query';

interface BatchesWithCountProp extends Batch {
  articles: Article[],
  batch_id: number,
}

const fetchBatchesWithInWarehouseArticles = async (location_id: number): Promise<BatchesWithCountProp[]> => {
  const {data} = await axios.post('/hangar74/items-for-dispatch', { location_id });
  return data;
};

export const useGetBatchesWithInWarehouseArticles = () => {
  return useMutation<BatchesWithCountProp[], Error, number>({
    mutationKey: ["batches"],
    mutationFn: fetchBatchesWithInWarehouseArticles,
  });
};
