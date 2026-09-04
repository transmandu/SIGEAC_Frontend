import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export const useExportPeligroReportes = () => {
  const exportPeligroReportes = async (company: string) => {
    try {
      const response = await axiosInstance.get(
        `/${company}/sms/danger-identifications/export`,
        {
          responseType: "blob",
        }
      );

      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reportes-peligros-sms-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Oops!", {
        description: "No se pudo generar el archivo de exportación...",
      });
    }
  };

  return { exportPeligroReportes };
};