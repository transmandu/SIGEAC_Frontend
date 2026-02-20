import { useState } from "react";
import { format } from "date-fns";
import axiosInstance from "@/lib/axios";

/**
 * Hook personalizado para la generación y descarga del reporte PDF de SMS vía GET.
 * @param company El slug de la empresa (ej. 'transmandu').
 */
export function useSmsReport(company: string = "transmandu") {
  const [reportFrom, setReportFrom] = useState<Date | undefined>();
  const [reportTo, setReportTo] = useState<Date | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    // 1. Validación de fechas
    if (!reportFrom || !reportTo) {
      alert("Por favor, selecciona ambas fechas.");
      return;
    }

    try {
      setIsGenerating(true);

      const token = localStorage.getItem('token');

      // 2. Petición GET con Axios
      // En GET, los datos se pasan en la propiedad 'params'
      const response = await axiosInstance.get(
        `/${company}/sms-Report-By-Date`, 
        { 
          params: { 
            from: format(reportFrom, "yyyy-MM-dd"), 
            to: format(reportTo, "yyyy-MM-dd") 
          },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
          responseType: "blob", // Necesario para manejar el PDF
        }
      );

      // 3. Crear el archivo para descarga
      const blob = new Blob([response.data], { type: "application/pdf" });
      
      if (blob.size === 0) {
        throw new Error("El servidor devolvió un archivo vacío.");
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      
      const fileName = `Reporte_SMS_${company}_${format(new Date(), "yyyyMMdd")}.pdf`;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();

      // Limpieza
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error: any) {
      console.error("Error al generar el reporte:", error);

      // Si el error es un Blob (sucede porque responseType es 'blob'), hay que convertirlo a texto para leer el error real
      if (error.response?.data instanceof Blob && error.response.data.type === "application/json") {
        const reader = new FileReader();
        reader.onload = () => {
          const errorMessage = JSON.parse(reader.result as string).message;
          alert(errorMessage || "Error en el servidor");
        };
        reader.readAsText(error.response.data);
      } else if (error.response?.status === 401) {
        alert("Sesión expirada. Por favor inicia sesión de nuevo.");
      } else if (error.response?.status === 404) {
        alert("No se encontraron datos para el rango de fechas seleccionado.");
      } else {
        alert("No se pudo conectar con el servidor o el reporte falló.");
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
    handleGenerate 
  };
}