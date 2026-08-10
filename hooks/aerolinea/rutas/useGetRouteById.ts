"use client"

import axiosInstance from "@/lib/axios";
import { Route } from "@/types";
import { useQuery } from "@tanstack/react-query";

// Una sola ruta, para precargar el formulario de edición. El listado completo
// es useGetRoute, en este mismo directorio.
export const useGetRouteById = (id: string | null) => {
  const routesQuery = useQuery({
    queryKey: ["route", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/transmandu/route/${id}`);
      return data as Route;
    },
    enabled: !!id
  });

  return {
    data: routesQuery.data,
    loading: routesQuery.isLoading,
    error: routesQuery.isError
  };
};
