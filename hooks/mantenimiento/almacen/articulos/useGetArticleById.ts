import axios from '@/lib/axios';
import { Article, Batch, Convertion } from '@/types';
import { useQuery } from '@tanstack/react-query';
interface EditingArticle extends Article {
  batches: Batch,
  tool?: {
    id: number,
    serial: string,
    isSpecial: boolean,
    article_id: number,
  },
  component?: {
    serial: string,
    hard_time: {
      hour_date: string,
      cycle_date: string,
      calendary_date: string,
    },
    shell_time: {
      caducate_date: string,
      fabrication_date: string,
    }
  },
  consumable?: {
    article_id: number,
    is_managed: boolean,
    convertions: Convertion[],
    quantity: number,
    shell_time: {
      caducate_date: Date,
      fabrication_date: string,
      consumable_id: string,
    }
  },
}
const fetchArticleById = async (id: string, company?: string): Promise<EditingArticle> => {
  const {data} = await axios.get(`/${company}/article/${id}`);
  return data;
};

export const useGetArticleById = (id: string, company?: string) => {
  return useQuery<EditingArticle>({
    queryKey: ["article", id, company],
    queryFn: () => fetchArticleById(id, company),
    enabled: !!id && !!company
  });
};
