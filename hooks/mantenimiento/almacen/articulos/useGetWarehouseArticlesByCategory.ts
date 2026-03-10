import axiosInstance from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useQuery } from '@tanstack/react-query';
import { Unit } from "@/types";

export interface IWarehouseArticle {
  batch_id: number;
  name: string;
  medition_unit?: string;
  article_count: number;
  is_hazardous?: boolean;
  category?: string; // "COMPONENTE" | "CONSUMIBLE" | "HERRAMIENTA" | "All"
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
    unit?: Unit;
    tool?: {
      needs_calibration?: boolean;
      calibration_date?: string; // ISO string o "dd/MM/yyyy"
      next_calibration_date?: string; // si guardas fecha
      next_calibration?: number | string; // o días
      status?: string;
    };
    component?: {
      shell_time?: {
        expiration_date?: string | null;
        fabrication_date?: string | null;
      };
    };
    consumable?: {
      shell_time?: {
        expiration_date?: string | Date | null;
        fabrication_date?: string | Date | null;
      };
    };
    expiration_date?: string | null; // Para componentes y consumibles: viene directamente en el artículo
    condition: {
      name: string;
    };
    status: string; // "stored" | "dispatch" | etc.
    article_type?: string; // "componente" | "consumible" | "herramienta"
    cost: number | string;
    has_documentation?: boolean;
    certificates?: string[];
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
  per_page: number = 15,
  part_number?: string,
): Promise<WarehouseResponse> => {
  const params = new URLSearchParams({
    category,
    status: status ?? "all",
    page: String(page),
    per_page: String(per_page),
  });
  if (part_number?.trim()) params.set("part_number", part_number.trim());
  const { data } = await axiosInstance.get(`/${company}/${location_id}/articles-by-category?${params.toString()}`);

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

/** Normal paginated fetch — one page at a time */
export const useGetWarehouseArticlesByCategory = (
  page: number = 1,
  per_page: number = 15,
  category: string,
  enabled: boolean = true,
  status?: string,
  part_number?: string,
) => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  return useQuery<WarehouseResponse, Error>({
    queryKey: ["warehouse-articles", selectedCompany?.slug, selectedStation, page, per_page, category, part_number],
    queryFn: () => fetchWarehouseArticlesByCategory(selectedStation, category, selectedCompany?.slug, status, page, per_page, part_number),
    enabled: enabled && !!selectedCompany && !!selectedStation,
  });
};

/** Fetch ALL pages sequentially — used for client-side search across the full dataset */
export const useGetAllWarehouseArticlesByCategory = (
  category: string,
  enabled: boolean = true,
  status?: string,
) => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  return useQuery<WarehouseResponse, Error>({
    queryKey: ["warehouse-articles-all", selectedCompany?.slug, selectedStation, category],
    queryFn: async () => {
      // Fetch page 1 to discover total pages
      const first = await fetchWarehouseArticlesByCategory(selectedStation, category, selectedCompany?.slug, status, 1, 15);
      const { last_page } = first.pagination;
      const allBatches = [...first.batches];

      // Fetch remaining pages sequentially to avoid overwhelming the server
      for (let page = 2; page <= last_page; page++) {
        const pageData = await fetchWarehouseArticlesByCategory(selectedStation, category, selectedCompany?.slug, status, page, 15);
        allBatches.push(...pageData.batches);
      }

      return {
        batches: allBatches,
        pagination: { ...first.pagination, current_page: 1 },
      };
    },
    enabled: enabled && !!selectedCompany && !!selectedStation,
    staleTime: 2 * 60 * 1000, // cache all-pages data for 2 minutes
    retry: false, // don't retry — failing fast is better than hanging
  });
};
