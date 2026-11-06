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
import { Dialog } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
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

    // La pestaña se abre ya, dentro del clic: abrirla después de esperar la
    // descarga hace que Safari y los navegadores móviles la traten como una
    // ventana emergente no solicitada y la bloqueen.
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;

    try {
      const blob = await fetchSignedQuoteBlob(company, quote.id);
      const url = URL.createObjectURL(blob);

      if (tab) {
        tab.location.href = url;
      } else {
        // Sin pestaña (bloqueada): se descarga en vez de fallar en silencio.
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${quote.quote_number ?? "cotizacion"}-firmada`;
        anchor.click();
      }

      // La pestaña nueva necesita el blob vivo un momento para cargarlo.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      tab?.close();
      notifyError(error, { action: "abrir el documento firmado" });
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <FormDialogContent
        className="sm:max-w-lg"
        icon={FileCheck2}
        tone="emerald"
        title="Documento firmado"
        description={
          <>
            <span
              className="mb-1 inline-flex max-w-full items-center rounded-md border bg-background px-2 py-0.5 font-mono text-xs font-medium tracking-wide text-muted-foreground"
              title={quote.quote_number ?? undefined}
            >
              <span className="truncate">{quote.quote_number}</span>
            </span>
            <span className="block">
              Cargue el escaneo del formato ya firmado y sellado. Un solo
              archivo por cotización: cargar otro reemplaza al anterior.
            </span>
          </>
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={busy}
            >
              Cerrar
            </Button>
            <Button
              className="min-w-37.5 gap-2"
              onClick={handleUpload}
              disabled={!file || busy}
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {isUploading
                ? "Guardando..."
                : current
                  ? "Reemplazar"
                  : "Guardar"}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
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
      </FormDialogContent>
    </Dialog>
  );
}
