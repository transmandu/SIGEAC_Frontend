"use client";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarqueeBlockText } from "@/components/misc/MarqueeBlockText";
import type { Vendor } from "@/types";
import type { QuoteableRequisition } from "@/types/purchase/quote";
import { RequiredIndicator } from "./RequiredIndicator";

interface LocationOption {
  id: number;
  address: string;
  type: string;
}

interface QuoteMetaSectionProps {
  form: UseFormReturn<any>;
  req: QuoteableRequisition;
  vendors?: Vendor[];
  isVendorsLoading: boolean;
  locations?: LocationOption[];
}

export function QuoteMetaSection({
  form,
  req,
  vendors,
  isVendorsLoading,
  locations,
}: QuoteMetaSectionProps) {
  const [openVendor, setOpenVendor] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">

      {/* ───────────── IZQUIERDA ───────────── */}
      <div className="h-full rounded-xl border bg-muted/15 overflow-hidden">

        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-1.5">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Datos de cotización
            </span>
            <span className="text-[11px] text-muted-foreground/70">
              Información principal de la cotización
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-3">

          {/* Fecha + Destino */}
          <div className="grid grid-cols-2 gap-3">

            {/* Fecha */}
            <FormField
              control={form.control}
              name="quote_date"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center gap-2 min-h-[16px] pb-1.5">
                    <FormLabel className="m-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Fecha de Cotización
                      <RequiredIndicator />
                    </FormLabel>
                    <div className="h-px flex-1 bg-border/60" />
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-9 w-full justify-start text-sm bg-background/70",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3 w-3 opacity-60" />
                          {field.value
                            ? format(field.value, "dd MMM yyyy", { locale: es })
                            : "Seleccionar"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        locale={es}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Destino */}
            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center gap-2 min-h-[16px] pb-1.5">
                    <FormLabel className="m-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Destino
                      <RequiredIndicator />
                    </FormLabel>
                    <div className="h-px flex-1 bg-border/60" />
                  </div>

                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 bg-background/70 text-sm">
                        <SelectValue placeholder="Ubicación" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {locations?.map((location) => (
                        <SelectItem key={location.id} value={location.id.toString()}>
                          {location.address} — {location.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Proveedor */}
          <FormField
            control={form.control}
            name="vendor_id"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div className="flex items-center gap-2 min-h-[16px] pb-1.5">
                  <FormLabel className="m-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Proveedor
                    <RequiredIndicator />
                  </FormLabel>
                  <div className="h-px flex-1 bg-border/60" />
                </div>

                <Popover open={openVendor} onOpenChange={setOpenVendor}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        disabled={isVendorsLoading}
                        className="h-9 w-full justify-between bg-background/70 text-sm"
                      >
                        {isVendorsLoading ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : field.value ? (
                          vendors?.find(v => v.id.toString() === field.value)?.name
                        ) : (
                          "Seleccionar proveedor"
                        )}
                        <ChevronsUpDown className="h-3 w-3 opacity-40" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>

                  <PopoverContent className="p-0" matchTriggerWidth>
                    <Command>
                      <CommandInput placeholder="Buscar proveedor..." />
                      <CommandList>
                        <CommandEmpty>Sin resultados</CommandEmpty>
                        <CommandGroup>
                          {vendors?.map((vendor) => (
                            <CommandItem
                              key={vendor.id}
                              value={vendor.name}
                              onSelect={() => {
                                form.setValue("vendor_id", vendor.id.toString());
                                setOpenVendor(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-3 w-3",
                                  vendor.id.toString() === field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {vendor.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* ───────────── DERECHA ───────────── */}
      <div className="h-full rounded-xl border bg-muted/15 overflow-hidden">

        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-1.5">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Contexto de la cotización
            </span>
            <span className="text-[11px] text-muted-foreground/70">
              Información extra asociada
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-3">

          {/* Justificación */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Justificación de la requisición
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            <div className="rounded-md border bg-background/70 px-3 py-2.5 overflow-hidden">
              <MarqueeBlockText
                text={(req.justification || "Sin justificación").trim()}
              />
            </div>
          </div>

          {/* Observación */}
          <FormField
            control={form.control}
            name="observation"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div className="flex items-center gap-2">
                  <FormLabel className="m-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Observación (opcional)
                  </FormLabel>
                  <div className="h-px flex-1 bg-border/60" />
                </div>

                <FormControl>
                  <Textarea
                    placeholder="Comentario adicional para la cotización..."
                    className="min-h-[72px] resize-none border bg-background/70 text-sm"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
