import axios from '@/lib/axios';
import { Batch } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';

interface BatchesWithCountProp extends Batch {
  article_count: number,
}
const fetchBatchById = async (batch_id: string | null): Promise<BatchesWithCountProp> => {
  const {data} = await axios.get(`/hangar74/batches/${batch_id}`);
  return data[0];
};

export const useGetBatchById = (batch_id: string | null) => {
  return useQuery<BatchesWithCountProp, Error>({
    queryKey: ["batch"],
    queryFn: () => fetchBatchById(batch_id ?? null),
    enabled: !!batch_id,
  });
};
