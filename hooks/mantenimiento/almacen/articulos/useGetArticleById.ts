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
const fetchArticleById = async (id: string, location_id: string | null): Promise<EditingArticle> => {
  const {data} = await axios.get(`/hangar74/show-article-by-location/${location_id}/${id}`);
  return data;
};

export const useGetArticleById = (id: string, location_id: string | null) => {
  return useQuery<EditingArticle>({
    queryKey: ["article"],
    queryFn: () => fetchArticleById(id, location_id),
    enabled: !!location_id
  });
};
