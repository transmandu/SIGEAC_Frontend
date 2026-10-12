"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useDownloadQuotePdf } from "@/hooks/mantenimiento/compras/useDownloadQuotePdf";
import { useGetQuoteAuthorizers } from "@/hooks/mantenimiento/compras/useGetQuoteAuthorizers";

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
      anchor.click();
      URL.revokeObjectURL(url);

      toast.success(`Cotización ${quote.quote_number} generada`);
      handleOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo generar el formato de la cotización.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-5 border-b bg-muted/30">
          <div className="flex items-start gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-background shadow-xs text-blue-600">
              <FileText className="size-5" />
            </div>

            <div className="min-w-0 space-y-1 text-left">
              <DialogTitle className="text-base leading-snug">
                Descargar formato de cotización
              </DialogTitle>
              <div
                className="inline-flex max-w-full items-center rounded-md border bg-background px-2 py-0.5 font-mono text-xs font-medium tracking-wide text-muted-foreground"
                title={quote.quote_number ?? undefined}
              >
                <span className="truncate">{quote.quote_number}</span>
              </div>
              <DialogDescription className="text-xs leading-relaxed">
                Se genera para imprimir, firmar y sellar. La segunda firma
                corresponde a quien reciba y autorice la cotización.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-3">
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

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/30">
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            className="gap-2 min-w-37.5"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
