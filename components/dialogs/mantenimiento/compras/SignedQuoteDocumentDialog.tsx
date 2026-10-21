"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  ExternalLink,
  FileCheck2,
  FileUp,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DEFAULT_TIMEZONE, formatInstant } from "@/lib/date";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  fetchSignedQuoteBlob,
  useDeleteSignedQuote,
  useUploadSignedQuote,
} from "@/hooks/mantenimiento/compras/useQuoteSignedDocument";
import type { QuoteSignedDocument } from "@/types/purchase";
import { notifyError } from "@/lib/notify-error";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

type Props = {
  quote: {
    id: number;
    quote_number: string | null;
    signed_document?: QuoteSignedDocument | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeZone?: string;
};

/**
 * Respaldo físico de la cotización: se imprime el formato, la directiva lo
 * firma y sella, y aquí se carga el escaneo. Es un solo archivo por
 * cotización; cargar otro reemplaza al anterior.
 */
export default function SignedQuoteDocumentDialog({
  quote,
  open,
  onOpenChange,
  timeZone = DEFAULT_TIMEZONE,
}: Props) {
  const { selectedCompany } = useCompanyStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) setFile(null);
    onOpenChange(next);
  };

  const { mutateAsync: upload, isPending: isUploading } =
    useUploadSignedQuote();
  const { mutateAsync: remove, isPending: isRemoving } = useDeleteSignedQuote();

  const current = quote.signed_document;
  const company = selectedCompany?.slug;
  const busy = isUploading || isRemoving;

  const handleSelect = (selected: File | undefined) => {
    if (!selected) return;

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      toast.error("¡Ops! Solo se admiten archivos PDF, JPG o PNG.");
      return;
    }

    if (selected.size > MAX_SIZE_BYTES) {
      toast.error("¡Ops! El archivo supera el máximo de 10 MB.");
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!company || !file || busy) return;

    try {
      await upload({ company, quoteId: quote.id, file });
      toast.success("Documento firmado guardado");
      handleOpenChange(false);
    } catch (error) {
      notifyError(error, { action: "guardar el documento firmado" });
    }
  };

  const handleRemove = async () => {
    if (!company || busy) return;

    try {
      await remove({ company, quoteId: quote.id });
      toast.success("Documento firmado eliminado");
    } catch (error) {
      notifyError(error, { action: "eliminar el documento firmado" });
    }
  };

  const handleOpen = async () => {
    if (!company || isOpening) return;

    setIsOpening(true);
    try {
      const blob = await fetchSignedQuoteBlob(company, quote.id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      // La pestaña nueva necesita el blob vivo un momento para cargarlo.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      notifyError(error, { action: "abrir el documento firmado" });
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-5 border-b bg-muted/30">
          <div className="flex items-start gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-background shadow-xs text-emerald-600">
              <FileCheck2 className="size-5" />
            </div>

            <div className="min-w-0 space-y-1 text-left">
              <DialogTitle className="text-base leading-snug">
                Documento firmado
              </DialogTitle>
              <div
                className="inline-flex max-w-full items-center rounded-md border bg-background px-2 py-0.5 font-mono text-xs font-medium tracking-wide text-muted-foreground"
                title={quote.quote_number ?? undefined}
              >
                <span className="truncate">{quote.quote_number}</span>
              </div>
              <DialogDescription className="text-xs leading-relaxed">
                Cargue el escaneo del formato ya firmado y sellado. Un solo
                archivo por cotización: cargar otro reemplaza al anterior.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-5">
          {current && (
            <div className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2.5">
              <FileCheck2 className="size-5 shrink-0 text-emerald-600" />

              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-medium"
                  title={current.name ?? undefined}
                >
                  {current.name ?? "Documento firmado"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Cargado
                  {current.uploaded_by ? ` por ${current.uploaded_by}` : ""}
                  {current.uploaded_at
                    ? ` el ${formatInstant(current.uploaded_at, timeZone, "short")}`
                    : ""}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleOpen}
                disabled={isOpening || busy}
                title="Ver documento"
              >
                {isOpening ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ExternalLink className="size-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                disabled={busy}
                className="text-red-600 hover:text-red-600"
                title="Eliminar documento"
              >
                {isRemoving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {current ? "Reemplazar por otro archivo" : "Archivo escaneado"}
            </label>

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={(event) => {
                handleSelect(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed px-4 py-6 text-center transition-colors hover:bg-muted/40 disabled:opacity-50"
            >
              <FileUp className="size-6 text-muted-foreground" />
              {file ? (
                <span className="max-w-full truncate text-sm font-medium">
                  {file.name}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Seleccionar archivo
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                PDF, JPG o PNG · máximo 10 MB
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/30">
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={busy}
          >
            Cerrar
          </Button>
          <Button
            className="gap-2 min-w-37.5"
            onClick={handleUpload}
            disabled={!file || busy}
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {isUploading ? "Guardando..." : current ? "Reemplazar" : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
