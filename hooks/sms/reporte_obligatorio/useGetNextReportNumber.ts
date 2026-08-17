"use client"

import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface NextNumberResponse {
  next_number: string;
}

// Correlativo sugerido para el formulario de creación. staleTime corto porque
// otro usuario puede consumir el número mientras se llena el formulario.
export const useGetNextReportNumber = (company: string | null) => {
  return useQuery<NextNumberResponse>({
    queryKey: ["next-obligatory-report-number", company],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/${company}/sms/next-obligatory-report-number`,
      );
      return data;
    },
    enabled: !!company,
    staleTime: 5000,
    retry: 1,
  });
};
