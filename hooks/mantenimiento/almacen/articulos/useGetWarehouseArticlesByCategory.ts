import axiosInstance from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useQuery } from '@tanstack/react-query';

export interface IWarehouseArticle {
  batch_id: number;
  name: string;
  medition_unit?: string;
  article_count: number;
  is_hazardous?: boolean;
  articles: {
    id: number;
    part_number: string;
    alternative_part_number?: string[];
    serial?: string;
    lot_number?: string;
    description?: string;
    zone: string;
    quantity: number;
    min_quantity?: number | string; // Directamente en el artículo
    tool?: {
      needs_calibration?: boolean;
      calibration_date?: string; // ISO string o "dd/MM/yyyy"
      next_calibration_date?: string; // si guardas fecha
      next_calibration?: number | string; // o días
      status?: string;
    };
    component?: {
      shell_time?: {
        caducate_date?: string | null;
        fabrication_date?: string | null;
      };
    };
    consumable?: {
      shell_time?: {
        caducate_date?: string | Date | null;
        fabrication_date?: string | Date | null;
      };
    };
    condition: {
      name: string;
    };
    status: string; // "stored" | "dispatch" | etc.
    article_type?: string; // "componente" | "consumible" | "herramienta"
    cost: number | string;
  }[];
}

export interface WarehouseResponse {
  batches: IWarehouseArticle[];
  pagination: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

const fetchWarehouseArticlesByCategory = async (
  location_id: string | null,
  category: string,
  company?: string,
  status?: string,
  page: number = 1,
  per_page: number = 25
): Promise<WarehouseResponse> => {
  const { data } = await axiosInstance.get(`/${company}/${location_id}/articles-by-category?category=${category}&status=${status??"all"}&page=${page}&per_page=${per_page}`);

  console.log(data);
  return {
    batches: data.data || [],
    pagination: {
      current_page: data.current_page,
      total: data.total,
      per_page: data.per_page,
      last_page: data.last_page,
      from: data.from,
      to: data.to,
    }
  };
};

export const useGetWarehouseArticlesByCategory = (
  page: number = 1,
  per_page: number = 25,
  category: string,
  enabled: boolean = true,
  status?: string,
) => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  return useQuery<WarehouseResponse, Error>({
    queryKey: ["warehouse-articles", selectedCompany?.slug, selectedStation, page, per_page, category],
    queryFn: () => fetchWarehouseArticlesByCategory(selectedStation, category, selectedCompany?.slug,status, page, per_page),
    enabled: enabled && !!selectedCompany && !!selectedStation,
  });
};
