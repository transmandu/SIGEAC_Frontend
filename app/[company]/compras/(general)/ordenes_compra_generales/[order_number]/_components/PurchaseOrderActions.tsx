"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ClipboardCheck, FileDown, Receipt, Wallet } from "lucide-react"
import PurchaseOrderDropdownDialogs from "@/components/dialogs/mantenimiento/compras/PurchaseOrderDropdownDialogs"
import InvoicePreviewDialog from "@/components/dialogs/mantenimiento/compras/InvoicePreviewDialog"
import { useCompanyStore } from "@/stores/CompanyStore"
import type { PurchaseOrder } from "@/types/purchase"

/* =========================
   STYLES
========================= */

const iconBase =
  "size-[20px] transition-all duration-200 ease-out group-hover:scale-110"

const itemBase =
  "group relative flex items-center justify-center size-11 rounded-full transition-all duration-200 " +
  "hover:bg-muted/60 hover:shadow-sm active:scale-95 " +
  "border border-transparent hover:border-border/40"

const toolbar =
  "flex items-center gap-1.5 px-2 py-1 rounded-full " +
  "bg-muted/30 border border-border/40 shadow-sm backdrop-blur-md " +
  "flex-wrap sm:flex-nowrap"

export default function PurchaseOrderActions({
  po,
}: {
  po: PurchaseOrder
}) {
  const { selectedCompany } = useCompanyStore()
  const [openApprove, setOpenApprove] = useState(false)
  const [openInvoice, setOpenInvoice] = useState(false)

  const canPay = po.status === "PENDIENTE"
  const canComplete = po.status === "PAGADA"
  const hasInvoice = !!po.invoice

  return (
    <TooltipProvider delayDuration={120}>
      <div className={toolbar}>

        {/* PAY */}
        {canPay && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenApprove(true)}
                className={`${itemBase} text-emerald-600`}
              >
                <Wallet className={iconBase} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pagar orden de compra</TooltipContent>
          </Tooltip>
        )}

        {/* COMPLETE */}
        {canComplete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenApprove(true)}
                className={`${itemBase} text-emerald-600`}
              >
                <ClipboardCheck className={iconBase} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Completar orden de compra</TooltipContent>
          </Tooltip>
        )}

        {/* VIEW INVOICE */}
        {hasInvoice && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenInvoice(true)}
                className={`${itemBase} text-amber-600`}
              >
                <Receipt className={iconBase} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver factura</TooltipContent>
          </Tooltip>
        )}

        {/* PDF DOWNLOAD (placeholder) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  console.log("PDF download not implemented yet")
                }}
                className={`${itemBase} text-blue-600`}
              >
                <FileDown className={iconBase} />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">
            ¡Próximamente!
          </TooltipContent>
        </Tooltip>

        {/* DIALOGS */}
        <PurchaseOrderDropdownDialogs
          po={po}
          openApprove={openApprove}
          setOpenApprove={setOpenApprove}
        />

        {hasInvoice && selectedCompany && (
          <InvoicePreviewDialog
            open={openInvoice}
            onOpenChange={setOpenInvoice}
            invoicePath={po.invoice!}
            company={selectedCompany.slug}
            orderNumber={po.order_number}
          />
        )}

      </div>
    </TooltipProvider>
  )
}
