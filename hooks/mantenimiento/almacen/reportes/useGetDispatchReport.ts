"use client";

import axiosInstance from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface DispatchReportParams {
  location_id: number | string;
  company: string;
  aircraft_id?: string | null;
  from: string;
  to: string;
}

export const useGetDispatchReport = () => {
  return useMutation({
    retry: false,

    mutationFn: async (params: DispatchReportParams) => {
      try {
        const response = await axiosInstance.get(
          `/${params.company}/${params.location_id}/dispatch-report-pdf`,
          {
            params: {
              aircraft_id: params.aircraft_id ?? undefined,
              from: params.from,
              to: params.to,
            },
            responseType: "blob",
          }
        );

        // Detectar si el backend devolvió JSON en lugar de PDF
        const contentType = response.headers["content-type"];

        if (contentType?.includes("application/json")) {
          const text = await response.data.text();
          const error = JSON.parse(text);

          throw new Error(
            error.error || "No se encontraron datos para los filtros seleccionados"
          );
        }

        return response.data;
      } catch (error: any) {
        // Manejo de errores cuando Axios devuelve Blob
        if (error.response?.data instanceof Blob) {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);

          throw new Error(
            errorData.error || "No se encontraron datos para los filtros seleccionados"
          );
        }

        throw new Error("Error al generar el reporte");
      }
    },

    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error.message ||
          "Ocurrió un problema al generar el reporte.",
      });
    },
  });
};