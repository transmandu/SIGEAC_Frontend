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
  /** Incluye las herramientas que están dentro de una caja (salida de herramientas). */
  includeBoxed?: boolean;
}

const fetchBatchesWithInWarehouseArticles = async ({
  location_id,
  company,
  category,
  includeBoxed,
}: UseGetBatchesWithInWarehouseArticlesParams): Promise<BatchesWithCountProp[]> => {
  const { data } = await axios.get(`/${company}/items-for-dispatch`, {
    params: { location_id, category, include_boxed: includeBoxed ? 1 : undefined },
  });
  return data;
};

export const useGetBatchesWithInWarehouseArticles = ({
  location_id,
  company,
  category,
  includeBoxed,
}: UseGetBatchesWithInWarehouseArticlesParams) => {
  return useQuery<
    BatchesWithCountProp[],
    Error,
    BatchesWithCountProp[],
    [string, string, number, string, boolean]
  >({
    queryKey: ['batches-in-warehouse', company, location_id, category, !!includeBoxed],
    queryFn: () => fetchBatchesWithInWarehouseArticles({ location_id, company, category, includeBoxed }),
    enabled: !!location_id && !!company && !!category,
  });
};