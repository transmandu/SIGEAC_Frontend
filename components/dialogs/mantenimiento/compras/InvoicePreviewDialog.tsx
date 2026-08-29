"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { FileServer } from "@/components/misc/FileServer"
import { cn } from "@/lib/utils"
import type { PurchaseOrderInvoice } from "@/types/purchase"
import { Download, Loader2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoices: PurchaseOrderInvoice[]
  company: string
  orderNumber: string
}

const isPdf = (path: string) => path.toLowerCase().endsWith(".pdf")

const invoiceLabel = (invoice: PurchaseOrderInvoice, index: number) =>
  invoice.invoice_number?.trim() || `Factura ${index + 1}`

const InvoicePreviewDialog = ({ open, onOpenChange, invoices, company, orderNumber }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = invoices[activeIndex] ?? invoices[0]

  if (!active) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96vw] p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <DialogTitle>
            {invoices.length > 1 ? "Facturas" : "Factura"} — {orderNumber}
          </DialogTitle>
          <DialogDescription>
            {invoices.length > 1
              ? `${invoices.length} facturas adjuntas a la orden de compra.`
              : "Comprobante de pago adjunto a la orden de compra."}
          </DialogDescription>
        </DialogHeader>

        {invoices.length > 1 && (
          <div className="flex flex-wrap gap-1.5 border-b border-border/60 px-6 py-3">
            {invoices.map((invoice, index) => (
              <Button
                key={invoice.id}
                type="button"
                size="sm"
                variant={index === activeIndex ? "default" : "outline"}
                className={cn("h-7 px-3 text-xs", index === activeIndex && "pointer-events-none")}
                onClick={() => setActiveIndex(index)}
              >
                {invoiceLabel(invoice, index)}
              </Button>
            ))}
          </div>
        )}

        <FileServer key={active.id} path={active.file_path} company={company} type="file">
          {(url, isLoading, hasError) => (
            <>
              <ScrollArea className="max-h-[75vh]">
                <div className="flex justify-center p-4">
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
                      className="h-[70vh] w-full rounded-lg border bg-background"
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
              </ScrollArea>

              <div className="flex justify-end border-t border-border/60 px-6 py-3">
                <Button asChild variant="outline" size="sm" disabled={!url || isLoading || hasError}>
                  <a href={url ?? "#"} download={`Factura-${orderNumber}-${invoiceLabel(active, activeIndex)}`}>
                    <Download className="mr-2 size-4" />
                    Descargar
                  </a>
                </Button>
              </div>
            </>
          )}
        </FileServer>
      </DialogContent>
    </Dialog>
  )
}

export default InvoicePreviewDialog
