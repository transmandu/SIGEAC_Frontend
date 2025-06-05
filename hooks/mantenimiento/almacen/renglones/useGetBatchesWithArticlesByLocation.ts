import axios from '@/lib/axios';
import { Article, Batch } from '@/types';
import { useMutation } from '@tanstack/react-query';

interface BatchesWithCountProp extends Batch {
  articles: Article[],
}
const fetchBatchesWithArticlesByLocation = async (location_id: number): Promise<BatchesWithCountProp[]> => {
  const {data} = await axios.post('/hangar74/batches-with-articles-by-location', { location_id });
  return data;
};

export const useGetBatchesWithArticlesByLocation = () => {
  return useMutation<BatchesWithCountProp[], Error, number>({
    mutationKey: ["batches"],
    mutationFn: fetchBatchesWithArticlesByLocation,
  });
};
