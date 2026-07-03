"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { UseFormReturn } from "react-hook-form";
import { useFieldArray, useFormState, useWatch } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AmountInput } from "@/components/misc/AmountInput";
import { Ban, ArrowRight, Sparkles } from "lucide-react";
import type { GeneralArticle, Retailer, Unit } from "@/types";
import { articleNeedsJustification } from "../CreateQuoteForm";
import { RequiredIndicator } from "./RequiredIndicator";
import { RetailerCombobox } from "@/components/forms/general/compras/_components/RetailerCombobox";
import { UnitCombobox } from "@/components/forms/general/compras/_components/UnitCombobox";
import { useGetGeneralArticles } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface LocationOption {
  id: number;
  address: string;
  type: string;
}

interface QuoteGeneralArticlesSectionProps {
  form: UseFormReturn<any>;
  units?: Unit[];
  locations?: LocationOption[];
  retailers?: Retailer[];
}

// ── Width scale shared across the operation rows ───────────────────────────
// Each column keeps the same width across both rows: Variante/Marca · Cantidad/Unidad · Precio unitario/Destino
const GRID_COLS = "grid-cols-[2.2fr_1fr_1.3fr_1.5fr]";
const W_COMPACT = "w-full";  // Cantidad / Unidad
const W_WIDE = "w-full";     // Precio unitario / Ubicación

const LABEL_CLS = "select-none text-[10px] leading-none text-muted-foreground uppercase";

function normalizeQuantity(value: string, fallback: string): string {
  if (value === "") return fallback;
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return num.toFixed(2);
}

function normalize(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase();
}

// ── Inline brand combobox ──────────────────────────────────────────────────
interface BrandComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef: React.Ref<HTMLInputElement>;
  candidates: GeneralArticle[];
  disabled: boolean;
  invalid: boolean | string | undefined;
  onSelectCandidate: (article: GeneralArticle) => void;
  onResetPrice: () => void;
}

function BrandCombobox({
  value,
  onChange,
  onBlur,
  inputRef,
  candidates,
  disabled,
  invalid,
  onSelectCandidate,
  onResetPrice,
}: BrandComboboxProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const filtered = candidates.filter((a) =>
    normalize(a.brand_model).includes(normalize(value))
  );

  const hasCandidates = candidates.length > 0;
  const showDropdown = open && !disabled && filtered.length > 0;

  // Recompute position whenever the dropdown opens or on scroll/resize
  useEffect(() => {
    if (!showDropdown || !anchorRef.current) return;

    function reposition() {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }

    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [showDropdown]);

  return (
    <div ref={anchorRef} className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          onChange(next);
          const exactMatch = candidates.find(
            (a) => normalize(a.brand_model) === normalize(next)
          );
          if (exactMatch) {
            onSelectCandidate(exactMatch);
          } else {
            onResetPrice();
          }
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // delay so mousedown on a dropdown item fires first
          setTimeout(() => {
            setOpen(false);
            onBlur();
          }, 150);
        }}
        placeholder="N/A"
        disabled={disabled}
        className={cn(
          "h-7 w-full text-sm",
          hasCandidates && "pr-6",
          invalid && "border-destructive/60 ring-1 ring-destructive/30"
        )}
      />
      {hasCandidates && (
        <Sparkles className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-violet-400 opacity-70" />
      )}

      {showDropdown && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            style={dropdownStyle}
            className="min-w-[160px] overflow-hidden rounded-md border border-border bg-popover shadow-md"
          >
            {filtered.map((a) => (
              <button
                key={a.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelectCandidate(a);
                  setOpen(false);
                }}
                className="flex w-full flex-col gap-0.5 px-2.5 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground"
              >
                <span className="font-medium leading-none">{a.brand_model ?? "Sin marca"}</span>
                {a.cost != null && (
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    Costo registrado: ${Number(a.cost).toFixed(2)}
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

// ── Main section ───────────────────────────────────────────────────────────
export function QuoteGeneralArticlesSection({
  form,
  units,
  locations,
  retailers,
}: QuoteGeneralArticlesSectionProps) {
  const { control } = form;

  const { fields } = useFieldArray({ control, name: "general_articles" });
  const generalArticles = useWatch({ control, name: "general_articles" });
  const { isSubmitted } = useFormState({ control });

  const { data: allGeneralArticles = [] } = useGetGeneralArticles();

  const invalidCls = (empty: boolean) =>
    isSubmitted && empty && "border-destructive/60 ring-1 ring-destructive/30";

  return (
    <div className="space-y-3">

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground select-none">Artículos generales</span>
        <span className="text-xs text-muted-foreground tabular-nums select-none">
          {fields.length} {fields.length === 1 ? "ítem" : "ítems"}
        </span>
      </div>

      <ScrollArea className={cn("w-full", fields.length > 1 && "h-[320px]")}>
        <div className="space-y-2">
          {fields.map((field, index) => {
            const article = generalArticles[index] ?? {};
            const isNotQuoted = !!article.not_quoted;
            const needsJustification = articleNeedsJustification(article);

            const quantityChanged =
              article.original_quantity !== undefined &&
              Number(article.quantity) !== Number(article.original_quantity);

            // Articles in the catalog that match this row's description + variant
            const brandCandidates = allGeneralArticles.filter(
              (a) =>
                normalize(a.description) === normalize(article.description) &&
                normalize(a.variant_type) === normalize(article.variant_type)
            );

            return (
              <div
                key={field.id}
                className="rounded-lg border border-border/60 bg-background/60 overflow-hidden"
              >
                {/* DISABLED OVERLAY (covers header + body only, not the justification field) */}
                <div className="relative">
                  <AnimatePresence>
                    {isNotQuoted && (
                      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
                        <motion.span
                          initial={{ opacity: 0, scale: 2.6, rotate: -12 }}
                          animate={{ opacity: 1, scale: 1, rotate: -12 }}
                          exit={{ opacity: 0, scale: 1.4, transition: { duration: 0.1 } }}
                          transition={{ type: "spring", stiffness: 700, damping: 18, mass: 0.6 }}
                          className="select-none whitespace-nowrap rounded border-2 border-red-500/50 px-4 py-1 text-xl font-extrabold uppercase tracking-widest text-red-500/50"
                        >
                          No Cotizado
                        </motion.span>
                      </div>
                    )}
                  </AnimatePresence>

                  <div className={cn(isNotQuoted && "opacity-40")}>
                    {/* HEADER */}
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-3 py-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate text-sm font-medium text-foreground select-none">
                          {article.description || "Artículo"}
                        </span>

                        <Badge
                          variant="secondary"
                          className="h-5 px-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground select-none"
                        >
                          General/Ferreteria
                        </Badge>
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() =>
                                form.setValue(`general_articles.${index}.not_quoted`, !isNotQuoted)
                              }
                              className={cn(
                                "z-20 shrink-0 rounded-md p-1 transition-colors",
                                isNotQuoted
                                  ? "bg-red-500/15 text-red-600"
                                  : "text-muted-foreground/60 hover:bg-muted/60 hover:text-red-500"
                              )}
                            >
                              <Ban className="size-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isNotQuoted ? "Incluir en la cotización" : "No cotizar este artículo"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* BODY */}
                    <div className="relative px-3 py-2.5 pr-24">

                      {/* ── TOTAL (fijo a la derecha, centrado verticalmente respecto al body) ── */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-end gap-0.5">
                        <span className={LABEL_CLS}>Total</span>
                        <span className="font-semibold tabular-nums leading-none">
                          $
                          {(
                            (Number(article.quantity) || 0) *
                            (Number(article.unit_price) || 0)
                          ).toFixed(2)}
                        </span>
                      </div>

                      <div className={cn("grid gap-x-3 gap-y-2.5", GRID_COLS)}>

                        {/* Fila 1: Variante · Cantidad · Precio unitario */}
                          <div className="space-y-0.5">
                            <span className={LABEL_CLS}>Presentación / Variante<RequiredIndicator /></span>
                            <FormField
                              control={control}
                              name={`general_articles.${index}.variant_type`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="N/A"
                                  disabled={isNotQuoted}
                                  className={cn("h-7 w-full text-sm", invalidCls(!isNotQuoted && !field.value))}
                                />
                              )}
                            />
                          </div>

                          <div className="space-y-0.5">
                            <span className={LABEL_CLS}>Cantidad<RequiredIndicator /></span>
                            <FormField
                              control={control}
                              name={`general_articles.${index}.quantity`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="text"
                                  disabled={isNotQuoted}
                                  className={cn(
                                    W_COMPACT,
                                    "h-7 text-center text-sm",
                                    quantityChanged &&
                                      "border-amber-500/60 bg-amber-50/70 dark:bg-amber-900/20",
                                    invalidCls(!isNotQuoted && !article.quantity)
                                  )}
                                  onChange={(e) => {
                                    let value = e.target.value;
                                    value = value.replace(/[^0-9.,]/g, "");
                                    value = value.replace(",", ".");
                                    const parts = value.split(".");
                                    if (parts.length > 2) {
                                      value = parts[0] + "." + parts.slice(1).join("");
                                    }
                                    if (value.includes(".")) {
                                      const [int, dec] = value.split(".");
                                      value = `${int}.${dec.slice(0, 2)}`;
                                    }
                                    field.onChange(value);
                                  }}
                                  onBlur={(e) => {
                                    field.onChange(
                                      normalizeQuantity(e.target.value, article.original_quantity ?? "")
                                    );
                                    field.onBlur();
                                  }}
                                />
                              )}
                            />
                            {quantityChanged && (
                              <div className="flex items-center justify-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                                <span className="tabular-nums line-through opacity-70">
                                  {article.original_quantity}
                                </span>
                                <ArrowRight className="size-2.5" />
                                <span className="tabular-nums font-medium">
                                  {article.quantity}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-0.5">
                            <span className={LABEL_CLS}>Precio unitario<RequiredIndicator /></span>
                            <FormField
                              control={control}
                              name={`general_articles.${index}.unit_price`}
                              render={({ field }) => (
                                <AmountInput
                                  value={field.value}
                                  onChange={field.onChange}
                                  ref={field.ref}
                                  disabled={isNotQuoted}
                                  className={cn(W_WIDE, "h-7 text-sm", invalidCls(!isNotQuoted && !article.unit_price))}
                                />
                              )}
                            />
                          </div>

                          <div />

                        {/* Fila 2: Marca/Modelo · Unidad · Destino */}
                          <div className="space-y-0.5">
                            <span className={LABEL_CLS}>
                              Marca / Modelo<RequiredIndicator />
                              {brandCandidates.length > 0 && (
                                <span className="ml-1 text-[9px] text-violet-500 select-none normal-case not-italic">sugerencias</span>
                              )}
                            </span>
                            <FormField
                              control={control}
                              name={`general_articles.${index}.brand_model`}
                              render={({ field }) => (
                                <BrandCombobox
                                  value={field.value ?? ""}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  inputRef={field.ref}
                                  candidates={brandCandidates}
                                  disabled={isNotQuoted}
                                  invalid={invalidCls(!isNotQuoted && !field.value)}
                                  onSelectCandidate={(candidate) => {
                                    form.setValue(`general_articles.${index}.brand_model`, candidate.brand_model ?? "");
                                    if (candidate.cost != null) {
                                      form.setValue(
                                        `general_articles.${index}.unit_price`,
                                        Number(candidate.cost).toFixed(2)
                                      );
                                    }
                                  }}
                                  onResetPrice={() =>
                                    form.setValue(`general_articles.${index}.unit_price`, "0.00")
                                  }
                                />
                              )}
                            />
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <span className={LABEL_CLS}>Unidad<RequiredIndicator /></span>
                            <UnitCombobox
                              value={article.unit?.toString() ?? ""}
                              onChange={(val) =>
                                form.setValue(`general_articles.${index}.unit`, val)
                              }
                              units={units}
                              disabled={isNotQuoted}
                              invalid={invalidCls(!isNotQuoted && !article.unit)}
                              triggerClassName="h-7 text-xs"
                              placeholder="—"
                            />
                          </div>

                          <div className="space-y-0.5">
                            <span className={LABEL_CLS}>Destino<RequiredIndicator /></span>
                            <Select
                              value={article.location_id?.toString() ?? ""}
                              onValueChange={(val: string) =>
                                form.setValue(`general_articles.${index}.location_id`, val)
                              }
                              disabled={isNotQuoted}
                            >
                              <SelectTrigger className={cn(
                                W_WIDE,
                                "h-7 text-xs",
                                !article.location_id && "text-muted-foreground",
                                invalidCls(!isNotQuoted && !article.location_id)
                              )}>
                                <span className="truncate">
                                  {article.location_id
                                    ? locations?.find(l => l.id.toString() === article.location_id)?.address
                                    : "Sin ubicación"}
                                </span>
                              </SelectTrigger>
                              <SelectContent>
                                {locations?.map((location) => (
                                  <SelectItem key={location.id} value={location.id.toString()}>
                                    {location.address}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {retailers ? (
                            <div className="space-y-0.5 min-w-0">
                              <span className={LABEL_CLS}>Lugar de compra<RequiredIndicator /></span>
                              <RetailerCombobox
                                value={article.retailer_id?.toString() ?? ""}
                                onChange={(val) =>
                                  form.setValue(`general_articles.${index}.retailer_id`, val)
                                }
                                retailers={retailers}
                                disabled={isNotQuoted}
                                invalid={invalidCls(!isNotQuoted && !article.retailer_id)}
                                triggerClassName="h-7 text-xs"
                                placeholder="Sin lugar de compra"
                                wrapOptions
                              />
                            </div>
                          ) : (
                            <div />
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* JUSTIFICACIÓN (solo si hay cambio de cantidad/unidad o exclusión) — siempre editable */}
                {needsJustification && (
                  <div className="border-t border-border/50 bg-amber-50/40 px-3 py-2 dark:bg-amber-900/10">
                    <span className="select-none text-[10px] leading-none text-amber-700 dark:text-amber-400 uppercase">
                      Justificación {isNotQuoted ? "de exclusión" : "del cambio"}
                    </span>
                    <FormField
                      control={control}
                      name={`general_articles.${index}.quote_justification`}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Explique el motivo del cambio o la exclusión..."
                          className="mt-1 min-h-[50px] resize-none border-amber-500/40 bg-background/70 text-sm"
                        />
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
