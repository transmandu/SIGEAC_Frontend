import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

// Interface para artículos con información detallada incluyendo batch
export interface ArticleSearchResult {
  // Información del artículo
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
  
  // Información del batch relacionado
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
  };
  
  // Información específica del tipo de artículo
  article_type: "CONSUMABLE" | "COMPONENT" | "TOOL";
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
}

const searchArticlesByPartNumber = async (
  company: string,
  location_id: string,
  part_number: string
): Promise<ArticleSearchResult[]> => {
  const { data } = await axiosInstance.get(`/${company}/${location_id}/search-articles-by-part`, {
    params: { location_id, part_number }
  });
  return data;
};

export const useSearchArticlesByPartNumber = (
  company?: string,
  location_id?: string,
  part_number?: string
) => {
  return useQuery<ArticleSearchResult[], Error>({
    queryKey: ["search-articles", company, location_id, part_number],
    queryFn: () => searchArticlesByPartNumber(company!, location_id!, part_number!),
    enabled: !!company && !!location_id && !!part_number,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });
};
