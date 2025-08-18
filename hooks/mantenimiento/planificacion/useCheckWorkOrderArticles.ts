import axiosInstance from '@/lib/axios';
import { useMutation } from '@tanstack/react-query';
type ArticleAvailability = Array<{
  article: string;
  available: boolean;
  location?: string;
  warehouse?: string;
}>;

const checkArticles = async (tasks: number[], company?: string): Promise<ArticleAvailability> => {
  const { data } = await axiosInstance.post(`/${company}/get-work-order-articles`, { tasks });
  return data;
};

export const useCheckWorkOrderArticles = (company?: string) => {
  return useMutation<ArticleAvailability, Error, number[]>({
    mutationFn: (tasks: number[]) => checkArticles(tasks, company),
  });
};
