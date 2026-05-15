"use client";

import axiosInstance from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface DispatchReportParams {
  location_id: number | string;
  company: string;
  aircraft_id?: string | null;
  work_order?: string | null;
  department_id?: string | null;
  authorized_employee_id?: string | null;
  third_party_id?: string | null;
  type?: "aeronautical" | "general" | null;
  from: string;
  to: string;
  format?: "pdf" | "excel";
  part_number?: string | null;
  alternative_part_number?: string | null;
  description?: string | null;
  batch_id?: string | null;
  variant_type?: string | null;
  brand_model?: string | null;
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
            work_order: params.work_order ?? undefined,
            department_id: params.department_id ?? undefined,
            authorized_employee_id: params.authorized_employee_id ?? undefined,
            third_party_id: params.third_party_id ?? undefined,
            type: params.type ?? undefined,
            from: params.from,
            to: params.to,
            part_number: params.part_number ?? undefined,
            alternative_part_number: params.alternative_part_number ?? undefined,
            description: params.description ?? undefined,
            batch_id: params.batch_id ?? undefined,
            variant_type: params.variant_type ?? undefined,
            brand_model: params.brand_model ?? undefined,
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
