import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { ErrorReportFilters } from "./useGetErrorReports";

const buildParams = (filters: Omit<ErrorReportFilters, "page" | "per_page">) => {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.module) params.set("module", filters.module);
  if (filters.severity) params.set("severity", filters.severity);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.resolved_from) params.set("resolved_from", filters.resolved_from);
  if (filters.resolved_to) params.set("resolved_to", filters.resolved_to);
  return params;
};

export const useExportErrorReports = () => {
  const exportErrorReports = async (
    format: "excel" | "pdf",
    filters: Omit<ErrorReportFilters, "page" | "per_page"> = {},
  ) => {
    try {
      const params = buildParams(filters);
      const response = await axiosInstance.get(`/error-reports/export/${format}`, {
        params,
        responseType: "blob",
      });

      const extension = format === "excel" ? "xlsx" : "pdf";
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reportes-error.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Oops!", {
        description: "No se pudo generar el archivo de exportacion...",
      });
    }
  };

  return { exportErrorReports };
};
