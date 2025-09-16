import axiosInstance from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
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

const fetchWarehouseConsumableArticles = async (
  location_id: string | null, 
  company?: string,
  page: number = 1,
  per_page: number = 25
): Promise<WarehouseResponse> => {
  const { data } = await axiosInstance.get(`/${company}/${location_id}/batches-with-consumable-articles-by-location?page=${page}&per_page=${per_page}`);
  
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

export const useGetWarehouseConsumableArticles = (page: number = 1, per_page: number = 25) => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  return useQuery<WarehouseResponse, Error>({
    queryKey: ["warehouse-articles", selectedCompany?.slug, selectedStation, page, per_page],
    queryFn: () => fetchWarehouseConsumableArticles(selectedStation, selectedCompany?.slug, page, per_page),
    enabled: !!selectedCompany && !!selectedStation,
  });
};
