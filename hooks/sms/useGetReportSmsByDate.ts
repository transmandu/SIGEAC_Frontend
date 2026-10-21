import { useState } from "react";
import { format } from "date-fns";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { notifyBlobError } from "@/lib/notify-error";

/**
 * Hook personalizado para la generación y descarga del reporte PDF de SMS.
 * @param onSuccess Callback que se ejecuta tras una descarga exitosa (ej. cerrar el modal).
 * @param company El identificador de la empresa (por defecto 'transmandu').
 */
export function useSmsReport(onSuccess?: () => void, company: string = "transmandu") {
  const [reportFrom, setReportFrom] = useState<Date | undefined>();
  const [reportTo, setReportTo] = useState<Date | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);

  // Determina si el botón debe estar habilitado:
  // Requiere ambas fechas y que no haya una petición en curso.
  const hasDates = !!(reportFrom && reportTo);
  const canGenerate = hasDates && !isGenerating;

  const handleGenerate = async () => {
    // Protección de seguridad extra
    if (!canGenerate) return;

    // Validación lógica: evitar que 'Hasta' sea menor que 'Desde'
    if (reportTo! < reportFrom!) {
      toast.warning("Rango inválido", {
        description: "La fecha 'Hasta' no puede ser anterior a la fecha 'Desde'.",
        id: "date-validation", // ID único para evitar múltiples toasts iguales
      });
      return;
    }

    setIsGenerating(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await axiosInstance.get(
        `/${company}/sms-report-by-date`, 
        { 
          params: { 
            from: format(reportFrom!, "yyyy-MM-dd"), 
            to: format(reportTo!, "yyyy-MM-dd") 
          },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
          responseType: "blob", // Importante para manejar archivos
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      if (blob.size === 0) throw new Error("empty_file");

      // El PDF llega como blob: se fuerza la descarga con un <a> temporal.
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `cronograma_sms_${company}_${format(reportFrom!, "yyyy-MM-dd")}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Reporte descargado", {
        description: "El cronograma se ha generado correctamente.",
        id: "report-status"
      });

      // Ejecutar el cierre del modal si se proporcionó la función
      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error("Error al generar reporte:", error);

      if (error.response?.status === 404) {
        toast.error("Sin resultados", {
          description:
            "No hay reportes dentro de esas fechas. Intenta con otro rango.",
          id: "report-error",
        });
      } else {
        await notifyBlobError(error, { action: "generar el reporte" });
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
    canGenerate // Úsalo para la propiedad 'disabled' del botón
  };
}