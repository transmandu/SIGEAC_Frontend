"use client";

import axiosInstance from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface BalanceParams {
  location_id: number | string;
  company: string;
  aircraft_id?: string | null;
  from: string;
  to: string;
}

export const useGetBalanceAndTotalReport = () => {
  return useMutation({
    mutationFn: async (params: BalanceParams) => {
      const response = await axiosInstance.get(
        `/${params.company}/${params.location_id}/balance-and-total-report-pdf`,
        {
          params: { ...params, aircraft_id: params.aircraft_id ?? undefined },
          responseType: "blob",
        },
      );

      // Si el servidor responde con JSON en lugar de PDF, es un error (aunque axios no lo lance)
      if (response.data.type === "application/json") {
        const reader = new FileReader();
        return new Promise((_, reject) => {
          reader.onload = () => {
            const error = JSON.parse(reader.result as string);
            reject(new Error(error.error || "No hay datos"));
          };
          reader.readAsText(response.data);
        });
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Descarga directa
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Reporte_${new Date().toLocaleDateString()}.pdf`,
      );
      link.click();
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error.message,
      });
    },
  });
};