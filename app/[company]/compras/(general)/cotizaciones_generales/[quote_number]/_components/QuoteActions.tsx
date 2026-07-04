"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCompanyStore } from "@/stores/CompanyStore"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ClipboardCheck, ClipboardX, Trash2, FileDown } from "lucide-react"
import QuoteDropdownDialogs from "@/components/dialogs/mantenimiento/compras/QuoteDropdownDialogs"
import type { Quote } from "@/types/purchase"
import PurchaseOrderLinkButton from "@/components/dropdowns/mantenimiento/compras/PurchaseOrderLinkButton"

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

  const isApproved = status === "APPROVED"
  const isRejected = status === "REJECTED"
  const isPending = status === "PENDING"

  const canAct = isPending
  const canDelete = !isApproved

  const shouldFetchPO =
    isApproved && !!selectedCompany?.slug && !!quote.id

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
        {isApproved && selectedCompany?.slug && (
          <PurchaseOrderLinkButton
            company={selectedCompany.slug}
            quoteId={quote.id}
            enabled={shouldFetchPO}
            className={itemBase}
            iconClassName={iconBase}
          />
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
            router.push(`/${selectedCompany.slug}/compras/cotizaciones_generales`)
            router.refresh()
          }}
        />

      </div>
    </TooltipProvider>
  )
}