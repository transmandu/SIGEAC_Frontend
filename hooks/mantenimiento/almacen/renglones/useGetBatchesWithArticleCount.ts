import axios from '@/lib/axios';
import { Batch } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';

interface BatchesWithCountProp extends Batch {
  article_count: number,
}
const fetchBatchesWithArticlesCount = async (location_id?: string): Promise<BatchesWithCountProp[]> => {
  const {data} = await axios.get(`/hangar74/batches-with-articles/${location_id}`);
  return data;
};

export const useGetBatchesWithArticlesCount = (location_id?: string) => {
  return useQuery<BatchesWithCountProp[], Error>({
    queryKey: ["batches"],
    queryFn: () => fetchBatchesWithArticlesCount(location_id),
    enabled: !!location_id
  });
};
