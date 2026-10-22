"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axiosInstance from "@/lib/axios";
import { cn } from "@/lib/utils";
import { FileDown, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { notifyError } from "@/lib/notify-error";

interface PdfEndpointPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endpoint: string;
  fileName: string;
  title?: string;
  description?: string;
  className?: string;
  fileExtension?: string;
}

export function PdfEndpointPreviewDialog({
  open,
  onOpenChange,
  endpoint,
  fileName,
  title = "Vista previa del PDF",
  description = "Revisa el documento antes de descargarlo.",
  className,
  fileExtension = "pdf",
}: PdfEndpointPreviewDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchPdfBlob = useCallback(async () => {
    const response = await axiosInstance.get(endpoint, {
      responseType: "blob",
    });
    // Conservamos el content-type real del servidor: además de PDF los
    // endpoints pueden servir imágenes (ej. certificados jpg/png).
    const blob = response.data as Blob;
    return blob.type ? blob : new Blob([blob], { type: "application/pdf" });
  }, [endpoint]);

  // Se pide al abrir y se descarta al cerrar: la vista previa siempre es del
  // documento tal como está ahora.
  const {
    data: fetchedBlob,
    isFetching: isLoading,
    error: previewError,
  } = useQuery<Blob, Error>({
    queryKey: ["pdf-endpoint-preview", endpoint],
    queryFn: fetchPdfBlob,
    enabled: open,
    staleTime: 0,
    gcTime: 0,
    meta: { silent: true },
  });

  useEffect(() => {
    if (previewError) {
      notifyError(previewError, { action: "cargar la vista previa del PDF" });
    }
  }, [previewError]);

  const previewBlob = open ? (fetchedBlob ?? null) : null;
  const previewUrl = useObjectUrl(previewBlob);

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const blob = previewBlob ?? (await fetchPdfBlob());
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${fileName}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      notifyError(error, { action: "descargar el PDF" });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-7xl w-[95vw] h-[90vh] md:h-[85vh] flex flex-col overflow-hidden gap-4 p-6",
          className,
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
