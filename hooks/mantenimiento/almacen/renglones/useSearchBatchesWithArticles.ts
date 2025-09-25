import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

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
    warehouse_id: number | string;
    min_quantity: number | string;
    medition_unit: string;
  };
  
  // Artículos que coinciden con la búsqueda en este batch
  articles: {
    id: number;
    part_number: string;
    alternative_part_number: string[] | null;
    description: string | null;
    serial: string;
    quantity: number | string;
    zone: string;
    condition: string;
    manufacturer: string | null;
    unit_secondary: string | null;
    status: string;
    cost: number | null;
    image?: string | null;
    certificates?: string[] | null;
    article_type: "CONSUMABLE" | "COMPONENT" | "TOOL" | null;
    
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
  const { data } = await axiosInstance.get(`/${company}/${location_id}/search-articles-with-batch`, {
    params: { location_id, part_number }
  });
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
