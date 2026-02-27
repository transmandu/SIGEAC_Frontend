import { useState } from "react";
import { format } from "date-fns";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

// Añadimos onSuccess como parámetro opcional
export function useSmsReport(onSuccess?: () => void, company: string = "transmandu") {
  const [reportFrom, setReportFrom] = useState<Date | undefined>();
  const [reportTo, setReportTo] = useState<Date | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!reportFrom || !reportTo) {
      toast.error("Por favor, selecciona ambas fechas", {
        description: "El rango es necesario para generar el reporte.",
        position: "bottom-right",
      });
      return;
    }

    if (reportTo < reportFrom) {
      toast.warning("Rango de fechas inválido", {
        description: "La fecha 'Hasta' no puede ser anterior a la fecha 'Desde'.",
        position: "bottom-right",
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
            from: format(reportFrom, "yyyy-MM-dd"), 
            to: format(reportTo, "yyyy-MM-dd") 
          },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `cronograma_sms_${company}_${format(reportFrom, "yyyy-MM-dd")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Reporte descargado con éxito");

      // --- AQUÍ ESTÁ EL TRUCO ---
      // Si la descarga fue exitosa, ejecutamos el cierre del modal
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error("Error técnico:", error);

      if (error.response && error.response.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorMessage = JSON.parse(reader.result as string);
            toast.error(errorMessage.message || "No hay datos para estas fechas", {
              position: "bottom-right",
            });
          } catch (e) {
            toast.error("Error al procesar la respuesta del servidor");
          }
        };
        reader.readAsText(error.response.data);
      } else {
        toast.error("Error al conectar con el servidor");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return { reportFrom, setReportFrom, reportTo, setReportTo, isGenerating, handleGenerate };
}