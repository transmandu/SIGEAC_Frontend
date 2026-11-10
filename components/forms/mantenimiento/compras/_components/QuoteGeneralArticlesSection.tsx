"use client";
import { locationName } from "@/lib/locations";
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
import { articleNeedsJustification } from "@/components/forms/mantenimiento/compras/CreateQuoteForm";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import { RetailerCombobox } from "@/components/forms/general/compras/_components/RetailerCombobox";
import { UnitCombobox } from "@/components/forms/general/compras/_components/UnitCombobox";
import { useGetGeneralArticlesPurchaseCatalog } from "@/hooks/mantenimiento/compras/useGetGeneralArticlesPurchaseCatalog";
import { useRef } from "react";
import { SuggestInput } from "./SuggestInput";
import { quoteInputClass, quoteTriggerClass } from "./quote-field";

interface LocationOption {
  id: number;
  address: string;
  name?: string | null;
  cod_iata?: string | null;
}

interface QuoteGeneralArticlesSectionProps {
  form: UseFormReturn<any>;
  units?: Unit[];
  locations?: LocationOption[];
  retailers?: Retailer[];
  /** Todo artículo general se compra por medio de un comercio — el campo "Lugar de compra" siempre aplica en ese flujo. Los formularios que no lo usan (p. ej. el aeronáutico) simplemente omiten esta prop. */
  showRetailerField?: boolean;
}

// ── Width scale shared across the operation rows ───────────────────────────
// Each column keeps the same width across both rows: Variante/Marca · Cantidad/Unidad · Precio unitario/Destino
const GRID_COLS = "grid-cols-2 sm:grid-cols-[2.2fr_1fr_1.3fr_1.5fr]";
const W_COMPACT = "w-full"; // Cantidad / Unidad
const W_WIDE = "w-full"; // Precio unitario / Ubicación

const LABEL_CLS = "select-none text-xs leading-none text-muted-foreground";

function normalizeQuantity(value: string, fallback: string): string {
  if (value === "") return fallback;
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return num.toFixed(2);
}

function normalize(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase();
}

// ── Marca / modelo: sugiere los del catálogo y su último costo ──────────────
interface BrandComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef: React.Ref<HTMLInputElement>;
  candidates: GeneralArticle[];
  disabled: boolean;
  invalid: boolean | string | undefined;
  onSelectCandidate: (article: GeneralArticle) => void;
  /** Recibe el precio que había sugerido la marca anterior. */
  onResetPrice: (suggestedPrice: string) => void;
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
  // Precio que puso la última sugerencia aplicada: solo ese se retira si la
  // marca deja de coincidir. Un precio que el usuario escribió a mano no se
  // toca al corregir la marca.
  const suggestedPrice = useRef<string | null>(null);

  const apply = (candidate: GeneralArticle) => {
    suggestedPrice.current =
      candidate.cost != null ? Number(candidate.cost).toFixed(2) : null;
    onSelectCandidate(candidate);
  };

  return (
    <SuggestInput
      value={value}
      onBlur={onBlur}
      inputRef={inputRef}
      disabled={disabled}
      invalid={invalid}
      suggestions={candidates.map((candidate) => ({
        key: candidate.id,
        label: candidate.brand_model ?? "Sin marca",
        hint:
          candidate.cost != null
            ? `Costo registrado: $${Number(candidate.cost).toFixed(2)}`
            : undefined,
      }))}
      onChange={(next) => {
        onChange(next);

        const exactMatch = candidates.find(
          (candidate) => normalize(candidate.brand_model) === normalize(next),
        );

        if (exactMatch) {
          apply(exactMatch);
        } else if (suggestedPrice.current !== null) {
          onResetPrice(suggestedPrice.current);
          suggestedPrice.current = null;
        }
      }}
      onPick={(suggestion) => {
        const candidate = candidates.find((item) => item.id === suggestion.key);
        if (candidate) apply(candidate);
      }}
    />
  );
}

// ── Presentación / especificación: texto libre con las ya usadas ────────────
function VariantCombobox({
  value,
  onChange,
  onBlur,
  inputRef,
  candidates,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef: React.Ref<HTMLInputElement>;
  candidates: string[];
  disabled: boolean;
}) {
  return (
    <SuggestInput
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      inputRef={inputRef}
      disabled={disabled}
      hideExactMatch
      suggestions={candidates.map((candidate) => ({
        key: candidate,
        label: candidate,
      }))}
      onPick={(suggestion) => onChange(suggestion.label)}
    />
  );
}
// ── Main section ───────────────────────────────────────────────────────────
export function QuoteGeneralArticlesSection({
  form,
  units,
  locations,
  retailers,
  showRetailerField = false,
}: QuoteGeneralArticlesSectionProps) {
  const { control } = form;

  const { fields } = useFieldArray({ control, name: "general_articles" });
  const generalArticles = useWatch({ control, name: "general_articles" });
  const { isSubmitted } = useFormState({ control });

  // El catálogo de compras trae el último costo, que sugiere el precio al
  // elegir una marca; el de los demás formularios no lo lleva.
  const { data: allGeneralArticles = [] } =
    useGetGeneralArticlesPurchaseCatalog();

  const invalidCls = (empty: boolean) =>
    isSubmitted && empty && "border-destructive/60 ring-1 ring-destructive/30";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground select-none">
          Artículos generales
        </span>
        <span className="text-xs text-muted-foreground tabular-nums select-none">
          {fields.length} {fields.length === 1 ? "ítem" : "ítems"}
        </span>
      </div>

      <ScrollArea
        className={cn("w-full", fields.length > 1 && "h-80 max-sm:h-auto")}
      >
        <div className="space-y-2">
          {fields.map((field, index) => {
            const article = generalArticles[index] ?? {};
            const isNotQuoted = !!article.not_quoted;
            const needsJustification = articleNeedsJustification(article);

            const quantityChanged =
              article.original_quantity !== undefined &&
              Number(article.quantity) !== Number(article.original_quantity);

            // Los del catálogo que coinciden en descripción y variante: se ofrecen
            // como alternativas de marca para esta fila.
            const brandCandidates = allGeneralArticles.filter(
              (a) =>
                normalize(a.description) === normalize(article.description) &&
                normalize(a.variant_type) === normalize(article.variant_type),
            );

            // Variantes ya usadas para esta misma descripción. Son solo
            // sugerencias, para evitar que un "500ml" contra "500 ml" cree una
            // entrada distinta en el catálogo.
            const variantCandidates = Array.from(
              new Map(
                allGeneralArticles
                  .filter(
                    (a) =>
                      normalize(a.description) ===
                        normalize(article.description) && a.variant_type,
                  )
                  .map((a) => [
                    normalize(a.variant_type),
                    a.variant_type as string,
                  ]),
              ).values(),
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
                          exit={{
                            opacity: 0,
                            scale: 1.4,
                            transition: { duration: 0.1 },
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 700,
                            damping: 18,
                            mass: 0.6,
                          }}
                          className="select-none whitespace-nowrap rounded border-2 border-red-500/50 px-4 py-1 text-xl font-extrabold text-red-500/50"
                        >
                          No cotizado
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
                          className="h-5 px-2 text-xs font-medium text-muted-foreground select-none"
                        >
                          General/Ferreteria
                        </Badge>
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              aria-label={
                                isNotQuoted
                                  ? "Incluir en la cotización"
                                  : "No cotizar este artículo"
                              }
                              aria-pressed={isNotQuoted}
                              onClick={() =>
                                form.setValue(
                                  `general_articles.${index}.not_quoted`,
                                  !isNotQuoted,
                                )
                              }
                              className={cn(
                                "z-20 shrink-0 rounded-md p-1 transition-colors max-sm:p-2.5",
                                isNotQuoted
                                  ? "bg-red-500/15 text-red-600"
                                  : "text-muted-foreground hover:bg-muted/60 hover:text-red-500",
                              )}
                            >
                              <Ban className="size-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isNotQuoted
                              ? "Incluir en la cotización"
                              : "No cotizar este artículo"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* BODY */}
                    <div className="relative px-3 py-2.5 sm:pr-24">
                      {/* ── TOTAL (fijo a la derecha, centrado verticalmente respecto al body) ── */}
                      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-end gap-0.5 max-sm:static max-sm:mb-2.5 max-sm:translate-y-0 max-sm:flex-row max-sm:items-baseline max-sm:justify-between">
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
                        <div className="space-y-0.5 max-sm:col-span-2">
                          <span className={LABEL_CLS}>
                            Present. / Especif.
                            {variantCandidates.length > 0 && (
                              <span className="ml-1.5 inline-flex items-center gap-0.5 text-xs text-primary select-none">
                                <Sparkles className="size-3" aria-hidden />
                                sugerencias
                              </span>
                            )}
                          </span>
                          <FormField
                            control={control}
                            name={`general_articles.${index}.variant_type`}
                            render={({ field }) => (
                              <VariantCombobox
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                inputRef={field.ref}
                                candidates={variantCandidates}
                                disabled={isNotQuoted}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-0.5">
                          <span className={LABEL_CLS}>
                            Cantidad
                            <RequiredIndicator />
                          </span>
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
                                  quoteInputClass,
                                  "text-center",
                                  quantityChanged &&
                                    "border-amber-500/60 bg-none bg-amber-50/70 dark:bg-amber-900/20",
                                  invalidCls(!isNotQuoted && !article.quantity),
                                )}
                                onChange={(e) => {
                                  let value = e.target.value;
                                  value = value.replace(/[^0-9.,]/g, "");
                                  value = value.replace(",", ".");
                                  const parts = value.split(".");
                                  if (parts.length > 2) {
                                    value =
                                      parts[0] + "." + parts.slice(1).join("");
                                  }
                                  if (value.includes(".")) {
                                    const [int, dec] = value.split(".");
                                    value = `${int}.${dec.slice(0, 2)}`;
                                  }
                                  field.onChange(value);
                                }}
                                onBlur={(e) => {
                                  field.onChange(
                                    normalizeQuantity(
                                      e.target.value,
                                      article.original_quantity ?? "",
                                    ),
                                  );
                                  field.onBlur();
                                }}
                              />
                            )}
                          />
                          {quantityChanged && (
                            <div className="flex items-center justify-center gap-1 text-xs text-amber-600 dark:text-amber-400">
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
                          <span className={LABEL_CLS}>
                            Precio unitario
                            <RequiredIndicator />
                          </span>
                          <FormField
                            control={control}
                            name={`general_articles.${index}.unit_price`}
                            render={({ field }) => (
                              <AmountInput
                                value={field.value}
                                onChange={field.onChange}
                                ref={field.ref}
                                disabled={isNotQuoted}
                                className={cn(
                                  W_WIDE,
                                  quoteInputClass,
                                  invalidCls(
                                    !isNotQuoted &&
                                      !(Number(article.unit_price) > 0),
                                  ),
                                )}
                              />
                            )}
                          />
                        </div>

                        <div />

                        {/* Fila 2: Marca/Modelo · Unidad · Destino */}
                        <div className="space-y-0.5 max-sm:col-span-2">
                          <span className={LABEL_CLS}>
                            Marca / Modelo
                            <RequiredIndicator />
                            {brandCandidates.length > 0 && (
                              <span className="ml-1.5 inline-flex items-center gap-0.5 text-xs text-primary select-none">
                                <Sparkles className="size-3" aria-hidden />
                                sugerencias
                              </span>
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
                                invalid={invalidCls(
                                  !isNotQuoted && !field.value,
                                )}
                                onSelectCandidate={(candidate) => {
                                  form.setValue(
                                    `general_articles.${index}.brand_model`,
                                    candidate.brand_model ?? "",
                                  );
                                  if (candidate.cost != null) {
                                    form.setValue(
                                      `general_articles.${index}.unit_price`,
                                      Number(candidate.cost).toFixed(2),
                                    );
                                  }
                                }}
                                onResetPrice={(suggested) => {
                                  const price = form.getValues(
                                    `general_articles.${index}.unit_price`,
                                  );
                                  // Solo se retira el precio que puso la
                                  // sugerencia; uno escrito a mano se conserva.
                                  if (Number(price) === Number(suggested)) {
                                    form.setValue(
                                      `general_articles.${index}.unit_price`,
                                      "0.00",
                                    );
                                  }
                                }}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-0.5 min-w-0">
                          <span className={LABEL_CLS}>
                            Unidad
                            <RequiredIndicator />
                          </span>
                          <UnitCombobox
                            value={article.unit?.toString() ?? ""}
                            onChange={(val) =>
                              form.setValue(
                                `general_articles.${index}.unit`,
                                val,
                              )
                            }
                            units={units}
                            disabled={isNotQuoted}
                            invalid={invalidCls(!isNotQuoted && !article.unit)}
                            triggerClassName={quoteTriggerClass}
                            placeholder="Sin unidad"
                          />
                        </div>

                        <div className="space-y-0.5">
                          <span className={LABEL_CLS}>
                            Destino
                            <RequiredIndicator />
                          </span>
                          <Select
                            value={article.location_id?.toString() ?? ""}
                            onValueChange={(val: string) =>
                              form.setValue(
                                `general_articles.${index}.location_id`,
                                val,
                              )
                            }
                            disabled={isNotQuoted}
                          >
                            <SelectTrigger
                              className={cn(
                                W_WIDE,
                                quoteTriggerClass,
                                !article.location_id && "text-muted-foreground",
                                invalidCls(
                                  !isNotQuoted && !article.location_id,
                                ),
                              )}
                            >
                              <span className="truncate">
                                {article.location_id
                                  ? locations?.find(
                                      (l) =>
                                        l.id.toString() === article.location_id,
                                    )?.address
                                  : "Sin ubicación"}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              {locations?.map((location) => (
                                <SelectItem
                                  key={location.id}
                                  value={location.id.toString()}
                                >
                                  {locationName(location)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {showRetailerField ? (
                          <div className="space-y-0.5 min-w-0">
                            <span className={LABEL_CLS}>
                              Lugar de compra
                              <RequiredIndicator />
                            </span>
                            <RetailerCombobox
                              value={article.retailer_id?.toString() ?? ""}
                              onChange={(val) =>
                                form.setValue(
                                  `general_articles.${index}.retailer_id`,
                                  val,
                                )
                              }
                              retailers={retailers}
                              disabled={isNotQuoted}
                              invalid={invalidCls(
                                !isNotQuoted && !article.retailer_id,
                              )}
                              triggerClassName={quoteTriggerClass}
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
                    <span className="select-none text-xs leading-none text-amber-700 dark:text-amber-400">
                      Justificación{" "}
                      {isNotQuoted ? "de exclusión" : "del cambio"}
                    </span>
                    <FormField
                      control={control}
                      name={`general_articles.${index}.quote_justification`}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Explique el motivo del cambio o la exclusión..."
                          className="mt-1 min-h-12.5 resize-none border-amber-500/40 bg-background/70 text-[13px] max-sm:text-base"
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
