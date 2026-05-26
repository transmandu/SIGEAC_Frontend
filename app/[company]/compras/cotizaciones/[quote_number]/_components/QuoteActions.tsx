"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCompanyStore } from "@/stores/CompanyStore"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ClipboardCheck, ClipboardX, Trash2, ExternalLink, FileDown } from "lucide-react"
import QuoteDropdownDialogs from "@/components/dialogs/mantenimiento/compras/QuoteDropdownDialogs"
import { Quote } from "@/types"
import { useGetPurchaseOrderByQuoteId } from "@/hooks/mantenimiento/compras/useGetPurchaseOrderByQuoteId"

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

export default function QuoteActions({
  quote,
  onSuccessUpdate
}: {
  quote: Quote
  onSuccessUpdate?: () => Promise<any>
}) {
  const router = useRouter()
  const { selectedCompany } = useCompanyStore()

  const [openApprove, setOpenApprove] = useState(false)
  const [openReject, setOpenReject] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const status = quote.status

  const isApproved = status === "APROBADO"
  const isRejected = status === "RECHAZADA"
  const isPending = status === "PENDIENTE"

  const canAct = isPending
  const canDelete = !isApproved

  /* =========================
     FETCH CONTROLADO
  ========================= */

  const shouldFetchPO =
    isApproved && !!selectedCompany?.slug && !!quote.id

  const {
    data: purchaseOrder,
    isFetching
  } = useGetPurchaseOrderByQuoteId({
    company: selectedCompany?.slug,
    quoteId: quote.id,
    enabled: shouldFetchPO
  })

  const handleGoToPO = () => {
    if (!purchaseOrder?.order_number || !selectedCompany) return

    router.push(
      `/${selectedCompany.slug}/compras/ordenes_compra/${purchaseOrder.order_number}`
    )
  }

  if (!selectedCompany) return null

  return (
    <TooltipProvider delayDuration={120}>
      <div className={toolbar}>

        {/* APPROVE */}
        {canAct && (
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
            <TooltipContent>Aprobar cotización</TooltipContent>
          </Tooltip>
        )}

        {/* REJECT */}
        {canAct && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenReject(true)}
                className={`${itemBase} text-orange-600`}
              >
                <ClipboardX className={iconBase} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rechazar cotización</TooltipContent>
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

        {/* DELETE */}
        {canDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenDelete(true)}
                className={`${itemBase} text-red-600`}
              >
                <Trash2 className={iconBase} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eliminar cotización</TooltipContent>
          </Tooltip>
        )}
        
        {/* PO LINK */}
        {isApproved && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!purchaseOrder?.order_number}
                onClick={handleGoToPO}
                className={`${itemBase} text-blue-600`}
              >
                <ExternalLink className={iconBase} />
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              {isFetching
                ? "Cargando..."
                : purchaseOrder?.order_number
                ? "Ver orden de compra"
                : "No existe orden de compra"}
            </TooltipContent>
          </Tooltip>
        )}

        {/* DIALOGS */}
        <QuoteDropdownDialogs
          quote={quote}
          openApprove={openApprove}
          setOpenApprove={setOpenApprove}
          openReject={openReject}
          setOpenReject={setOpenReject}
          openDelete={openDelete}
          setOpenDelete={setOpenDelete}
          onSuccessUpdate={onSuccessUpdate}
          onSuccessDelete={() => {
            router.push(`/${selectedCompany.slug}/compras/cotizaciones`)
            router.refresh()
          }}
        />

      </div>
    </TooltipProvider>
  )
}