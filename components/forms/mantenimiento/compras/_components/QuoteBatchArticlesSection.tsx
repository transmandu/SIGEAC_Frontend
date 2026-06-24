"use client";
import { Button } from "@/components/ui/button";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { Ban, ArrowRight, Clock } from "lucide-react";
import type { Condition, Unit, Vendor } from "@/types";
import { LEAD_TIME_UNITS, articleNeedsJustification } from "../CreateQuoteForm";
import { RequiredIndicator } from "./RequiredIndicator";

interface LocationOption {
  id: number;
  address: string;
  type: string;
}

interface QuoteBatchArticlesSectionProps {
  form: UseFormReturn<any>;
  units?: Unit[];
  vendors?: Vendor[];
  locations?: LocationOption[];
  conditions?: Condition[];
}

// ── Width scale shared across the operation rows ───────────────────────────
// Fractional columns keep the row within its parent's width instead of overflowing it.
const GRID_COLS = "grid-cols-[2.2fr_1fr_1.3fr_1.5fr_1.3fr]"; // P/N · Cantidad · Proveedor · Lead time · Precio unitario
const W_COMPACT = "w-full";  // Cantidad / Unidad
const W_MEDIUM = "w-full";   // Proveedor / Condición
const W_WIDE = "w-full";     // Lead time / Referencia / Precio unitario / Ubicación

const LABEL_CLS = "select-none text-[10px] leading-none text-muted-foreground uppercase";

function normalizeQuantity(value: string, fallback: string): string {
  if (value === "") return fallback;
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return num.toFixed(2);
}

export function QuoteBatchArticlesSection({
  form,
  units,
  vendors,
  locations,
  conditions,
}: QuoteBatchArticlesSectionProps) {
  const { control } = form;

  const { fields } = useFieldArray({ control, name: "articles" });
  const articles = useWatch({ control, name: "articles" });
  const { isSubmitted } = useFormState({ control });

  const invalidCls = (empty: boolean) =>
    isSubmitted && empty && "border-destructive/60 ring-1 ring-destructive/30";

  return (
    <div className="space-y-3">

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground select-none">Artículos</span>
        <span className="text-xs text-muted-foreground tabular-nums select-none">
          {fields.length} {fields.length === 1 ? "ítem" : "ítems"}
        </span>
      </div>

      <ScrollArea className={cn("w-full", fields.length > 1 && "h-[320px]")}>
        <div className="space-y-2">
          {fields.map((field, index) => {
            const article = articles[index] ?? {};
            const isNotQuoted = !!article.not_quoted;
            const needsJustification = articleNeedsJustification(article);

            const quantityChanged =
              article.original_quantity !== undefined &&
              Number(article.quantity) !== Number(article.original_quantity);

            const leadTimeLabel = article.lead_time_value
              ? `${article.lead_time_value} ${
                  LEAD_TIME_UNITS.find((u) => u.value === (article.lead_time_unit ?? "día"))?.label ?? ""
                }`
              : null;

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
                          {article.batch?.name || "Artículo"}
                        </span>

                        {article.batch?.category && (
                          <Badge
                            variant="secondary"
                            className="h-5 px-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground select-none"
                          >
                            {article.batch.category}
                          </Badge>
                        )}
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() =>
                                form.setValue(`articles.${index}.not_quoted`, !isNotQuoted)
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

                        {/* Fila 1: P/N · Cantidad · Proveedor · Lead time · Precio unitario */}
                          <div className="space-y-0.5">
                            <span className={LABEL_CLS}>Número de parte<RequiredIndicator /></span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] px-1.5 py-[2px] rounded-md bg-teal-500/10 text-teal-700 border border-teal-500/20 shrink-0 select-none">
                                P/N
                              </span>
                              <FormField
                                control={control}
                                name={`articles.${index}.part_number`}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    readOnly
                                    disabled={isNotQuoted}
                                    className="h-7 flex-1 min-w-0 text-sm bg-muted/40 border-border/50 font-medium text-foreground"
                                  />
                                )}
                              />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <span className={LABEL_CLS}>Cantidad<RequiredIndicator /></span>
                            <FormField
                              control={control}
                              name={`articles.${index}.quantity`}
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
                            <span className={LABEL_CLS}>Proveedor<RequiredIndicator /></span>
                            <Select
                              value={article.vendor_id?.toString() ?? ""}
                              onValueChange={(val: string) =>
                                form.setValue(`articles.${index}.vendor_id`, val)
                              }
                              disabled={isNotQuoted}
                            >
                              <SelectTrigger className={cn(
                                W_MEDIUM,
                                "h-7 text-xs",
                                !article.vendor_id && "text-muted-foreground",
                                invalidCls(!isNotQuoted && !article.vendor_id)
                              )}>
                                <span className="truncate">
                                  {article.vendor_id
                                    ? vendors?.find(v => v.id.toString() === article.vendor_id)?.name
                                    : "Sin proveedor"}
                                </span>
                              </SelectTrigger>
                              <SelectContent>
                                {vendors?.map((vendor) => (
                                  <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                    {vendor.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-0.5">
                            <span className={LABEL_CLS}>Lead time</span>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={isNotQuoted}
                                  className={cn(
                                    W_WIDE,
                                    "h-7 justify-start gap-1.5 px-2 text-xs font-normal bg-background/70",
                                    !leadTimeLabel && "text-muted-foreground"
                                  )}
                                >
                                  <Clock className="size-3 opacity-60 shrink-0" />
                                  <span className="truncate">{leadTimeLabel ?? "Sin definir"}</span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-56 p-3" align="start">
                                <div className="space-y-2">
                                  <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground select-none">
                                    Tiempo de entrega
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <FormField
                                      control={control}
                                      name={`articles.${index}.lead_time_value`}
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          type="text"
                                          placeholder="0"
                                          disabled={isNotQuoted}
                                          className="h-8 w-16 text-center text-sm"
                                          onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, "");
                                            field.onChange(value);
                                          }}
                                        />
                                      )}
                                    />
                                    <Select
                                      value={article.lead_time_unit ?? "día"}
                                      onValueChange={(val: string) =>
                                        form.setValue(`articles.${index}.lead_time_unit`, val)
                                      }
                                      disabled={isNotQuoted}
                                    >
                                      <SelectTrigger className="h-8 flex-1 text-xs">
                                        {LEAD_TIME_UNITS.find(u => u.value === (article.lead_time_unit ?? "día"))?.label}
                                      </SelectTrigger>
                                      <SelectContent>
                                        {LEAD_TIME_UNITS.map((unit) => (
                                          <SelectItem key={unit.value} value={unit.value}>
                                            {unit.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="space-y-0.5">
                            <span className={LABEL_CLS}>Precio unitario<RequiredIndicator /></span>
                            <FormField
                              control={control}
                              name={`articles.${index}.unit_price`}
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

                        {/* Fila 2: ALT P/N · Unidad · Condición · Referencia · Ubicación */}
                          <div className="space-y-0.5">
                            <span className={LABEL_CLS}>Número de parte alterno</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] px-1.5 py-[2px] rounded-md bg-slate-500/10 text-slate-600 border border-slate-500/20 shrink-0 select-none">
                                ALT
                              </span>
                              <FormField
                                control={control}
                                name={`articles.${index}.alt_part_number`}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    placeholder="N/A"
                                    disabled={isNotQuoted}
                                    className="h-7 flex-1 min-w-0 text-sm border-dashed text-muted-foreground"
                                  />
                                )}
                              />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <span className={LABEL_CLS}>Unidad<RequiredIndicator /></span>
                            <Select
                              value={article.unit?.toString() ?? ""}
                              onValueChange={(val: string) =>
                                form.setValue(`articles.${index}.unit`, val)
                              }
                              disabled={isNotQuoted}
                            >
                              <SelectTrigger className={cn(
                                W_COMPACT,
                                "h-7 text-xs",
                                !article.unit && "text-muted-foreground",
                                invalidCls(!isNotQuoted && !article.unit)
                              )}>
                                <span className="truncate">
                                  {article.unit
                                    ? units?.find(u => u.id.toString() === article.unit)?.label
                                    : "—"}
                                </span>
                              </SelectTrigger>
                              <SelectContent>
                                {units?.map((unit) => (
                                  <SelectItem key={unit.id} value={unit.id.toString()}>
                                    {unit.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-0.5">
                            <span className={LABEL_CLS}>Condición<RequiredIndicator /></span>
                            <Select
                              value={article.condition_id?.toString() ?? ""}
                              onValueChange={(val: string) =>
                                form.setValue(`articles.${index}.condition_id`, val)
                              }
                              disabled={isNotQuoted}
                            >
                              <SelectTrigger className={cn(
                                W_MEDIUM,
                                "h-7 text-xs",
                                !article.condition_id && "text-muted-foreground",
                                invalidCls(!isNotQuoted && !article.condition_id)
                              )}>
                                <span className="truncate">
                                  {article.condition_id
                                    ? conditions?.find(c => c.id.toString() === article.condition_id)?.name
                                    : "Sin condición"}
                                </span>
                              </SelectTrigger>
                              <SelectContent>
                                {conditions?.map((condition) => (
                                  <SelectItem key={condition.id} value={condition.id.toString()}>
                                    {condition.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-0.5">
                            <span className={LABEL_CLS}>Referencia</span>
                            <FormField
                              control={control}
                              name={`articles.${index}.reference`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="N/A"
                                  disabled={isNotQuoted}
                                  className={cn(W_WIDE, "h-7 text-xs")}
                                />
                              )}
                            />
                          </div>

                          <div className="space-y-0.5">
                            <span className={LABEL_CLS}>Destino<RequiredIndicator /></span>
                            <Select
                              value={article.location_id?.toString() ?? ""}
                              onValueChange={(val: string) =>
                                form.setValue(`articles.${index}.location_id`, val)
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
                      name={`articles.${index}.quote_justification`}
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
