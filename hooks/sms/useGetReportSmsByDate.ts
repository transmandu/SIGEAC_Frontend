import { useState } from "react";
import { format } from "date-fns";

export function useSmsReport(company: string = "transmandu") {
  const [reportFrom, setReportFrom] = useState<Date | undefined>();
  const [reportTo, setReportTo] = useState<Date | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!reportFrom || !reportTo) {
      alert("Por favor, selecciona ambas fechas.");
      return;
    }

    try {
      setIsGenerating(true);

      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('token') || document.cookie.split('; ').find(row => row.trim().startsWith('token='))?.split('=')[1])
        : null;

      const response = await fetch(`http://127.0.0.1:8000/api/${company}/generate-sms-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          from: format(reportFrom, "yyyy-MM-dd"), 
          to: format(reportTo, "yyyy-MM-dd") 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error en el servidor" }));
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `Reporte_SMS_${company}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error: any) {
      alert(error.message || "No se pudo generar el reporte.");
    } finally {
      setIsGenerating(false);
    }
  };

  return { reportFrom, setReportFrom, reportTo, setReportTo, isGenerating, handleGenerate };
}