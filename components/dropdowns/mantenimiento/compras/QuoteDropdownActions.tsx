"use client"

import { useState } from "react"
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
import {
  ClipboardCheck,
  ClipboardX,
  Loader2,
  Minus,
  MoreHorizontal,
  Trash2
} from "lucide-react"
import { Quote } from "@/types"
import { useAuth } from "@/contexts/AuthContext"
import { useCompanyStore } from "@/stores/CompanyStore"
import { useDeleteQuote, useUpdateQuoteStatus } from "@/actions/mantenimiento/compras/cotizaciones/actions"
import { useUpdateRequisitionStatus } from "@/actions/mantenimiento/compras/requisiciones/actions"
import { useCreatePurchaseOrder } from "@/actions/mantenimiento/compras/ordenes_compras/actions"

import QuoteDropdownDialogs from "@/components/dialogs/mantenimiento/compras/QuoteDropdownDialogs"

const iconBase =
  "size-[18px] transition-all duration-200 ease-out group-hover:scale-110"

const itemBase = `
  group
  relative
  flex
  items-center
  justify-center
  size-9
  rounded-xl
  transition-all
  duration-200
  ease-out
  hover:bg-muted
  hover:shadow-sm
  active:scale-95
`

const disabledClass =
  "opacity-40 grayscale pointer-events-none cursor-not-allowed"

const QuoteDropdownActions = ({ quote }: { quote: Quote }) => {
  const { user } = useAuth()
  const { selectedCompany } = useCompanyStore()

  const [openDropdown, setOpenDropdown] = useState(false)
  const [openReject, setOpenReject] = useState(false)
  const [openApprove, setOpenApprove] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const { updateStatusQuote } = useUpdateQuoteStatus()
  const { updateStatusRequisition } = useUpdateRequisitionStatus()
  const { createPurchaseOrder } = useCreatePurchaseOrder()
  const { deleteQuote } = useDeleteQuote()

  const canDelete = quote.status === "PENDIENTE"

  const isInactive =
    quote.status === "APROBADO" ||
    quote.status === "RECHAZADA"

  const canAct = !isInactive

  const handleReject = async () => {
    await updateStatusQuote.mutateAsync({
      id: quote.id,
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

  const handleApprove = async () => {
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
      id: quote.id,
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
    <TooltipProvider delayDuration={120}>
      <>
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
        <DropdownMenu
          open={openDropdown}
          onOpenChange={setOpenDropdown}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="
                size-8
                rounded-xl
                border border-transparent
                transition-all duration-200
                hover:bg-muted/70
                hover:border-border/50
                hover:shadow-sm
                data-[state=open]:bg-muted
              "
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="center"
            sideOffset={3}
            className="
              flex items-center justify-center gap-1.5
              rounded-2xl
              border border-border/50
              bg-background/90
              backdrop-blur-xl
              shadow-xl
              p-1.5
              overflow-visible
              animate-in fade-in zoom-in-95 duration-200
            "
          >
            {/* APPROVE */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <DropdownMenuItem
                    asChild
                    className="p-0 focus:bg-transparent"
                    disabled={!canAct}
                  >
                    <button
                      onClick={() => {
                        setOpenDropdown(false)
                        setOpenApprove(true)
                      }}
                      className={`${itemBase} text-emerald-600 ${!canAct ? disabledClass : ""}`}
                    >
                      <ClipboardCheck className={iconBase} />
                    </button>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>

              <TooltipContent>Aprobar cotización</TooltipContent>
            </Tooltip>

            {/* REJECT */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <DropdownMenuItem
                    asChild
                    className="p-0 focus:bg-transparent"
                    disabled={!canAct}
                  >
                    <button
                      onClick={() => {
                        setOpenDropdown(false)
                        setOpenReject(true)
                      }}
                      className={`${itemBase} text-orange-600 ${!canAct ? disabledClass : ""}`}
                    >
                      <ClipboardX className={iconBase} />
                    </button>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>

              <TooltipContent>Rechazar cotización</TooltipContent>
            </Tooltip>
            {/* DELETE */}
            {canDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <DropdownMenuItem
                      asChild
                      className="p-0 focus:bg-transparent"
                    >
                      <button
                        onClick={() => {
                          setOpenDropdown(false)
                          setOpenDelete(true)
                        }}
                        className={`${itemBase} text-red-600`}
                      >
                        <Trash2 className={iconBase} />
                      </button>
                    </DropdownMenuItem>
                  </span>
                </TooltipTrigger>

                <TooltipContent>
                  Eliminar cotización
                </TooltipContent>
              </Tooltip>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        )}

        <QuoteDropdownDialogs
          quote={quote}
          openDelete={openDelete}
          setOpenDelete={setOpenDelete}
          openReject={openReject}
          setOpenReject={setOpenReject}
          openApprove={openApprove}
          setOpenApprove={setOpenApprove}
        />
      </>
    </TooltipProvider>
  )
}

export default QuoteDropdownActions