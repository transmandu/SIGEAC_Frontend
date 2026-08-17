import axiosInstance from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Aircraft, Unit } from "@/types";

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
        stock?: number;
        min_quantity?: number | string; // Directamente en el artículo
        unit?: Unit;
        aircraft?: Aircraft; // Si el artículo está asociado a una aeronave
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
        /** Entrada al estado actual (ISO). Null si no hay movimiento que lo feche. */
        status_since?: string | null;
        article_type?: string; // "componente" | "consumible" | "herramienta"
        cost: number | string;
        has_documentation?: boolean;
        certificates?: string[];
        /** URL ya resuelta por el backend; ausente si el artículo no tiene imagen. */
        image?: string | null;
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

export interface ArticleSort {
    id: string;
    desc: boolean;
}

/**
 * Filtros de columna que resuelve el servidor. Con paginado por página, filtrar
 * en la tabla solo alcanzaría las filas ya cargadas.
 */
export interface ArticleColumnFilters {
    /** `conditions.name` crudo (ej: "AS REMOVED"). */
    condition?: string;
    /** `tools.status` (ej: "VENCIDO"). */
    tool_status?: string;
    /** Código de ubicación por tramos (ej: "C-1", "A-2-1"). */
    zone?: string;
    /** Part number o su alterno. */
    part_number_col?: string;
    /** Serial o número de lote. */
    serial_col?: string;
    /** Nombre del batch, que es lo que muestra la columna "Descripción". */
    description_col?: string;
}

const fetchWarehouseArticlesByCategory = async (
    location_id: string | null,
    category: string,
    company?: string,
    status?: string,
    page: number = 1,
    per_page: number = 15,
    part_number?: string,
    is_hazardous?: boolean,
    sort?: ArticleSort,
    filters?: ArticleColumnFilters,
): Promise<WarehouseResponse> => {
    const params = new URLSearchParams({
        category,
        status: status ?? "all",
        page: String(page),
        per_page: String(per_page),
    });
    if (part_number?.trim()) params.set("part_number", part_number.trim());
    if (is_hazardous !== undefined) params.set("is_hazardous", String(is_hazardous));
    if (filters?.condition?.trim()) params.set("condition", filters.condition.trim());
    if (filters?.tool_status?.trim()) params.set("tool_status", filters.tool_status.trim());
    if (filters?.zone?.trim()) params.set("zone", filters.zone.trim());
    if (filters?.part_number_col?.trim()) params.set("part_number_col", filters.part_number_col.trim());
    if (filters?.serial_col?.trim()) params.set("serial_col", filters.serial_col.trim());
    if (filters?.description_col?.trim()) params.set("description_col", filters.description_col.trim());
    // Con sort_by el backend pagina por artículo, no por batch.
    if (sort) {
        params.set("sort_by", sort.id);
        params.set("sort_dir", sort.desc ? "desc" : "asc");
    }
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
    is_hazardous?: boolean,
    sort?: ArticleSort,
    filters?: ArticleColumnFilters
) => {
    const { selectedCompany, selectedStation } = useCompanyStore();
    return useQuery<WarehouseResponse, Error>({
        queryKey: ["warehouse-articles", selectedCompany?.slug, selectedStation, page, per_page, category, status, part_number, is_hazardous, sort?.id, sort?.desc, filters?.condition, filters?.tool_status, filters?.zone, filters?.part_number_col, filters?.serial_col, filters?.description_col],
        queryFn: () => fetchWarehouseArticlesByCategory(selectedStation, category, selectedCompany?.slug, status, page, per_page, part_number, is_hazardous, sort, filters),
        enabled: enabled && !!selectedCompany && !!selectedStation,
        // Mantiene la página anterior visible mientras llega la nueva: sin esto
        // cada cambio de orden/página vacía la tabla y parpadea el loader.
        placeholderData: keepPreviousData,
        staleTime: 30_000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
    });
};

export const useGetAllWarehouseArticlesByCategory = (
  category: string,
  enabled: boolean = true,
  status?: string,
) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  return useQuery<WarehouseResponse, Error>({
    queryKey: ["warehouse-articles-all", selectedCompany?.slug, selectedStation, category],

    queryFn: async () => {
      const first = await fetchWarehouseArticlesByCategory(
        selectedStation,
        category,
        selectedCompany?.slug,
        status,
        1,
        20
      )

      const { last_page } = first.pagination

      const CONCURRENCY = 4
      let currentPage = 2
      const results: IWarehouseArticle[][] = []

      while (currentPage <= last_page) {
        const batch = []

        for (let i = 0; i < CONCURRENCY && currentPage <= last_page; i++) {
          batch.push(
            fetchWarehouseArticlesByCategory(
              selectedStation,
              category,
              selectedCompany?.slug,
              status,
              currentPage,
              20
            )
          )
          currentPage++
        }

        const pages = await Promise.all(batch)

        results.push(...pages.map(p => p.batches))
      }

      const allBatches = [
        ...first.batches,
        ...results.flat(),
      ]

      return {
        batches: allBatches,
        pagination: { ...first.pagination, current_page: 1 },
      }
    },

    enabled: enabled && !!selectedCompany && !!selectedStation,

    staleTime: 0,
    retry: false,
  })
}
