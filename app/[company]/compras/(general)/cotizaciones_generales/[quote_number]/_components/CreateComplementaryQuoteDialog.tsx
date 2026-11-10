"use client";

import { PanelSection } from "@/components/forms/PanelSection";
import { useMemo, useState } from "react";
import {
  Check,
  Info,
  Loader2,
  MessageSquareText,
  Package,
  PackagePlus,
} from "lucide-react";

import { useCreateComplementaryQuote } from "@/actions/mantenimiento/compras/cotizaciones/actions";
import { AmountInput } from "@/components/misc/AmountInput";
import { TagBadge } from "@/components/misc/TagBadge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import {
  fieldClass,
  labelClass,
  textareaClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { NumericTextInput } from "@/components/forms/mantenimiento/almacen/_components/NumericInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Quote } from "@/types/purchase";

type ItemState = {
  included: boolean;
  quantity: string;
  unitPrice: string;
};

const formatMoney = (value: number) => `$${value.toFixed(2)}`;

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

  const hasJustification = justification.trim().length > 0;

  const canSubmit =
    selectedValid && hasJustification && !createComplementaryQuote.isPending;

  // Lo que falta para crearla, dicho una vez: el botón se deshabilita y esto
  // explica por qué.
  const blocker =
    selected.length === 0
      ? "Marque al menos un artículo."
      : !selectedValid
        ? "Indique la cantidad extra y el precio de cada artículo marcado."
        : !hasJustification
          ? "Escriba la justificación de la diferencia."
          : null;

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
                <PackagePlus className="size-4" />
              )}
              Crear complementaria
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <PanelSection
            icon={Package}
            title="Artículos de la cotización original"
            hint="Marque los que tuvieron diferencia."
            compact
            action={
              <TagBadge tone={selected.length > 0 ? "blue" : "slate"}>
                {selected.length} seleccionado
                {selected.length === 1 ? "" : "s"}
              </TagBadge>
            }
          >
            <div className="space-y-2.5">
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
                      "rounded-xl border transition-colors duration-200",
                      included
                        ? "border-primary/50 bg-primary/6"
                        : "border-slate-400/60 bg-background/40 hover:border-blue-400/40 dark:border-slate-600/60",
                    )}
                  >
                    <button
                      type="button"
                      aria-pressed={included}
                      onClick={() => toggleItem(item.id)}
                      className="flex w-full items-center gap-3 rounded-xl p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors duration-200",
                          included
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-slate-400/60 dark:border-slate-600/60",
                        )}
                      >
                        {included && <Check className="size-3.5" />}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium wrap-anywhere">
                          {description}
                        </span>
                        <span className="block text-[13px] text-muted-foreground">
                          Cotizado: {item.quantity} {item.unit?.label ?? ""} ·{" "}
                          {formatMoney(Number(item.unit_price))} c/u
                        </span>
                      </span>
                    </button>

                    {included && (
                      <div className="grid grid-cols-2 gap-3 border-t border-dashed border-slate-300/80 p-3 motion-safe:animate-reveal sm:grid-cols-3 dark:border-slate-600/60">
                        <div className="space-y-1.5">
                          <Label
                            className={labelClass}
                            htmlFor={`comp-qty-${item.id}`}
                          >
                            Cantidad extra
                          </Label>
                          <NumericTextInput
                            id={`comp-qty-${item.id}`}
                            value={state.quantity}
                            onValueChange={(value) =>
                              setItem(item.id, { quantity: value })
                            }
                            placeholder="0"
                            className="h-10 text-center max-sm:text-base"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label
                            className={labelClass}
                            htmlFor={`comp-price-${item.id}`}
                          >
                            Precio unitario
                          </Label>
                          <AmountInput
                            key={item.id}
                            defaultValue={state.unitPrice}
                            value={state.unitPrice}
                            onChange={(value) =>
                              setItem(item.id, { unitPrice: value ?? "" })
                            }
                            className={cn(fieldClass, "h-10")}
                          />
                        </div>

                        <div className="col-span-2 flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3.5 py-2.5 sm:col-span-1 sm:flex-col sm:items-start sm:justify-center sm:gap-0.5">
                          <span className="text-[13px] text-muted-foreground">
                            Total
                          </span>
                          <span className="font-mono text-base font-semibold tabular-nums">
                            {formatMoney(rowTotal)}
                          </span>
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

            {selected.length > 0 && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-muted/40 px-4 py-3 dark:border-slate-700/60">
                <span className="text-sm font-medium">
                  Total de la complementaria
                </span>
                <span className="font-mono text-lg font-semibold tabular-nums">
                  {formatMoney(total)}
                </span>
              </div>
            )}
          </PanelSection>

          <PanelSection
            icon={MessageSquareText}
            title={
              <>
                Justificación <span className="text-red-500">*</span>
              </>
            }
            hint="Por qué la compra superó lo cotizado."
            compact
          >
            <Textarea
              aria-label="Justificación"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Motivo de la diferencia..."
              rows={3}
              className={textareaClass}
              maxLength={2000}
            />
          </PanelSection>

          {blocker && (
            <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Info className="size-3.5 shrink-0" />
              {blocker}
            </p>
          )}
        </div>
      </FormDialogContent>
    </Dialog>
  );
}
