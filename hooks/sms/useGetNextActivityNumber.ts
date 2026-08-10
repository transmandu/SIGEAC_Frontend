"use client"

import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface NextActivityNumber {
  next_number: string;
}

// Correlativo sugerido para el formulario de creación. staleTime corto porque
// otro usuario puede consumir el número mientras se llena el formulario.
export const useGetNextActivityNumber = (company: string | null) => {
  return useQuery<NextActivityNumber>({
    queryKey: ["next-activity-number", company],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/${company}/sms/next-activity-number`,
      );
      return data;
    },
    enabled: !!company,
    staleTime: 5000,
    retry: 1,
  });
};
