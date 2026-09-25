import axios from "@/lib/axios";
import type { CursorPage } from "@/types/inventory";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

type ParamValue = string | number | boolean | null | undefined;

interface UseCursorListingOptions {
  /**
   * Prefijo de la clave de React Query. Va primero para que las mutaciones
   * que invalidan por prefijo (["warehouse-articles"], ["general-articles"])
   * refresquen también estos listados.
   */
  queryKey: readonly unknown[];
  url: string;
  /** Filtros de la barra. Cambiar cualquiera vuelve a la primera página. */
  params: Record<string, ParamValue>;
  enabled?: boolean;
  initialPageSize?: number;
}

/**
 * Listado paginado por cursor: una página a la vez, con navegación
 * adelante/atrás sobre una pila de cursores.
 *
 * El servidor filtra, ordena y agrupa; el cliente nunca tiene todas las filas,
 * así que nada de eso puede hacerse en memoria sobre la página.
 */
export function useCursorListing<T>({
  queryKey,
  url,
  params,
  enabled = true,
  initialPageSize = 15,
}: UseCursorListingOptions) {
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [stack, setStack] = useState<(string | null)[]>([null]);

  // Cualquier cambio de filtros invalida los cursores: sus valores solo
  // significan algo bajo el filtro y el orden con que se generaron. Se
  // reinicia durante el render —el patrón de "estado derivado de props"—
  // para que la consulta nueva ya salga sin el cursor viejo.
  const signature = JSON.stringify([url, params, pageSize]);
  const [lastSignature, setLastSignature] = useState(signature);
  let effectiveStack = stack;
  if (signature !== lastSignature) {
    setLastSignature(signature);
    setStack([null]);
    effectiveStack = [null];
  }

  const cursor = effectiveStack[effectiveStack.length - 1];

  const query = useQuery<CursorPage<T>>({
    queryKey: [...queryKey, params, pageSize, cursor],
    queryFn: async () => {
      const { data } = await axios.get<CursorPage<T>>(url, {
        params: cleanParams({ ...params, per_page: pageSize, cursor }),
      });
      return data;
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Con keepPreviousData siguen en pantalla las filas de la página anterior
  // mientras llega la nueva: su cursor no vale para "Siguiente".
  const isTransitioning = query.isPlaceholderData;

  return {
    rows: query.data?.data ?? [],
    total: query.data?.total,
    groupedBy: query.data?.grouped_by ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isTransitioning,
    refetch: query.refetch,
    pagination: {
      pageIndex: effectiveStack.length - 1,
      pageSize,
      hasPrevPage: !isTransitioning && effectiveStack.length > 1,
      hasNextPage:
        !isTransitioning && !!query.data?.next_cursor && !!query.data?.has_more,
      isTransitioning,
      onNextPage: () => {
        const next = query.data?.next_cursor;
        if (next) setStack((current) => [...current, next]);
      },
      onPrevPage: () => {
        setStack((current) =>
          current.length > 1 ? current.slice(0, -1) : current,
        );
      },
      onPageSizeChange: (size: number) => setPageSizeState(size),
    },
  };
}

export type CursorPaginationState = ReturnType<
  typeof useCursorListing
>["pagination"];

/** Sin vacíos: un parámetro vacío llegaría como filtro "" al servidor. */
function cleanParams(params: Record<string, ParamValue>) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}
