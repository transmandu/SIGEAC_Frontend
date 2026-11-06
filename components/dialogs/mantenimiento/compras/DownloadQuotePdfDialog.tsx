"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useDownloadQuotePdf } from "@/hooks/mantenimiento/compras/useDownloadQuotePdf";
import { useGetQuoteAuthorizers } from "@/hooks/mantenimiento/compras/useGetQuoteAuthorizers";
import { notifyError } from "@/lib/notify-error";

type Props = {
  quote: {
    id: number;
    quote_number: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Diálogo de descarga del formato imprimible de la cotización. Pide el alto
 * cargo que recibirá y firmará el documento: su nombre, cédula y cargo salen
 * impresos en la segunda firma.
 */
export default function DownloadQuotePdfDialog({
  quote,
  open,
  onOpenChange,
}: Props) {
  const { selectedCompany } = useCompanyStore();
  const [authorizer, setAuthorizer] = useState("");

  // Cada descarga debe elegir conscientemente quién firma: no se arrastra la
  // selección anterior.
  const handleOpenChange = (next: boolean) => {
    if (!next) setAuthorizer("");
    onOpenChange(next);
  };

  const { data: authorizers, isLoading } = useGetQuoteAuthorizers(
    open ? selectedCompany?.slug : undefined,
  );
  const { mutateAsync: downloadPdf, isPending } = useDownloadQuotePdf();

  const handleDownload = async () => {
    if (!selectedCompany?.slug || !authorizer || isPending) return;

    try {
      const blob = await downloadPdf({
        company: selectedCompany.slug,
        quoteId: quote.id,
        authorizer,
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${quote.quote_number ?? "cotizacion"}.pdf`;
      // El ancla debe estar en el documento: Firefox ignora el click sobre un
      // elemento suelto y la descarga no ocurre.
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      // Revocar en el mismo tick puede cancelar la descarga en algunos
      // navegadores.
      setTimeout(() => URL.revokeObjectURL(url), 100);

      toast.success(`Cotización ${quote.quote_number} generada`);
      handleOpenChange(false);
    } catch (error) {
      notifyError(error, { action: "generar el formato de la cotización" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <FormDialogContent
        className="sm:max-w-lg"
        icon={FileText}
        title="Descargar formato de cotización"
        description={
          <>
            <span
              className="mb-1 inline-flex max-w-full items-center rounded-md border bg-background px-2 py-0.5 font-mono text-xs font-medium tracking-wide text-muted-foreground"
              title={quote.quote_number ?? undefined}
            >
              <span className="truncate">{quote.quote_number}</span>
            </span>
            <span className="block">
              Se genera para imprimir, firmar y sellar. La segunda firma
              corresponde a quien reciba y autorice la cotización.
            </span>
          </>
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              className="min-w-37.5 gap-2"
              onClick={handleDownload}
              disabled={!authorizer || isPending}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {isPending ? "Generando..." : "Descargar PDF"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="text-sm font-medium">Recibe y autoriza</label>

          {isLoading ? (
            <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Cargando...
            </div>
          ) : (
            <RadioGroup
              value={authorizer}
              onValueChange={setAuthorizer}
              className="gap-2"
            >
              {(authorizers ?? []).map((item) => (
                <label
                  key={item.key}
                  htmlFor={`quote-authorizer-${item.key}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition-colors hover:bg-muted/40",
                    authorizer === item.key && "border-primary bg-primary/5",
                  )}
                >
                  <RadioGroupItem
                    id={`quote-authorizer-${item.key}`}
                    value={item.key}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.dni} · {item.position}
                    </p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          )}
        </div>
      </FormDialogContent>
    </Dialog>
  );
}
