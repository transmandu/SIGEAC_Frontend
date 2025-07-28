import axios from '@/lib/axios';
import { Batch } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface BatchesWithCountProp extends Batch {
  article_count: number,
}

const fetchBatchById = async (
  batch_id: string | null,
  company?: string,
): Promise<BatchesWithCountProp> => {
  const { data } = await axios.get(`/${company}/batches/${batch_id}`);
  return data[0];
};

export const useGetBatchById = (
  batch_id: string | null,
  company?: string
) => {
  return useQuery<BatchesWithCountProp, Error>({
    queryKey: ["batch", batch_id, company],
    queryFn: () => fetchBatchById(batch_id, company!),
    enabled: !!batch_id && !!company,
  });
};
