"use client";

import axiosInstance from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner"; // Ajusta según tu librería de toast

interface DispatchReportParams {
  location_id: number | string;
  company: string;
  aircraft_id?: string | null;
  from: string;
  to: string;
}

export const useGetDispatchReport = () => {
  return useMutation({
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
          },
        );
        return response.data;
      } catch (error: any) {
        // Si el servidor responde con un error (ej: 400), el mensaje viene dentro del Blob
        if (error.response?.data instanceof Blob) {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "No se encontraron datos");
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Descarga automática del PDF
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Reporte_Despacho_${new Date().getTime()}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    onError: (error: any) => {
      // Muestra el mensaje enviado desde Laravel: "No hay registros..."
      toast.error("Oops!", {
        description: error.message || "¡Hubo un error al generar el reporte!",
      });
    },
  });
};
