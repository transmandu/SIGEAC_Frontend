import axios from '@/lib/axios';
import { Batch } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';

interface BatchesWithCountProp extends Batch {
  article_count: number,
}
const fetchBatchesWithArticlesCount = async ({company, location_id}: {company?: string, location_id: string | null}): Promise<BatchesWithCountProp[]> => {
  const {data} = await axios.get(`/${company}/${location_id}/batches-with-articles`);
  return data;
};

export const useGetBatchesWithArticlesCount = ({company, location_id}: {company?: string, location_id: string | null}) => {
  return useQuery<BatchesWithCountProp[], Error>({
    queryKey: ["batches"],
    queryFn: () => fetchBatchesWithArticlesCount({company, location_id}),
    enabled: !!location_id && !!company
  });
};
