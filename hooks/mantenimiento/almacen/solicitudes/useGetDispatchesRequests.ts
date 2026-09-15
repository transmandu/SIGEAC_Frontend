import { AuthorizedEmployee } from "@/app/[company]/ajustes/autorizaciones/autorizados/columns";
import type { DispatchArticle } from "@/app/[company]/almacen/solicitudes/salida/page";
import { useDebounce } from "@/hooks/helpers/useDebounce";
import axios from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { MaintenanceAircraft } from "@/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

/**
 * `articles` reusa DispatchArticle en vez de redeclararlo: eran dos
 * definiciones del mismo contrato y ya habían divergido —esta se quedó sin los
 * campos de devolución y evidencia—, así que la tabla recibía datos tipados
 * como algo más pobre de lo que el backend manda.
 */
interface IDispatch {
  id: number;
  request_number: string;
  requested_by: string;
  auhtorized_employee?: AuthorizedEmployee;
  created_by: string;
  justification: string;
  destination_place: string;
  submission_date: string;
  status: "PENDING" | "IN_TRANSFER" | "APPROVED" | "REJECTED" | "RETURNED";
  /**
   * Sede destino: solo la llevan los traslados. Es lo que distingue una salida
   * hacia otra estación propia de una entrega corriente, y mientras el estado
   * sea IN_TRANSFER el material sigue en camino sin acusar.
   */
  destination_location?: string | null;
  received_by?: string | null;
  received_at?: string | null;
  rejection_reason?: string | null;
  category?: string;
  work_order?: string;
  aircraft?: MaintenanceAircraft;
  articles: DispatchArticle[];
}

interface CursorPage {
  data: IDispatch[];
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean;
}

const fetchDispatchesRequests = async ({
  location_id,
  company,
  cursor,
  search,
  perPage,
}: {
  location_id: string | null;
  company?: string;
  cursor: string | null;
  search: string;
  perPage: number;
}): Promise<CursorPage> => {
  const { data } = await axios.get(`/${company}/${location_id}/show-dispatch`, {
    params: {
      cursor: cursor ?? undefined,
      search: search || undefined,
      per_page: perPage,
    },
  });
  return data;
};

/**
 * Paginado por cursor: navega "Siguiente/Anterior" en vez de cargar todo el
 * historial de salidas de una sede de una vez, que con miles de filas tardaba
 * segundos. La búsqueda corre en el servidor (request_number, P/N, serial,
 * descripción) porque con cursor pagination el cliente nunca tiene todas las
 * filas para filtrar en memoria.
 *
 * La pila de cursores es lo que permite "Anterior": la API solo entrega el
 * cursor hacia adelante y hacia atrás desde la página actual, así que hay que
 * recordar por dónde se pasó para poder retroceder.
 */
export const useGetDispatchesByLocation = () => {
  const { selectedStation, selectedCompany } = useCompanyStore();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [pageSize, setPageSizeState] = useState(15);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const cursor = cursorStack[cursorStack.length - 1];

  const resetPaging = () => setCursorStack([null]);

  const query = useQuery<CursorPage, Error>({
    queryKey: [
      "dispatches-requests",
      selectedCompany?.slug,
      selectedStation,
      cursor,
      debouncedSearch,
      pageSize,
    ],
    queryFn: () =>
      fetchDispatchesRequests({
        company: selectedCompany?.slug,
        location_id: selectedStation,
        cursor,
        search: debouncedSearch,
        perPage: pageSize,
      }),
    enabled: !!selectedCompany && !!selectedStation,
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    data: query.data?.data,
    hasNextPage: !!query.data?.next_cursor && query.data.has_more,
    hasPrevPage: cursorStack.length > 1,
    // No hay conteo total con cursor pagination; la posición dentro de la
    // navegación actual (cuántos "siguiente" se han pedido) es lo único que
    // se puede mostrar sin paginar todo el histórico solo para contarlo.
    pageIndex: cursorStack.length - 1,
    nextPage: () => {
      if (query.data?.next_cursor) {
        setCursorStack((stack) => [...stack, query.data!.next_cursor]);
      }
    },
    prevPage: () => {
      setCursorStack((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack));
    },
    search,
    setSearch: (value: string) => {
      setSearch(value);
      resetPaging();
    },
    pageSize,
    setPageSize: (value: number) => {
      setPageSizeState(value);
      resetPaging();
    },
  };
};
