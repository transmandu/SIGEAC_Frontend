'use client'

import { useUpdateQuoteStatus } from "@/actions/mantenimiento/compras/cotizaciones/actions"
import { useUpdateRequisitionStatus } from "@/actions/mantenimiento/compras/requisiciones/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import { useCompanyStore } from "@/stores/CompanyStore"
import { Quote } from "@/types"
import { ClipboardCheck, ClipboardX, Loader2, MoreHorizontal, Minus } from "lucide-react"
import { useState } from "react"
import { Button } from "../../../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../ui/dialog"
import { useCreatePurchaseOrder } from "@/actions/mantenimiento/compras/ordenes_compras/actions"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const QuoteDropdownActions = ({ quote }: { quote: Quote }) => {
  const { user } = useAuth()
  const { selectedCompany } = useCompanyStore()
  const [openReject, setOpenReject] = useState(false)
  const [openApprove, setOpenApprove] = useState(false)
  const { updateStatusQuote } = useUpdateQuoteStatus()
  const { updateStatusRequisition } = useUpdateRequisitionStatus()
  const { createPurchaseOrder } = useCreatePurchaseOrder()

  const handleReject = async (id: number) => {
    const data = {
      status: "RECHAZADA",
      updated_by: `${user?.first_name} ${user?.last_name}`,
      company: selectedCompany!.slug
    }
    await updateStatusQuote.mutateAsync({ id, data, company: selectedCompany!.slug })
    await updateStatusRequisition.mutateAsync({
      id: quote.requisition_order.id,
      data: { status: "PROCESO", updated_by: `${user?.first_name} ${user?.last_name}` },
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
      quote_order_id: Number(quote.id),
    }
    const data = { status: "APROBADO", updated_by: `${user?.first_name} ${user?.last_name}`, company: selectedCompany!.slug }
    await updateStatusQuote.mutateAsync({ id, data, company: selectedCompany!.slug })
    await createPurchaseOrder.mutateAsync({ data: poData, company: selectedCompany!.slug })
    await updateStatusRequisition.mutateAsync({
      id: quote.requisition_order.id,
      data: { status: "APROBADO", updated_by: `${user?.first_name} ${user?.last_name}` },
      company: selectedCompany!.slug
    })
    setOpenApprove(false)
  }

  const isInactive = quote.status === "APROBADO" || quote.status === "RECHAZADA"

  return (
    <TooltipProvider>
      {isInactive ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 cursor-not-allowed">
              <span className="sr-only">No hay acciones disponibles</span>
              <Minus className="h-4 w-4 text-gray-300" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            No hay acciones disponibles para el estado actual de la cotización.
          </TooltipContent>
        </Tooltip>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="center" className="flex gap-2 justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DropdownMenuItem onClick={() => setOpenApprove(true)}>
                    <ClipboardCheck className='size-5 text-green-500' />
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              <TooltipContent>Aprobar cotización</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem onClick={() => setOpenReject(true)}>
                  <ClipboardX className='size-5 text-red-500' />
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>Rechazar cotización</TooltipContent>
            </Tooltip>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* DIALOGO RECHAZO */}
      <Dialog open={openReject} onOpenChange={setOpenReject}>
        <DialogContent className="max-w-md">
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            <div className="flex items-center justify-center size-12 rounded-full bg-orange-100 dark:bg-orange-900/30">
              <ClipboardX className="size-6 text-orange-600" />
            </div>
            <DialogTitle className="text-xl font-semibold">Rechazar cotización</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm max-w-sm">
              Esta acción marcará la cotización <span className="font-medium">{quote.quote_number}</span> como rechazada. Es irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpenReject(false)}>Cancelar</Button>
            <Button
              onClick={() => handleReject(Number(quote.id))}
              disabled={updateStatusQuote.isPending}
              className="flex items-center gap-2"
            >
              {updateStatusQuote.isPending && <Loader2 className="animate-spin size-4" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

  {/* DIALOGO APROBACION */}
  <Dialog open={openApprove} onOpenChange={setOpenApprove}>
    <DialogContent className="max-w-md">
      <DialogHeader className="flex flex-col items-center text-center space-y-3">
        <div className="flex items-center justify-center size-12 rounded-full bg-green-100 dark:bg-green-900/30">
          <ClipboardCheck className="size-6 text-green-600" />
        </div>
        <DialogTitle className="text-xl font-semibold">Aprobar cotización</DialogTitle>
        <DialogDescription className="text-muted-foreground text-sm max-w-sm">
          Esta acción aprobará la cotización <span className="font-medium">{quote.quote_number}</span> y generará la orden de compra correspondiente.
        </DialogDescription>
        <p className="text-sm text-red-600 mt-1 max-w-sm">
          ⚠️ Al aprobar esta cotización, las demás cotizaciones correspondientes a la misma requisición serán rechazadas automáticamente.
        </p>
      </DialogHeader>
      <DialogFooter className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => setOpenApprove(false)}>Cancelar</Button>
        <Button
          disabled={updateStatusQuote.isPending || createPurchaseOrder.isPending}
          onClick={() => handleApprove(Number(quote.id))}
          className="flex items-center gap-2"
        >
          {(updateStatusQuote.isPending || createPurchaseOrder.isPending) && <Loader2 className="animate-spin size-4" />}
          Confirmar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
    </TooltipProvider>
  )
}

export default QuoteDropdownActions