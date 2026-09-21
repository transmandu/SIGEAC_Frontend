import { useDebounce } from "@/hooks/helpers/useDebounce";
import axios from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Requisition, RequisitionType } from "@/types/purchase";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface CursorPage {
  data: Requisition[];
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean;
  /** Total bajo los filtros vigentes, no de la página: lo cuenta el servidor. */
  total: number;
}

export interface PurchaseRequisitionFilters {
  status: string;
  priority: string;
}

const ALL = "ALL";

/**
 * Listado de requisiciones del módulo de compras, paginado por cursor.
 *
 * Endpoint propio, separado del de "mis solicitudes": esta pantalla despliega
 * las cotizaciones asociadas y el estado de compra de cada fila, que la otra no
 * muestra y por tanto no tiene por qué recibir.
 *
 * Búsqueda y filtros corren en el servidor. Con paginación por cursor el
 * cliente solo tiene la página actual, así que filtrar en memoria —como se
 * hacía antes— mostraría resultados de esa página y no del conjunto.
 */
export const useGetPurchaseRequisitions = (type: RequisitionType) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [filters, setFiltersState] = useState<PurchaseRequisitionFilters>({
    status: ALL,
    priority: ALL,
  });
  const [pageSize, setPageSizeState] = useState(15);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const cursor = cursorStack[cursorStack.length - 1];

  const resetPaging = () => setCursorStack([null]);

  const query = useQuery<CursorPage>({
    queryKey: [
      "requisitions-orders",
      "purchase",
      selectedCompany?.slug,
      selectedStation,
      type,
      cursor,
      debouncedSearch,
      filters.status,
      filters.priority,
      pageSize,
    ],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${selectedCompany?.slug}/${selectedStation}/purchase/requisition-orders`,
        {
          params: {
            type,
            cursor: cursor ?? undefined,
            search: debouncedSearch || undefined,
            status: filters.status === ALL ? undefined : filters.status,
            priority: filters.priority === ALL ? undefined : filters.priority,
            per_page: pageSize,
          },
        },
      );
      return data;
    },
    enabled: !!selectedCompany && !!selectedStation,
    placeholderData: keepPreviousData,
  });

  // keepPreviousData deja en pantalla las filas de la página anterior mientras
  // llega la nueva, en vez de vaciar la tabla. isPlaceholderData señala esa
  // transición para que la tabla la atenúe y bloquee la navegación hasta que
  // los datos correspondan a la página pedida.
  const isTransitioning = query.isPlaceholderData;

  const setFilter = (key: keyof PurchaseRequisitionFilters, value: string) => {
    setFiltersState((current) => ({ ...current, [key]: value }));
    resetPaging();
  };

  return {
    ...query,
    data: query.data?.data,
    /**
     * Cuántas requisiciones hay bajo los filtros vigentes, no cuántas cupieron
     * en la página. El servidor lo cuenta aparte, porque un cursor no conoce el
     * tamaño del conjunto que recorre.
     */
    total: query.data?.total ?? 0,
    isTransitioning,
    // Un cursor solo es válido para la página que ya llegó: mientras se ve la
    // anterior, "Siguiente" apuntaría a la página equivocada.
    hasNextPage:
      !isTransitioning && !!query.data?.next_cursor && query.data.has_more,
    hasPrevPage: !isTransitioning && cursorStack.length > 1,
    // No hay conteo total con paginación por cursor: la posición dentro de la
    // navegación actual es lo único que puede mostrarse sin recorrer todo el
    // histórico solo para contarlo.
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
    filters,
    setFilter,
    pageSize,
    setPageSize: (value: number) => {
      setPageSizeState(value);
      resetPaging();
    },
  };
};
