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
import { useRouter } from 'next/navigation'
import { Quote } from "@/types"
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
  Truck,
} from "lucide-react"
import { useState } from "react"
import { Button } from "../../../ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog"
import { Separator } from "../../../ui/separator"
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
  const router = useRouter()

  const handleReject = async (id: number) => {
    await updateStatusQuote.mutateAsync({
      id,
      data: {
        status: "RECHAZADA",
        updated_by: `${user?.first_name} ${user?.last_name}`,
      },
      company: selectedCompany!.slug,
    })
    await updateStatusRequisition.mutateAsync({
      id: quote.requisition_order.id,
      data: { status: "PROCESO", updated_by: `${user?.first_name} ${user?.last_name}` },
      company: selectedCompany!.slug,
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
    await updateStatusQuote.mutateAsync({
      id,
      data: { status: "APROBADO", updated_by: `${user?.first_name} ${user?.last_name}` },
      company: selectedCompany!.slug,
    })
    await createPurchaseOrder.mutateAsync({ data: poData, company: selectedCompany!.slug })
    await updateStatusRequisition.mutateAsync({
      id: quote.requisition_order.id,
      data: { status: "APROBADO", updated_by: `${user?.first_name} ${user?.last_name}` },
      company: selectedCompany!.slug,
    })
    setOpenApprove(false)
  }

  const isInactive = quote.status === "APROBADO" || quote.status === "RECHAZADA"
  const isApprovePending = updateStatusQuote.isPending || createPurchaseOrder.isPending || updateStatusRequisition.isPending

  return (
    <TooltipProvider>
      {isInactive ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 cursor-not-allowed">
              <span className="sr-only">No hay acciones disponibles</span>
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
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="center" className="flex gap-2 justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DropdownMenuItem onClick={() => setOpenApprove(true)}>
                    <ClipboardCheck className="size-5 text-amber-600 dark:text-amber-500" />
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              <TooltipContent>Aprobar cotización</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem onClick={() => setOpenReject(true)}>
                  <ClipboardX className="size-5 text-destructive" />
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>Rechazar cotización</TooltipContent>
            </Tooltip>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* ── Dialog: Rechazar ──────────────────────────────────────────── */}
      <Dialog open={openReject} onOpenChange={setOpenReject}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Rechazar cotización
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              La cotización <span className="font-mono font-medium text-foreground">{quote.quote_number}</span> será marcada como rechazada y la requisición volverá a estado <span className="font-medium text-foreground">PROCESO</span>.
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
              {updateStatusQuote.isPending
                ? <Loader2 className="animate-spin size-4" />
                : <><ClipboardX className="size-4 mr-2" />Rechazar</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Aprobar ───────────────────────────────────────────── */}
      <Dialog open={openApprove} onOpenChange={setOpenApprove}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-500 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold leading-tight">
                  Aprobar cotización
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  <span className="font-mono">{quote.quote_number}</span>
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-1">

            {/* Meta: proveedor + fecha */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border/50 bg-muted/20">
                <Truck className="size-3.5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Proveedor</p>
                  <p className="text-sm font-medium truncate">{quote.vendor.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border/50 bg-muted/20">
                <CalendarDays className="size-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Fecha</p>
                  <p className="text-sm font-medium">
                    {new Date(quote.quote_date).toLocaleDateString('es-ES', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Artículos */}
            <div className="space-y-0">
              {/* Cabecera de columnas */}
              <div className="grid grid-cols-[1fr_44px_80px_72px] gap-2 px-2 pb-1 border-b border-border/50">
                {['Parte / Alterno', 'Cant.', 'P. Unit.', 'Total'].map((h) => (
                  <span key={h} className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                    {h}
                  </span>
                ))}
              </div>

              {/* Filas */}
              <div className="max-h-[200px] overflow-y-auto">
                {quote.article_quote_order.map((article) => (
                  <div
                    key={article.article_part_number}
                    className="grid grid-cols-[1fr_44px_80px_72px] gap-2 items-start px-2 py-2 border-b border-border/20 last:border-0"
                  >
                    {/* PN Identity */}
                    <div className="space-y-1 min-w-0">
                      <div className="font-mono text-[11px] bg-muted/60 px-1.5 py-0.5 rounded border border-border/40 truncate tracking-wide">
                        {article.article_part_number}
                      </div>
                      {article.article_alt_part_number ? (
                        <div className="flex items-center gap-1">
                          <span className="shrink-0 text-[9px] font-mono font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-1 py-0.5 rounded tracking-widest select-none">
                            ALT
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground truncate">
                            {article.article_alt_part_number}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground/30 border border-dashed border-border/30 px-1 py-0.5 rounded">
                          ALT —
                        </span>
                      )}
                    </div>

                    {/* Cantidad */}
                    <div className="font-mono text-xs tabular-nums pt-0.5 text-center">
                      {article.quantity}
                    </div>

                    {/* Precio unitario */}
                    <div className="font-mono text-xs tabular-nums pt-0.5 text-right">
                      ${Number(article.unit_price).toFixed(2)}
                    </div>

                    {/* Total línea */}
                    <div className="font-mono text-xs tabular-nums font-semibold pt-0.5 text-right">
                      ${(article.quantity * Number(article.unit_price)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total general */}
            <div className="flex items-baseline justify-end gap-3 pt-1 border-t border-border/60">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total</span>
              <span className="font-mono text-lg font-bold tabular-nums">
                ${Number(quote.total).toFixed(2)}
              </span>
            </div>

            {/* Avisos */}
            <div className="space-y-1.5">
              <div className="flex items-start gap-2 px-3 py-2 rounded-md border border-border/40 bg-muted/20">
                <AlertCircle className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Se generará una <span className="font-medium text-foreground">orden de compra</span> automáticamente y la requisición asociada quedará marcada como aprobada.
                </p>
              </div>
              <div className="flex items-start gap-2 px-3 py-2 rounded-md border border-destructive/30 bg-destructive/5">
                <AlertTriangle className="size-3.5 text-destructive/70 shrink-0 mt-0.5" />
                <p className="text-xs text-destructive/80">
                  Las demás cotizaciones de la misma requisición serán rechazadas automáticamente.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button variant="outline" onClick={() => setOpenApprove(false)}>
              Cancelar
            </Button>
            <Button
              disabled={isApprovePending}
              onClick={() => handleApprove(Number(quote.id))}
              className=""
            >
              {isApprovePending ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                <>
                  <CheckCircle2 className="size-4 mr-2" />
                  Aprobar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

export default QuoteDropdownActions
