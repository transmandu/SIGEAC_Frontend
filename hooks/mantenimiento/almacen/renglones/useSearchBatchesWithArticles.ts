import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import axios from '@/lib/axios';

// Interface para batch con sus artículos relacionados
export interface BatchWithArticles {
  // Información del batch
  batch: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    category: string;
    ata_code: string | null;
    brand: string | null;
    warehouse_name: string;
    warehouse_id: string;
    min_quantity: string;
    medition_unit: string;
  };
  
  // Artículos que coinciden con la búsqueda en este batch
  articles: {
    id: number;
    part_number: string;
    alternative_part_number: string | null;
    description: string | null;
    serial: string | null;
    quantity: number;
    zone: string;
    condition: string;
    manufacturer: string | null;
    unit_secondary: string | null;
    status: string;
    cost: number | null;
    image: string | null;
    certificates: string[] | null;
    article_type: string | null;
    
    // Información específica del tipo de artículo
    tool?: {
      id: number;
      serial: string;
      isSpecial: boolean;
      article_id: number;
    } | null;
    component?: {
      serial: string;
      hard_time: {
        hour_date: string;
        cycle_date: string;
        calendary_date: string;
      };
      shell_time: {
        caducate_date: string;
        fabrication_date: string;
      };
    } | null;
    consumable?: {
      id: number;
      is_managed: string;
      quantity: number;
      article_id: string;
      caducate_date: string | null;
      fabrication_date: string | null;
    } | null;
  }[];
}

const searchBatchesWithArticles = async ({
  location_id,
  company,
  part_number,
}: {
  location_id: number;
  company?: string;
  part_number: string;
}): Promise<BatchWithArticles[]> => {
  const { data } = await axios.get(`/${company}/${location_id}/search-articles-with-batch`, { params: { part_number } });
  return data;
};




export const useSearchBatchesWithArticles = (
  company?: string,
  location_id?: string,
  part_number?: string
) => {
  return useQuery<BatchWithArticles[], Error>({
    queryKey: ["search-batches-with-articles", company, location_id, part_number],
    queryFn: () => searchBatchesWithArticles({location_id: Number(location_id!), company: company!, part_number: part_number!}),
    enabled: !!company && !!location_id && !!part_number,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });
};
