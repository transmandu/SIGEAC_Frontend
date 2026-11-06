"use client";

import { useMemo, useState } from "react";
import { Check, Link2, Loader2, PackagePlus } from "lucide-react";

import { useCreateComplementaryQuote } from "@/actions/mantenimiento/compras/cotizaciones/actions";
import { AmountInput } from "@/components/misc/AmountInput";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Quote } from "@/types/purchase";

type ItemState = {
  included: boolean;
  quantity: string;
  unitPrice: string;
};

const LABEL_CLS =
  "select-none text-xs leading-none text-muted-foreground";

/**
 * Crea una cotización complementaria sobre una cotización general APROBADA:
 * registra la diferencia entre lo realmente comprado y lo que la cadena
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
  quote: Quote;
  company: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => Promise<any> | void;
}) {
  const { createComplementaryQuote } = useCreateComplementaryQuote();

  const quotedItems = useMemo(
    () =>
      (quote.general_article_quote_order ?? []).filter(
        (item) => !item.is_not_quoted,
      ),
    [quote.general_article_quote_order],
  );

  const [justification, setJustification] = useState("");
  // Precarga cada ítem con su precio unitario original ya en el primer render
  // — si se poblara después, marcar el checkbox antes de que el estado exista
  // mostraría "0" en Precio unit. El call site remonta con key al abrir, así
  // que este inicializador corre de nuevo en cada apertura.
  const [items, setItems] = useState<Record<number, ItemState>>(() =>
    Object.fromEntries(
      quotedItems.map((item) => [
        item.id,
        {
          included: false,
          quantity: "",
          unitPrice: String(item.unit_price ?? ""),
        },
      ]),
    ),
  );

  const setItem = (id: number, patch: Partial<ItemState>) =>
    setItems((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const toggleItem = (id: number) =>
    setItem(id, { included: !items[id]?.included });

  const selected = quotedItems.filter((item) => items[item.id]?.included);

  const selectedValid =
    selected.length > 0 &&
    selected.every((item) => {
      const state = items[item.id];
      return Number(state?.quantity) > 0 && Number(state?.unitPrice) > 0;
    });

  const total = selected.reduce((acc, item) => {
    const state = items[item.id];
    const qty = Number(state?.quantity) || 0;
    const price = Number(state?.unitPrice) || 0;
    return acc + qty * price;
  }, 0);

  const canSubmit =
    selectedValid &&
    justification.trim().length > 0 &&
    !createComplementaryQuote.isPending;

  const handleSubmit = () => {
    createComplementaryQuote.mutate(
      {
        quoteId: quote.id,
        company,
        data: {
          // quote_date es dateTime: se manda el instante, no el dia suelto
          // (un "yyyy-MM-dd" se guarda como medianoche y pierde la hora real).
          quote_date: new Date().toISOString(),
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
          onOpenChange(false);
          await onSuccess?.();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        className="sm:max-w-180"
        icon={PackagePlus}
        title="Cotización complementaria"
        description={
          <>
            Registre la diferencia comprada que{" "}
            <span className="font-medium text-foreground">
              {quote.quote_number}
            </span>{" "}
            no amparaba. Indique solo la cantidad extra por artículo, no el
            total recibido.
          </>
        }
        footer={
          <>
            <div className="mr-auto flex items-center gap-2 rounded-md border border-slate-200/60 bg-white/80 px-3 py-1.5 dark:border-slate-700/60 dark:bg-slate-900/60">
              <Link2 className="size-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="font-mono text-sm font-semibold tabular-nums">
                ${total.toFixed(2)}
              </span>
            </div>

            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createComplementaryQuote.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="min-w-35 gap-2"
            >
              {createComplementaryQuote.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <PackagePlus className="size-4" />
                  Crear complementaria
                </>
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground select-none">
              Artículos de la cotización original
            </span>
            <span className="text-xs text-muted-foreground tabular-nums select-none">
              {selected.length} seleccionado{selected.length === 1 ? "" : "s"}
            </span>
          </div>

          <ScrollArea
            className={cn("w-full", quotedItems.length > 3 && "h-70")}
          >
            <div className="space-y-2 pr-1">
              {quotedItems.map((item) => {
                const state = items[item.id];
                const description =
                  item.general_article_requisition_order?.description ?? "—";
                const included = state?.included ?? false;
                const rowTotal =
                  (Number(state?.quantity) || 0) *
                  (Number(state?.unitPrice) || 0);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "rounded-lg border overflow-hidden transition-colors",
                      included
                        ? "border-primary/40 bg-primary/4"
                        : "border-border/60 bg-background/60",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className="flex w-full items-center justify-between gap-3 border-b border-border/50 bg-muted/25 px-3 py-1.5 text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                            included
                              ? "border-primary bg-primary text-white"
                              : "border-muted-foreground/30",
                          )}
                        >
                          {included && <Check className="size-3" />}
                        </div>
                        <span className="truncate text-sm font-medium text-foreground">
                          {description}
                        </span>
                      </div>

                      <span className="shrink-0 text-xs text-muted-foreground">
                        Cotizado: {item.quantity} {item.unit?.label ?? ""} · $
                        {Number(item.unit_price).toFixed(2)} c/u
                      </span>
                    </button>

                    {included && (
                      <div className="relative px-3 py-2.5 pr-24">
                        <div className="absolute right-3 bottom-2.5 flex flex-col items-end gap-0.5">
                          <span className={LABEL_CLS}>Total</span>
                          <span className="flex h-7 items-center font-semibold tabular-nums leading-none">
                            ${rowTotal.toFixed(2)}
                          </span>
                        </div>

                        <div className="grid grid-cols-[90px_110px] gap-x-3">
                          <div className="space-y-0.5">
                            <span className={LABEL_CLS}>Cant. extra</span>
                            <Input
                              type="text"
                              value={state.quantity}
                              onChange={(e) => {
                                const value = e.target.value.replace(
                                  /[^0-9.]/g,
                                  "",
                                );
                                setItem(item.id, { quantity: value });
                              }}
                              placeholder="0"
                              className="h-7 text-sm text-center"
                            />
                          </div>

                          <div className="space-y-0.5">
                            <span className={LABEL_CLS}>Precio unit.</span>
                            <AmountInput
                              key={item.id}
                              defaultValue={state.unitPrice}
                              value={state.unitPrice}
                              onChange={(value) =>
                                setItem(item.id, { unitPrice: value ?? "" })
                              }
                              className="h-7 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {quotedItems.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground italic">
                  La cotización no tiene artículos generales cotizados.
                </p>
              )}
            </div>
          </ScrollArea>

          {/* ── Justificación ── */}
          <div className="mx-auto w-full max-w-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Justificación<span className="ml-0.5 text-destructive">*</span>
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            <Textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Motivo de la diferencia..."
              className="min-h-18 resize-none border bg-background/70 text-sm"
              maxLength={2000}
            />
          </div>
        </div>
      </FormDialogContent>
    </Dialog>
  );
}
