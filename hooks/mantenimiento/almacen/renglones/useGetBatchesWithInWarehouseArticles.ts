import axios from '@/lib/axios';
import { Article, Batch } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface BatchesWithCountProp extends Batch {
  articles: Article[];
  batch_id: number;
}

interface UseGetBatchesWithInWarehouseArticlesParams {
  location_id: number;
  company: string;
  category: string;
}

const fetchBatchesWithInWarehouseArticles = async ({
  location_id,
  company,
  category,
}: UseGetBatchesWithInWarehouseArticlesParams): Promise<BatchesWithCountProp[]> => {
  const { data } = await axios.get(`/${company}/items-for-dispatch`, {
    params: { location_id, category },
  });
  return data;
};

export const useGetBatchesWithInWarehouseArticles = ({
  location_id,
  company,
  category,
}: UseGetBatchesWithInWarehouseArticlesParams) => {
  return useQuery<
    BatchesWithCountProp[],
    Error,
    BatchesWithCountProp[],
    [string, string, number, string]
  >({
    queryKey: ['batches-in-warehouse', company, location_id, category],
    queryFn: () => fetchBatchesWithInWarehouseArticles({ location_id, company, category }),
    enabled: !!location_id && !!company && !!category,
  });
};