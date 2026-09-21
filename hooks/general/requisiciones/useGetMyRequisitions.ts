import { useDebounce } from "@/hooks/helpers/useDebounce";
import axios from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { MyRequisition, RequisitionType } from "@/types/purchase";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface CursorPage {
  data: MyRequisition[];
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean;
}

export interface MyRequisitionCounts {
  all: number;
  aeronautical: number;
  general: number;
}

export type MyRequisitionTypeFilter = "ALL" | RequisitionType;

const EMPTY_COUNTS: MyRequisitionCounts = {
  all: 0,
  aeronautical: 0,
  general: 0,
};

/**
 * Listado de "mis solicitudes", paginado por cursor.
 *
 * El alcance —todo, lo de almacén, o solo lo propio— lo decide el servidor a
 * partir del rol de quien consulta. Antes lo decidía esta pantalla sobre una
 * respuesta que ya traía las solicitudes de todos, de modo que las ajenas
 * viajaban al navegador aunque no se pintaran.
 *
 * Los conteos de los tabs vienen de su propio endpoint porque con paginación
 * por cursor el cliente solo tiene la página actual y no puede calcularlos.
 */
export const useGetMyRequisitions = () => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [typeFilter, setTypeFilterState] =
    useState<MyRequisitionTypeFilter>("ALL");
  const [pageSize, setPageSizeState] = useState(15);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const cursor = cursorStack[cursorStack.length - 1];

  const resetPaging = () => setCursorStack([null]);

  const enabled = !!selectedCompany && !!selectedStation;
  const type = typeFilter === "ALL" ? undefined : typeFilter;
  const searchParam = debouncedSearch || undefined;

  const query = useQuery<CursorPage>({
    queryKey: [
      "requisitions-orders",
      "mine",
      selectedCompany?.slug,
      selectedStation,
      typeFilter,
      cursor,
      debouncedSearch,
      pageSize,
    ],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${selectedCompany?.slug}/${selectedStation}/my-requisition-orders`,
        {
          params: {
            type,
            cursor: cursor ?? undefined,
            search: searchParam,
            per_page: pageSize,
          },
        },
      );
      return data;
    },
    enabled,
    placeholderData: keepPreviousData,
  });

  // Los conteos no dependen del tab activo ni del cursor: son el total de cada
  // familia bajo la búsqueda vigente, que es lo que cada tab anuncia.
  const countsQuery = useQuery<MyRequisitionCounts>({
    queryKey: [
      "requisitions-orders",
      "mine-counts",
      selectedCompany?.slug,
      selectedStation,
      debouncedSearch,
    ],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${selectedCompany?.slug}/${selectedStation}/my-requisition-orders/counts`,
        { params: { search: searchParam } },
      );
      return data;
    },
    enabled,
    placeholderData: keepPreviousData,
  });

  const isTransitioning = query.isPlaceholderData;

  return {
    ...query,
    data: query.data?.data,
    counts: countsQuery.data ?? EMPTY_COUNTS,
    isTransitioning,
    hasNextPage:
      !isTransitioning && !!query.data?.next_cursor && query.data.has_more,
    hasPrevPage: !isTransitioning && cursorStack.length > 1,
    pageIndex: cursorStack.length - 1,
    nextPage: () => {
      if (query.data?.next_cursor) {
        setCursorStack((stack) => [...stack, query.data!.next_cursor]);
      }
    },
    prevPage: () => {
      setCursorStack((stack) =>
        stack.length > 1 ? stack.slice(0, -1) : stack,
      );
    },
    search,
    setSearch: (value: string) => {
      setSearch(value);
      resetPaging();
    },
    typeFilter,
    setTypeFilter: (value: MyRequisitionTypeFilter) => {
      setTypeFilterState(value);
      resetPaging();
    },
    pageSize,
    setPageSize: (value: number) => {
      setPageSizeState(value);
      resetPaging();
    },
  };
};
