import { useState } from "react";
import { format } from "date-fns";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

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

      // Verificamos si el archivo no llegó vacío
      const blob = new Blob([response.data], { type: "application/pdf" });
      if (blob.size === 0) throw new Error("empty_file");

      // Crear link temporal para la descarga automática
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `cronograma_sms_${company}_${format(reportFrom!, "yyyy-MM-dd")}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Reporte descargado", {
        description: "El cronograma se ha generado correctamente.",
        id: "report-status"
      });

      // Ejecutar el cierre del modal si se proporcionó la función
      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error("Error al generar reporte:", error);

      // Manejo inteligente de errores basado en la respuesta del servidor
      if (error.response) {
        const status = error.response.status;

        if (status === 404) {
          toast.error("Sin resultados", {
            description: "No hay reportes dentro de esas fechas. Intenta con otro rango.",
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
        // Error de red o falta de conexión
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
    canGenerate // Úsalo para la propiedad 'disabled' del botón
  };
}