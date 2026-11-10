"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ExternalLink,
  FileCheck2,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { labelClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { FilePickerField } from "@/components/misc/FilePickerField";
import { Label } from "@/components/ui/label";
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
  const [file, setFile] = useState<File | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);

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

  // Debe lanzar si falla: el diálogo de confirmación solo se cierra al resolver.
  const handleRemove = async () => {
    if (!company) return;

    try {
      await remove({ company, quoteId: quote.id });
      toast.success("Documento firmado eliminado");
    } catch (error) {
      notifyError(error, { action: "eliminar el documento firmado" });
      throw error;
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
              className="min-w-35 gap-2"
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
            <div className="flex items-center gap-3 rounded-xl border border-emerald-300/70 bg-emerald-50/50 p-3 dark:border-emerald-700/40 dark:bg-emerald-950/20">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileCheck2 className="size-4" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium wrap-anywhere">
                  {current.name ?? "Documento firmado"}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  Cargado
                  {current.uploaded_by ? ` por ${current.uploaded_by}` : ""}
                  {current.uploaded_at
                    ? ` el ${formatInstant(current.uploaded_at, timeZone, "short")}`
                    : ""}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleOpen}
                disabled={isOpening || busy}
                aria-label="Ver documento"
                title="Ver documento"
                className="max-sm:size-10"
              >
                {isOpening ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ExternalLink className="size-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setConfirmingRemoval(true)}
                disabled={busy}
                aria-label="Eliminar documento"
                title="Eliminar documento"
                className="text-red-600 hover:text-red-600 max-sm:size-10"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label className={labelClass}>
              {current ? "Reemplazar por otro archivo" : "Archivo escaneado"}
            </Label>

            <FilePickerField
              file={file}
              onChange={(next) => setFile(next ?? null)}
              acceptedTypes={ACCEPTED_TYPES}
              typesLabel="PDF, JPG o PNG"
              maxBytes={MAX_SIZE_BYTES}
              disabled={busy}
            />
          </div>
        </div>

        <ConfirmDeleteDialog
          open={confirmingRemoval}
          onOpenChange={setConfirmingRemoval}
          title="Eliminar documento firmado"
          entityName={current?.name ?? "el documento firmado"}
          warning="La cotización quedará sin su respaldo firmado hasta que cargue otro escaneo."
          isPending={isRemoving}
          onConfirm={handleRemove}
        />
      </FormDialogContent>
    </Dialog>
  );
}
