import axiosInstance from '@/lib/axios';
import { useMutation } from '@tanstack/react-query';
type ArticleAvailability = Array<{
  article: string;
  available: boolean;
  location?: string;
  warehouse?: string;
}>;

const checkArticles = async (tasks: number[]): Promise<ArticleAvailability> => {
  const { data } = await axiosInstance.post(`/hangar74/get-work-order-articles`, { tasks });
  return data;
};

export const useCheckWorkOrderArticles = () => {
  return useMutation<ArticleAvailability, Error, number[]>({
    mutationFn: checkArticles,
  });
};
