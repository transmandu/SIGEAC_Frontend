import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

export interface IWarehouseArticle {
  batch_id: number;
  name: string;
  medition_unit: string;
  article_count: number;
  articles: {
    id: number;
    part_number: string;
    serial: string | null;
    description: string;
    zone: string;
    quantity: number;
    status: string; // "stored" | "dispatch" | etc.
    article_type: string; // "componente" | "consumible" | "herramienta"
  }[];
}

const fetchWarehouseConsumableArticles = async (company?: string, location_id?: string): Promise<IWarehouseArticle[]> => {
  const { data } = await axios.get(`/${company}/${location_id}/batches-with-consumable-articles-by-location`);
  return data;
};

export const useGetWarehouseConsumableArticles = (company?: string, location_id?: string) => {
  return useQuery<IWarehouseArticle[], Error>({
    queryKey: ["warehouse-articles", company, location_id],
    queryFn: () => fetchWarehouseConsumableArticles(company, location_id),
    enabled: !!company && !!location_id,
  });
};
