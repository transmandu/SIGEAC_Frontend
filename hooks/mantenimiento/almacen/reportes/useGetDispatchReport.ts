"use client";

import axiosInstance from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

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
      const response = await axiosInstance.get(
        `/${params.company}/${params.location_id}/dispatch-report-pdf`,
        {
          params: {
            aircraft_id: params.aircraft_id ?? undefined,
            from: params.from,
            to: params.to,
          },
          responseType: "blob", // 🔥 obligatorio para PDF
        },
      );

      return response.data;
    },
  });
};
