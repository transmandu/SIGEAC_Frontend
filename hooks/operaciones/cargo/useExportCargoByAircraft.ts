"use client";

import axiosInstance from "@/lib/axios";
import { useState } from "react";

export const useExportCargoByAircraft = (company?: string) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = async (
    aircraftID: string | number,
    month: number,
    year: number,
    aircraftName?: string,
    isExternal: boolean = false,
  ) => {
    setIsExporting(true);
    try {
      const endpoint = isExternal
        ? `/${company}/cargo-shipments/external-aircraft/${encodeURIComponent(aircraftID)}/export`
        : `/${company}/cargo-shipments/aircraft/${aircraftID}/export`;

      const response = await axiosInstance.get(endpoint, {
        params: { month, year },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const paddedMonth = String(month).padStart(2, "0");
      link.setAttribute(
        "download",
        `carga_${aircraftName || aircraftID}_${paddedMonth}_${year}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        alert(json.message || "Error al generar el reporte");
      } else {
        alert("Error al exportar el archivo Excel");
      }
    } finally {
      setIsExporting(false);
    }
  };
  return { exportToExcel, isExporting };
};
