import axios from '@/lib/axios';
import { Article, Batch } from '@/types';
import { useMutation } from '@tanstack/react-query';

interface BatchesWithCountProp extends Batch {
  articles: Article[];
}

const fetchBatchesWithArticlesByLocation = async ({
  location_id,
  company,
}: {
  location_id: number;
  company?: string;
}): Promise<BatchesWithCountProp[]> => {
  const { data } = await axios.post(`/${company}/batches-with-articles-by-location`, { location_id });
  return data;
};

export const useGetBatchesWithArticlesByLocation = () => {
  return useMutation<BatchesWithCountProp[], Error, { location_id: number; company?: string }>({
    mutationKey: ['batches-with-articles', "company"],
    mutationFn: fetchBatchesWithArticlesByLocation,
  });
};
