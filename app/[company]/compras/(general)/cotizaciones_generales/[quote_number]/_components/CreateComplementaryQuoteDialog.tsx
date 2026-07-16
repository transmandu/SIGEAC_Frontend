"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { Loader2, PackagePlus } from "lucide-react"

import { useCreateComplementaryQuote } from "@/actions/mantenimiento/compras/cotizaciones/actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { Quote } from "@/types/purchase"

type ItemState = {
  included: boolean
  quantity: string
  unitPrice: string
}

/**
 * Crea una cotización complementaria sobre una cotización general APROBADA:
 * documenta la diferencia entre lo realmente comprado y lo que la cadena
 * original amparaba (p. ej. llegaron 24 unidades y solo se cotizaron 6).
 * Los documentos ya pagados no se editan ni se borran — la diferencia
 * recorre su propio ciclo: aprobación → orden de compra → pago → entrega.
 */
export default function CreateComplementaryQuoteDialog({
  quote,
  company,
  open,
  onOpenChange,
  onSuccess,
}: {
  quote: Quote
  company: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => Promise<any> | void
}) {
  const { createComplementaryQuote } = useCreateComplementaryQuote()

  const quotedItems = useMemo(
    () => (quote.general_article_quote_order ?? []).filter((item) => !item.is_not_quoted),
    [quote.general_article_quote_order]
  )

  const [justification, setJustification] = useState("")
  const [items, setItems] = useState<Record<number, ItemState>>({})

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setJustification("")
      setItems(
        Object.fromEntries(
          quotedItems.map((item) => [
            item.id,
            { included: false, quantity: "", unitPrice: String(item.unit_price ?? "") },
          ])
        )
      )
    }
    onOpenChange(next)
  }

  const setItem = (id: number, patch: Partial<ItemState>) =>
    setItems((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))

  const selected = quotedItems.filter((item) => items[item.id]?.included)

  const selectedValid =
    selected.length > 0 &&
    selected.every((item) => {
      const state = items[item.id]
      return Number(state?.quantity) > 0 && Number(state?.unitPrice) > 0
    })

  const total = selected.reduce((acc, item) => {
    const state = items[item.id]
    const qty = Number(state?.quantity) || 0
    const price = Number(state?.unitPrice) || 0
    return acc + qty * price
  }, 0)

  const canSubmit = selectedValid && justification.trim().length > 0 && !createComplementaryQuote.isPending

  const handleSubmit = () => {
    createComplementaryQuote.mutate(
      {
        quoteId: quote.id,
        company,
        data: {
          quote_date: format(new Date(), "yyyy-MM-dd"),
          justification: justification.trim(),
          general_articles: selected.map((item) => ({
            general_article_quote_order_id: item.id,
            quantity: Number(items[item.id].quantity),
            unit_price: Number(items[item.id].unitPrice),
          })),
        },
      },
      {
        onSuccess: async () => {
          onOpenChange(false)
          await onSuccess?.()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="size-4 text-primary" />
            Cotización complementaria de {quote.quote_number}
          </DialogTitle>
          <DialogDescription>
            Documenta la cantidad comprada que la cotización original no amparaba. Indica solo la{" "}
            <span className="font-medium text-foreground">diferencia</span> por artículo (no el total
            recibido). La complementaria quedará pendiente de aprobación y generará su propia orden de
            compra y pago — los documentos originales no se modifican.
          </DialogDescription>
        </DialogHeader>

        {/* ── Ítems de la cotización original ─────────────────────────── */}
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {quotedItems.map((item) => {
            const state = items[item.id]
            const description = item.general_article_requisition_order?.description ?? "—"

            return (
              <div
                key={item.id}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-md border p-3 transition-colors",
                  state?.included ? "border-primary/40 bg-primary/5" : "border-border/60"
                )}
              >
                <Checkbox
                  checked={state?.included ?? false}
                  onCheckedChange={(checked) => setItem(item.id, { included: checked === true })}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{description}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.brand_model ? `${item.brand_model} · ` : ""}
                    Cotizado: {item.quantity} {item.unit?.label ?? ""} a {item.unit_price} c/u
                  </p>
                </div>

                {state?.included && (
                  <div className="flex items-center gap-2">
                    <div className="w-24">
                      <span className="text-[10px] font-medium uppercase text-muted-foreground">
                        Cant. extra
                      </span>
                      <Input
                        type="number"
                        min={0.01}
                        step="any"
                        value={state.quantity}
                        onChange={(e) => setItem(item.id, { quantity: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div className="w-28">
                      <span className="text-[10px] font-medium uppercase text-muted-foreground">
                        Precio unit.
                      </span>
                      <Input
                        type="number"
                        min={0.01}
                        step="any"
                        value={state.unitPrice}
                        onChange={(e) => setItem(item.id, { unitPrice: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {quotedItems.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              La cotización no tiene artículos generales cotizados.
            </p>
          )}
        </div>

        {/* ── Justificación ────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Justificación (obligatoria)
            </span>
            <div className="h-px flex-1 bg-border/60" />
          </div>
          <Textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Ej.: Se compraron 24 unidades en lugar de las 6 cotizadas por disponibilidad del proveedor; se documenta la diferencia de 18 unidades..."
            className="min-h-20 text-sm"
            maxLength={2000}
          />
        </div>

        <DialogFooter className="flex items-center gap-3 sm:justify-between">
          <span className="text-sm text-muted-foreground">
            Total complementario:{" "}
            <span className="font-semibold tabular-nums text-foreground">{total.toFixed(2)}</span>
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createComplementaryQuote.isPending}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {createComplementaryQuote.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Crear complementaria
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
