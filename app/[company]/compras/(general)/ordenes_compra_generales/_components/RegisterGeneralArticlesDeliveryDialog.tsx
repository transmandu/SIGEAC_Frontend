"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Check, Loader2, PackageCheck } from "lucide-react"

import { useRegisterGeneralArticlesDelivery } from "@/actions/mantenimiento/compras/ordenes_compras/actions"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { PurchaseOrder, PurchaseOrderGeneralArticle } from "@/types/purchase"

export default function RegisterGeneralArticlesDeliveryDialog({
  po,
  company,
  open,
  onOpenChange,
}: {
  po: PurchaseOrder
  company: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { registerGeneralArticlesDelivery } = useRegisterGeneralArticlesDelivery()

  const pendingItems = useMemo(
    () => (po.general_article_purchase_order ?? []).filter((item) => !item.general_article_intake),
    [po.general_article_purchase_order]
  )

  const [arrivedAt, setArrivedAt] = useState<Date>(() => new Date())
  const [selected, setSelected] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (!open) return
    setArrivedAt(new Date())
    setSelected(Object.fromEntries(pendingItems.map((item) => [item.id, true])))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const toggleItem = (id: number) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))

  const selectedIds = pendingItems.filter((item) => selected[item.id]).map((item) => item.id)
  const selectedCount = selectedIds.length
  const allSelected = selectedCount === pendingItems.length && pendingItems.length > 0

  const toggleAll = () => {
    const next = !allSelected
    setSelected(Object.fromEntries(pendingItems.map((item) => [item.id, next])))
  }

  const handleDateSelect = (day: Date | undefined) => {
    if (!day) return
    setArrivedAt((prev) => {
      const next = new Date(day)
      next.setHours(prev.getHours(), prev.getMinutes(), 0, 0)
      return next
    })
  }

  const handleTimeChange = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return
    setArrivedAt((prev) => {
      const next = new Date(prev)
      next.setHours(hours, minutes, 0, 0)
      return next
    })
  }

  const canSubmit = selectedCount > 0 && !registerGeneralArticlesDelivery.isPending

  const handleSubmit = () => {
    registerGeneralArticlesDelivery.mutate(
      {
        id: po.id,
        company,
        arrivedAt,
        generalArticlePurchaseOrderIds: selectedIds,
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="w-[95vw] max-w-[95vw] sm:max-w-[560px] p-0 overflow-hidden max-h-[85vh] flex flex-col"
      >
        {/* HEADER */}
        <DialogHeader className="shrink-0 border-b border-border/40 bg-muted/20 px-6 pt-5 pb-4 text-left">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 shrink-0 rounded-xl border border-[#439A97]/10 bg-[#439A97]/[0.08]">
              <PackageCheck className="size-4.5 text-[#2f716f] dark:text-[#6fc2bf]" />
            </div>

            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold tracking-tight leading-none">
                Registrar entrega de artículos
              </DialogTitle>

              <DialogDescription className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Confirma qué artículos generales de{" "}
                <span className="font-medium text-foreground">{po.order_number}</span> llegaron físicamente.
                Los que desmarques quedarán pendientes para una entrega posterior.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="overflow-y-auto px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={toggleAll}
              className="flex items-center gap-2 text-sm font-medium text-foreground select-none"
            >
              <div
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                  allSelected ? "border-[#439A97] bg-[#439A97] text-white" : "border-muted-foreground/30"
                )}
              >
                {allSelected && <Check className="size-3" />}
              </div>
              Artículos pendientes de entrega
            </button>

            <span className="text-xs text-muted-foreground tabular-nums select-none">
              {selectedCount} de {pendingItems.length} seleccionado{pendingItems.length === 1 ? "" : "s"}
            </span>
          </div>

          <ScrollArea className={cn("w-full", pendingItems.length > 6 && "h-[280px]")}>
            <div className="space-y-1.5 pr-1">
              {pendingItems.map((item) => (
                <ArticleRow
                  key={item.id}
                  item={item}
                  checked={selected[item.id] ?? false}
                  onToggle={() => toggleItem(item.id)}
                />
              ))}

              {pendingItems.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground italic">
                  No hay artículos generales pendientes de entrega.
                </p>
              )}
            </div>
          </ScrollArea>

          {/* Fecha y hora de llegada */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Fecha y hora de llegada
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 flex-1 justify-start text-sm bg-background/70",
                      !arrivedAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3 opacity-60" />
                    {format(arrivedAt, "dd MMM yyyy", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={arrivedAt}
                    onSelect={handleDateSelect}
                    locale={es}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Input
                type="time"
                value={format(arrivedAt, "HH:mm")}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="h-9 w-28 bg-background/70 text-sm"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="shrink-0 flex flex-row items-center justify-end gap-2 border-t border-border/40 bg-muted/20 px-6 py-4">
          <Button
            onClick={() => onOpenChange(false)}
            disabled={registerGeneralArticlesDelivery.isPending}
            className="
              h-10 rounded-lg px-5
              bg-slate-500/10 text-slate-600
              hover:bg-slate-500/20
              active:bg-slate-500/30
              border border-slate-500/20
              shadow-sm
              transition-colors
              dark:bg-slate-400/10
              dark:text-slate-300
              dark:hover:bg-slate-400/20
              dark:border-slate-400/20
            "
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="
              h-10 rounded-lg px-5
              bg-teal-500/20 text-teal-900
              hover:bg-teal-500/30
              active:bg-teal-500/40
              border border-teal-500/30
              shadow-sm
              transition-colors
              flex items-center justify-center gap-2
              dark:bg-teal-400/10
              dark:text-teal-100
              dark:hover:bg-teal-400/20
              dark:border-teal-400/20
            "
          >
            {registerGeneralArticlesDelivery.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <PackageCheck className="size-4" />
                Confirmar entrega
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const ArticleRow = ({
  item,
  checked,
  onToggle,
}: {
  item: PurchaseOrderGeneralArticle
  checked: boolean
  onToggle: () => void
}) => {
  const req = item.general_article_quote_order?.general_article_requisition_order
  const description = req?.description ?? "Artículo"
  const quantity = item.general_article_quote_order?.quantity

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
        checked
          ? "border-[#439A97]/40 bg-[#439A97]/[0.04]"
          : "border-border/60 bg-background/60 opacity-60"
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
            checked ? "border-[#439A97] bg-[#439A97] text-white" : "border-muted-foreground/30"
          )}
        >
          {checked && <Check className="size-3" />}
        </div>
        <span className="truncate text-sm font-medium text-foreground">{description}</span>
      </div>

      {quantity != null && (
        <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
          {quantity} unid.
        </span>
      )}
    </button>
  )
}
