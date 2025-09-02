import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

export interface IWarehouseArticle {
  id: number;
  article_type: string;
  status: string;
  serial: string;
  description: string;
  zone: string;
  brand: string;
  condition: string;
  manufacturer: string;
  weight: number;
  cost: number;
  batches_id: number;
  vendor_id: string;
  part_number: string;
  alternative_part_number: string[];
  certificates?: string[];
  unit_secondary: string;
  image: string;
  quantity: number;
  category: string;
  batch_name: string;
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

const fetchAllWarehouseArticles = async (company?: string, location_id?: string): Promise<IWarehouseArticle[]> => {
  const { data } = await axios.get(`/${company}/warehouse-articles`, {
    params: { location_id }
  });
  return data;
};

export const useGetAllWarehouseArticles = (company?: string, location_id?: string) => {
  return useQuery<IWarehouseArticle[], Error>({
    queryKey: ["warehouse-articles", company, location_id],
    queryFn: () => fetchAllWarehouseArticles(company, location_id),
    enabled: !!company && !!location_id,
  });
};
