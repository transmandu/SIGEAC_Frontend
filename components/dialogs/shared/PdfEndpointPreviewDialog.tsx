"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import axiosInstance from "@/lib/axios";
import { cn } from "@/lib/utils";
import { FileDown, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

interface PdfEndpointPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endpoint: string;
  fileName: string;
  title?: string;
  description?: string;
  className?: string;
}

export function PdfEndpointPreviewDialog({
  open,
  onOpenChange,
  endpoint,
  fileName,
  title = "Vista previa del PDF",
  description = "Revisa el documento antes de descargarlo.",
  className,
}: PdfEndpointPreviewDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

  const resetPreview = useCallback(() => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewBlob(null);
  }, [previewUrl]);

  const fetchPdfBlob = async () => {
    const response = await axiosInstance.get(endpoint, {
      responseType: "blob",
    });
    return new Blob([response.data], { type: "application/pdf" });
  };

  const ensurePreview = async () => {
    if (previewBlob && previewUrl) {
      return previewBlob;
    }

    const blob = await fetchPdfBlob();
    const url = window.URL.createObjectURL(blob);

    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }

    setPreviewBlob(blob);
    setPreviewUrl(url);

    return blob;
  };

  const loadPreview = useCallback(async () => {
    setIsLoading(true);
    try {
      await ensurePreview();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar la vista previa del PDF.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [previewBlob, previewUrl, endpoint]);

  // EFECTO 1: Carga automática al abrir y limpieza al cerrar/desmontar
  useEffect(() => {
    if (open) {
      void loadPreview();
    } else {
      resetPreview();
    }

    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [open]);

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const blob = await ensurePreview();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo descargar el PDF.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-7xl w-[95vw] h-[90vh] md:h-[85vh] flex flex-col overflow-hidden gap-4 p-6",
          className
        )}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Contenedor expandido con flex-1 */}
        <div className="relative flex-1 w-full overflow-hidden rounded-xl border bg-muted/20 flex flex-col">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          )}

          {previewUrl ? (
            <iframe
              src={`${previewUrl}#zoom=page-fit&navpanes=0`}
              className="flex-1 w-full h-full border-0 rounded-xl"
              title={title}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground p-8">
              {!isLoading && "Preparando la vista previa del documento..."}
            </div>
          )}
        </div>

        <div className="flex justify-end shrink-0 pt-2">
          <Button
            onClick={handleDownload}
            disabled={isLoading || isDownloading}
            className="gap-2"
          >
            {isDownloading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileDown className="size-4" />
            )}
            Descargar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PdfEndpointPreviewDialog;