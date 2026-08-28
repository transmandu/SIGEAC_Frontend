"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface DownloadMaintenanceFormatButtonProps {
  url: string;
  filename: string;
  label?: string;
}

/**
 * Descarga el formato certificado INAC-43-008 (Aeronave/Motor/Hélice) ya
 * lleno con los datos reales de ese bloque — el backend arma el PDF al
 * vuelo, así que solo hay que pedirlo como blob y bajarlo.
 */
export function DownloadMaintenanceFormatButton({ url, filename, label = "Descargar formato INAC" }: DownloadMaintenanceFormatButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await axiosInstance.get(url, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      toast.error("Oops!", {
        description: "No se pudo generar el formato INAC.",
      });
      console.log(error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-primary"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
          Formato INAC
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
