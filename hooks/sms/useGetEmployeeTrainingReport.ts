import { useState } from "react";
import { format, startOfYear } from "date-fns";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

/**
 * Hook para generar y descargar el reporte PDF de "Capacitación de empleados
 * en SMS" dado un rango de fechas. Por defecto toma desde el 1 de enero del
 * año actual hasta hoy.
 */
export function useEmployeeTrainingReport(
  onSuccess?: () => void,
  company?: string
) {
  const [reportFrom, setReportFrom] = useState<Date | undefined>(
    startOfYear(new Date())
  );
  const [reportTo, setReportTo] = useState<Date | undefined>(new Date());
  const [isGenerating, setIsGenerating] = useState(false);

  const hasDates = !!(reportFrom && reportTo);
  const canGenerate = hasDates && !isGenerating;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    if (reportTo! < reportFrom!) {
      toast.warning("Rango inválido", {
        description: "La fecha 'Hasta' no puede ser anterior a la fecha 'Desde'.",
        id: "date-validation",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axiosInstance.get(
        `/${company}/sms/employee-training-report`,
        {
          params: {
            from: format(reportFrom!, "yyyy-MM-dd"),
            to: format(reportTo!, "yyyy-MM-dd"),
          },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      if (blob.size === 0) throw new Error("empty_file");

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `capacitacion_empleados_sms_${company}_${format(reportFrom!, "yyyy-MM-dd")}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Reporte descargado", {
        description: "El reporte de capacitación se ha generado correctamente.",
        id: "report-status",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error al generar reporte:", error);

      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          toast.error("Sin resultados", {
            description: "No hay datos dentro de esas fechas. Intenta con otro rango.",
            id: "report-error",
          });
        } else if (status === 401) {
          toast.error("Sesión expirada", {
            description: "Tu sesión ha terminado. Por favor, inicia sesión de nuevo.",
            id: "report-error",
          });
        } else {
          toast.error("Error del servidor", {
            description: "Hubo un problema al procesar el PDF. Intenta más tarde.",
            id: "report-error",
          });
        }
      } else {
        toast.error("Error de conexión", {
          description: "No se pudo conectar con el servidor.",
          id: "report-error",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    reportFrom,
    setReportFrom,
    reportTo,
    setReportTo,
    isGenerating,
    handleGenerate,
    canGenerate,
  };
}