
import axiosInstance from '@/lib/axios';
import { Article } from '@/types';
import { useMutation } from '@tanstack/react-query';
const fetchArticlesByBatch = async (location_id: number, batch: string): Promise<Article[]> => {
  const {data} = await axiosInstance.post(`/hangar74/batches/${batch}`, {location_id});
  return data;
};

export const useGetArticlesByBatch = (location_id: number, batch: string) => {
  return useMutation<Article[], Error, number>({
    mutationKey: ["articles"],
    mutationFn: () => fetchArticlesByBatch(location_id, batch),
  });
};
