import { useDebounce } from "@/hooks/helpers/useDebounce";
import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

export type WorkshopDispatchEvent = {
  id: number;
  event: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  occurred_at: string;
  registered_by: string;
};

export type WorkshopDispatchArticle = {
  id: number;
  article_id: number | null;
  general_article_id: number | null;
  quantity: number;
  status: "DISPATCHED" | "PARTIALLY_RETURNED" | "RETURNED";
  article?: { id: number; part_number?: string; serial?: string; description?: string; batch?: { id: number; name?: string } };
  general_article?: { id: number; description?: string };
};

/** Mismo shape que DispatchArticlesDialog espera de la salida normal. */
export type WorkshopDispatchDisplayArticle = {
  id: number | null;
  part_number?: string;
  serial?: string;
  description?: string;
  dispatch_quantity: string;
  unit?: string;
  type?: "aeronautical" | "general" | "unknown";
  category?: string;
  batch_name?: string | null;
  alternative_part_number?: string[] | null;
  lot_number?: string | null;
  variant_type?: string | null;
  brand_model?: string | null;
  article_dispatch_order_id?: number;
  returned_quantity?: number;
  pending_quantity?: number;
  status?: "DISPATCHED" | "PARTIALLY_RETURNED" | "RETURNED";
};

export type WorkshopDispatch = {
  id: number;
  request_number: string;
  justification: string | null;
  requested_by: string | null;
  submission_date: string | null;
  dispatched_date: string | null;
  status: string;
  workshop_dispatch: {
    id: number;
    workshop_id: number;
    requested_by: string | null;
    receiver: string | null;
    authorizer: string | null;
    expected_return_date: string | null;
    status: "IN_WORKSHOP" | "RETURNED";
    workshop?: { id: number; name: string };
    events: WorkshopDispatchEvent[];
  };
  articles_dispatch: WorkshopDispatchArticle[];
  /** Ya aplanados por el backend, listos para DispatchArticlesDialog. */
  articles: WorkshopDispatchDisplayArticle[];
};

interface CursorPage {
  data: WorkshopDispatch[];
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean;
}

/**
 * Paginado por cursor, mismo criterio que useGetDispatchesByLocation: navega
 * Siguiente/Anterior en vez de cargar todo el historial de salidas a taller
 * de una sede de una vez, y la búsqueda corre en el servidor.
 */
export const useGetWorkshopDispatches = () => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [pageSize, setPageSizeState] = useState(15);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const cursor = cursorStack[cursorStack.length - 1];

  const resetPaging = () => setCursorStack([null]);

  const query = useQuery<CursorPage>({
    queryKey: ["workshop-dispatches", selectedCompany?.slug, selectedStation, cursor, debouncedSearch, pageSize],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/${selectedCompany?.slug}/${selectedStation}/workshop-dispatch-order`,
        { params: { cursor: cursor ?? undefined, search: debouncedSearch || undefined, per_page: pageSize } },
      );
      return data;
    },
    enabled: !!selectedCompany && !!selectedStation,
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    data: query.data?.data,
    hasNextPage: !!query.data?.next_cursor && query.data.has_more,
    hasPrevPage: cursorStack.length > 1,
    pageIndex: cursorStack.length - 1,
    nextPage: () => {
      if (query.data?.next_cursor) {
        setCursorStack((stack) => [...stack, query.data!.next_cursor]);
      }
    },
    prevPage: () => {
      setCursorStack((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack));
    },
    pageSize,
    setPageSize: (value: number) => {
      setPageSizeState(value);
      resetPaging();
    },
    search,
    setSearch: (value: string) => {
      setSearch(value);
      resetPaging();
    },
  };
};

export const useGetWorkshopDispatch = (id?: number | string) => {
  const { selectedCompany } = useCompanyStore();

  return useQuery<WorkshopDispatch>({
    queryKey: ["workshop-dispatch", selectedCompany?.slug, id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/${selectedCompany?.slug}/workshop-dispatch-order/${id}`,
      );
      return data.data ?? data;
    },
    enabled: !!selectedCompany?.slug && !!id,
  });
};
