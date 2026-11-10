"use client";

import { Dialog } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { Button } from "@/components/ui/button";
import { FileServer } from "@/components/misc/FileServer";
import { cn } from "@/lib/utils";
import type { PurchaseOrderInvoice } from "@/types/purchase";
import { Download, Loader2, Receipt } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoices: PurchaseOrderInvoice[];
  company: string;
  orderNumber: string;
};

const isPdf = (path: string) => path.toLowerCase().endsWith(".pdf");

const fileExtension = (path: string) => {
  const match = path.match(/\.([a-z0-9]{2,5})$/i);
  return match ? `.${match[1].toLowerCase()}` : "";
};

const invoiceLabel = (invoice: PurchaseOrderInvoice, index: number) =>
  invoice.invoice_number?.trim() || `Factura ${index + 1}`;

const InvoicePreviewDialog = ({
  open,
  onOpenChange,
  invoices,
  company,
  orderNumber,
}: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  // Si la lista se acorta (se eliminó una factura), el índice guardado puede
  // quedar fuera: se acota para que la pestaña resaltada sea la que se ve.
  const safeIndex = Math.min(activeIndex, Math.max(invoices.length - 1, 0));
  const active = invoices[safeIndex];

  if (!active) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        className="sm:max-w-4xl"
        icon={Receipt}
        lockOutside={false}
        title={`${invoices.length > 1 ? "Facturas" : "Factura"} — ${orderNumber}`}
        description={
          invoices.length > 1
            ? `${invoices.length} facturas adjuntas a la orden de compra.`
            : "Comprobante de pago adjunto a la orden de compra."
        }
      >
        <div className="space-y-4">
          {invoices.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {invoices.map((invoice, index) => (
                <Button
                  key={invoice.id}
                  type="button"
                  size="sm"
                  variant={index === safeIndex ? "default" : "outline"}
                  className={cn(
                    "h-8 px-3 text-[13px] max-sm:h-10",
                    index === safeIndex && "pointer-events-none",
                  )}
                  onClick={() => setActiveIndex(index)}
                >
                  {invoiceLabel(invoice, index)}
                </Button>
              ))}
            </div>
          )}

          <FileServer
            key={active.id}
            path={active.file_path}
            company={company}
            type="file"
          >
            {(url, isLoading, hasError) => (
              <>
                <div className="flex justify-center">
                  {isLoading ? (
                    <div className="flex h-[50vh] w-full items-center justify-center text-muted-foreground">
                      <Loader2 className="size-5 animate-spin" />
                    </div>
                  ) : hasError || !url ? (
                    <div className="flex h-[50vh] w-full items-center justify-center text-sm text-muted-foreground">
                      No se pudo cargar la factura.
                    </div>
                  ) : isPdf(active.file_path) ? (
                    <iframe
                      src={`${url}#toolbar=0&navpanes=0`}
                      className="h-[60vh] w-full rounded-lg border bg-background"
                      title="Factura"
                    />
                  ) : (
                    <div className="relative h-[60vh] w-full overflow-hidden rounded-lg border bg-muted/20">
                      <Image
                        src={url}
                        alt="Factura"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    asChild
                    variant="outline"
                    className="max-sm:h-10 max-sm:w-full"
                    disabled={!url || isLoading || hasError}
                  >
                    <a
                      href={url ?? "#"}
                      download={`Factura-${orderNumber}-${invoiceLabel(active, safeIndex)}${fileExtension(active.file_path)}`}
                    >
                      <Download className="mr-2 size-4" aria-hidden />
                      Descargar
                    </a>
                  </Button>
                </div>
              </>
            )}
          </FileServer>
        </div>
      </FormDialogContent>
    </Dialog>
  );
};

export default InvoicePreviewDialog;
