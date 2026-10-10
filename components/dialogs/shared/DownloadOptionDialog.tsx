"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { FileDown, FileText, FolderOpen, Loader2 } from "lucide-react";

type DownloadMode = "template" | "document";

interface DownloadOptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: string;
  libraryDocumentId?: number | null;
  /** Nombre base usado como fallback en la descarga del documento asociado. */
  documentLabel: string;
  /** Dispara la descarga/vista previa de la plantilla (la maneja el padre). */
  onTemplate: () => void;
  templateTitle?: string;
  templateDescription?: string;
  documentTitle?: string;
  documentDescription?: string;
  /** Estado pendiente de la descarga de plantilla del padre (para deshabilitar). */
  templatePending?: boolean;
}

/**
 * El contenido vive en un subcomponente montado dentro de DialogContent:
 * al cerrarse Radix desmonta el contenido, por lo que el estado (selección,
 * descarga en curso) vuelve a su valor inicial en cada apertura sin efectos.
 */
const DownloadOptionContent = ({
  onOpenChange,
  company,
  libraryDocumentId,
  documentLabel,
  onTemplate,
  templateTitle,
  templateDescription,
  documentTitle,
  documentDescription,
  templatePending,
}: Omit<DownloadOptionDialogProps, "open">) => {
  const [mode, setMode] = useState<DownloadMode>("template");
  const [isDownloading, setIsDownloading] = useState(false);

  const hasDocument = Boolean(libraryDocumentId) && Boolean(company);

  const handleDownloadDocument = async () => {
    if (!company || !libraryDocumentId) return;

    setIsDownloading(true);
    try {
      const url = `/${company}/library/documents/${libraryDocumentId}/download`;
      const response = await axiosInstance.get(url, {
        responseType: "blob",
      });
      const blob = response.data as Blob;

      const disposition = response.headers?.["content-disposition"];
      let fileName = `${documentLabel}.pdf`;
      if (typeof disposition === "string") {
        const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
        const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
        const raw = utfMatch?.[1] ?? plainMatch?.[1];
        if (raw) {
          fileName = utfMatch ? decodeURIComponent(raw) : raw;
        }
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.success("Descarga iniciada");
      onOpenChange(false);
    } catch (error) {
      let message = "No se pudo descargar el documento asociado.";
      const data = (error as { response?: { data?: unknown } })?.response?.data;
      if (data instanceof Blob) {
        try {
          const parsed = JSON.parse(await data.text());
          if (parsed?.message) message = parsed.message;
        } catch {
          // respuesta no JSON (HTML de error), se usa el mensaje por defecto
        }
      } else if (data && typeof data === "object" && "message" in data) {
        message = String((data as { message: unknown }).message);
      }
      toast.error(message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleConfirm = () => {
    if (mode === "template") {
      onOpenChange(false);
      onTemplate();
      return;
    }
    void handleDownloadDocument();
  };

  const cardClasses = (active: boolean) =>
    cn(
      "w-full text-left p-4 border rounded-2xl cursor-pointer transition-all",
      active
        ? "border-primary bg-primary/5 shadow-xs"
        : "border-border hover:border-primary/50 bg-background",
    );

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center">¿Qué desea descargar?</DialogTitle>
        <DialogDescription className="text-center p-2 mb-0 pb-0">
          Seleccione una opción para evitar descargar el archivo equivocado.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setMode("template")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setMode("template");
          }}
          className={cardClasses(mode === "template")}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                mode === "template" ? "border-primary" : "border-border",
              )}
            >
              {mode === "template" && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-1">
                <FileText className="h-3.5 w-3.5" /> {templateTitle}
              </p>
              <p className="text-sm text-muted-foreground">
                {templateDescription}
              </p>
            </div>
          </div>
        </div>

        {hasDocument && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => setMode("document")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setMode("document");
            }}
            className={cardClasses(mode === "document")}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                  mode === "document" ? "border-primary" : "border-border",
                )}
              >
                {mode === "document" && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-1">
                  <FolderOpen className="h-3.5 w-3.5" /> {documentTitle}
                </p>
                <p className="text-sm text-muted-foreground">
                  {documentDescription}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          type="button"
        >
          Cancelar
        </Button>
        <Button
          disabled={isDownloading || templatePending}
          className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
          onClick={handleConfirm}
          type="button"
        >
          {isDownloading || templatePending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileDown className="size-4" />
          )}
          Descargar
        </Button>
      </DialogFooter>
    </>
  );
};

export function DownloadOptionDialog({
  open,
  onOpenChange,
  ...contentProps
}: DownloadOptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DownloadOptionContent onOpenChange={onOpenChange} {...contentProps} />
      </DialogContent>
    </Dialog>
  );
}

export default DownloadOptionDialog;
