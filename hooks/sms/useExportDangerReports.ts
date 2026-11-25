import axiosInstance from "@/lib/axios";
import { notifyError } from "@/lib/notify-error";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { formatInstant } from "@/lib/date";

export const useExportDangerReports = () => {
  const timeZone = useCompanyTimezone();
  const exportDangerReports = async (company: string) => {
    try {
      const response = await axiosInstance.get(
        `/${company}/sms/danger-identifications/export`,
        {
          responseType: "blob",
        },
      );

      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reportes-peligros-sms-${formatInstant(new Date(), timeZone, "yyyy-MM-dd")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      notifyError(error, { action: "generar el archivo de exportación" });
    }
  };

  return { exportDangerReports };
};
