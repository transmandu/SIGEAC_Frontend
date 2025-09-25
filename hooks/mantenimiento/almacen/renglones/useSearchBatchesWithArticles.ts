import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

// Interface para batch con sus artículos relacionados
export interface BatchWithArticles {
  // Información del batch
  batch: {
    id: number;
    name: string;
    slug: string;
    description: string;
    category: string;
    ata_code: string;
    brand: string;
    warehouse_name: string;
    warehouse_id: number;
    min_quantity: number;
    medition_unit: string;
  };
  
  // Artículos que coinciden con la búsqueda en este batch
  articles: {
    id: number;
    part_number: string;
    alternative_part_number: string[];
    description: string;
    serial: string;
    quantity: number;
    zone: string;
    condition: string;
    manufacturer: string;
    unit_secondary: string;
    status: string;
    cost: number;
    image?: string;
    certificates?: string[];
    article_type: "CONSUMABLE" | "COMPONENT" | "TOOL";
    
    // Información específica del tipo de artículo
    tool?: {
      id: number;
      serial: string;
      isSpecial: boolean;
      article_id: number;
    };
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
    };
    consumable?: {
      article_id: number;
      is_managed: boolean;
      convertions: {
        id: number;
        secondary_unit: string;
        convertion_rate: number;
        quantity_unit: number;
        unit: {
          label: string;
          value: string;
        };
      }[];
      shell_time: {
        caducate_date: Date;
        fabrication_date: Date;
        consumable_id: string;
      };
    };
  }[];
}

const searchBatchesWithArticles = async (
  company: string,
  location_id: string,
  part_number: string
): Promise<BatchWithArticles[]> => {
  const { data } = await axiosInstance.post(`/${company}/${location_id}/search-batches-with-articles`, {
    params: { location_id, part_number }
  });
  // const { data } = await axiosInstance.get(`/${company}/${location_id}/search-article-with-batch/${part_number}`);
  console.log(data);
  return data;
};

export const useSearchBatchesWithArticles = (
  company?: string,
  location_id?: string,
  part_number?: string
) => {
  return useQuery<BatchWithArticles[], Error>({
    queryKey: ["search-batches-with-articles", company, location_id, part_number],
    queryFn: () => searchBatchesWithArticles(company!, location_id!, part_number!),
    enabled: !!company && !!location_id && !!part_number,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });
};
