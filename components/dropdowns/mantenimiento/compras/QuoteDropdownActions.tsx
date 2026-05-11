"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { useAuth } from "@/contexts/AuthContext"
import { useCompanyStore } from "@/stores/CompanyStore"

import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ClipboardX,
  Loader2,
  Minus,
  MoreHorizontal,
  Truck
} from "lucide-react"

import { Quote } from "@/types"

import { useUpdateQuoteStatus } from "@/actions/mantenimiento/compras/cotizaciones/actions"
import { useUpdateRequisitionStatus } from "@/actions/mantenimiento/compras/requisiciones/actions"
import { useCreatePurchaseOrder } from "@/actions/mantenimiento/compras/ordenes_compras/actions"

const iconClass =
  "size-5 transition-transform duration-200 group-hover:rotate-[6deg] group-hover:scale-110"

const itemBase =
  "group flex items-center justify-center rounded-md p-2 transition-all duration-150 hover:bg-muted/60 active:scale-95"

const disabledClass =
  "opacity-40 grayscale pointer-events-none"

const QuoteDropdownActions = ({ quote }: { quote: Quote }) => {
  const { user } = useAuth()
  const { selectedCompany } = useCompanyStore()
  const router = useRouter()

  const [openReject, setOpenReject] = useState(false)
  const [openApprove, setOpenApprove] = useState(false)

  const { updateStatusQuote } = useUpdateQuoteStatus()
  const { updateStatusRequisition } = useUpdateRequisitionStatus()
  const { createPurchaseOrder } = useCreatePurchaseOrder()

  const isInactive =
    quote.status === "APROBADO" ||
    quote.status === "RECHAZADA"

  const isBusy =
    updateStatusQuote.isPending ||
    updateStatusRequisition.isPending ||
    createPurchaseOrder.isPending

  const canApprove = !isInactive
  const canReject = !isInactive

  const handleReject = async (id: number) => {
    await updateStatusQuote.mutateAsync({
      id,
      data: {
        status: "RECHAZADA",
        updated_by: `${user?.first_name} ${user?.last_name}`
      },
      company: selectedCompany!.slug
    })

    await updateStatusRequisition.mutateAsync({
      id: quote.requisition_order.id,
      data: {
        status: "PROCESO",
        updated_by: `${user?.first_name} ${user?.last_name}`
      },
      company: selectedCompany!.slug
    })

    setOpenReject(false)
  }

  const handleApprove = async (id: number) => {
    const poData = {
      status: "PROCESO",
      justification: quote.justification,
      purchase_date: new Date(),
      sub_total: Number(quote.total),
      total: Number(quote.total),
      vendor_id: Number(quote.vendor.id),
      created_by: `${user?.first_name} ${user?.last_name}`,
      articles_purchase_orders: quote.article_quote_order,
      quote_order_id: Number(quote.id)
    }

    await updateStatusQuote.mutateAsync({
      id,
      data: {
        status: "APROBADO",
        updated_by: `${user?.first_name} ${user?.last_name}`
      },
      company: selectedCompany!.slug
    })

    await createPurchaseOrder.mutateAsync({
      data: poData,
      company: selectedCompany!.slug
    })

    await updateStatusRequisition.mutateAsync({
      id: quote.requisition_order.id,
      data: {
        status: "APROBADO",
        updated_by: `${user?.first_name} ${user?.last_name}`
      },
      company: selectedCompany!.slug
    })

    setOpenApprove(false)
  }

  return (
    <TooltipProvider>

      {isInactive ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 cursor-not-allowed"
            >
              <Minus className="h-4 w-4 text-muted-foreground/30" />
            </Button>
          </TooltipTrigger>

          <TooltipContent>
            No hay acciones disponibles para el estado actual.
          </TooltipContent>
        </Tooltip>
      ) : (
        <DropdownMenu>

          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="center"
            className="
              flex gap-2 justify-center
              animate-in fade-in zoom-in-95
              duration-150
              rounded-lg border bg-background/95 backdrop-blur-sm
              shadow-lg p-2
              overflow-visible
              z-[999]
            "
          >

            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <DropdownMenuItem
                    asChild
                    disabled={!canApprove}
                    className="p-0"
                  >
                    <button
                      onClick={() => setOpenApprove(true)}
                      className={`${itemBase} text-emerald-600 ${!canApprove ? disabledClass : ""}`}
                    >
                      <ClipboardCheck className={iconClass} />
                    </button>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>

              <TooltipContent>Aprobar cotización</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <DropdownMenuItem
                    asChild
                    disabled={!canReject}
                    className="p-0"
                  >
                    <button
                      onClick={() => setOpenReject(true)}
                      className={`${itemBase} text-orange-500 ${!canReject ? disabledClass : ""}`}
                    >
                      <ClipboardX className={iconClass} />
                    </button>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>

              <TooltipContent>Rechazar cotización</TooltipContent>
            </Tooltip>

          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog open={openReject} onOpenChange={setOpenReject}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Rechazar cotización
            </DialogTitle>

            <p className="text-sm text-muted-foreground mt-1">
              Se marcará como rechazada la cotización{" "}
              <span className="font-mono">{quote.quote_number}</span>
            </p>
          </DialogHeader>

          <Separator />

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpenReject(false)}>
              Cancelar
            </Button>

            <Button
              variant="destructive"
              onClick={() => handleReject(Number(quote.id))}
              disabled={updateStatusQuote.isPending}
            >
              {updateStatusQuote.isPending ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                "Rechazar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openApprove} onOpenChange={setOpenApprove}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Aprobar cotización
            </DialogTitle>

            <p className="text-sm text-muted-foreground">
              Se generará una orden de compra automáticamente.
            </p>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpenApprove(false)}>
              Cancelar
            </Button>

            <Button
              onClick={() => handleApprove(Number(quote.id))}
              disabled={isBusy}
            >
              {isBusy ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                "Aprobar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </TooltipProvider>
  )
}

export default QuoteDropdownActions