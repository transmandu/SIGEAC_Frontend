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
  format?: "pdf" | "excel";
}

export const useGetDispatchReport = () => {
  return useMutation({
    retry: false,

    mutationFn: async (params: DispatchReportParams) => {
      const format = params.format ?? "pdf";

      const endpoint =
        format === "excel"
          ? `/${params.company}/${params.location_id}/dispatch-report-excel`
          : `/${params.company}/${params.location_id}/dispatch-report-pdf`;

      try {
        const response = await axiosInstance.get(endpoint, {
          params: {
            aircraft_id: params.aircraft_id ?? undefined,
            from: params.from,
            to: params.to,
          },
          responseType: "blob",
        });

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
        description: error.message || "Ocurrió un problema al generar el reporte.",
      });
    },
  });
};