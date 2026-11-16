"use client";
import { locationLabel } from "@/lib/locations";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ClipboardList, MessageSquareText } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  selectTriggerClass,
  textareaClass,
  triggerButtonClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { MarqueeBlockText } from "@/components/misc/MarqueeBlockText";
import type { Vendor } from "@/types";
import type { QuoteableRequisition } from "@/types/purchase/quote";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import {
  PanelFieldLabel,
  PanelSection,
  PanelStaticLabel,
} from "@/components/forms/PanelSection";
import { VendorCombobox } from "@/components/forms/general/compras/_components/VendorCombobox";

/**
 * Altura única de todos los controles del encabezado (fecha, destino,
 * proveedor y justificación): en escritorio conservan la métrica compacta de
 * la cotización —el formulario lleva muchos campos por artículo debajo— y en
 * móvil suben a 40 px para tocarlos bien. La justificación usa la misma para
 * que la franja se lea alineada con la de fecha y destino.
 */
const CONTROL_H = "h-9 max-sm:h-10";

const controlClass = cn(CONTROL_H, "text-sm max-sm:text-base");

interface LocationOption {
  id: number;
  address: string;
  name?: string | null;
  cod_iata?: string | null;
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
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
      <PanelSection
        icon={ClipboardList}
        title="Datos de cotización"
        hint="Información principal de la cotización"
        compact
        className="h-full"
      >
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="quote_date"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <PanelFieldLabel>
                    Fecha de cotización
                    <RequiredIndicator />
                  </PanelFieldLabel>

                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            triggerButtonClass,
                            controlClass,
                            "justify-start gap-2",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="size-4 opacity-60" />
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
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage className="mt-1.5" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <PanelFieldLabel>
                    Destino
                    <RequiredIndicator />
                  </PanelFieldLabel>

                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          selectTriggerClass,
                          controlClass,
                          "w-full",
                        )}
                      >
                        <SelectValue placeholder="Ubicación" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {locations?.map((location) => (
                        <SelectItem
                          key={location.id}
                          value={location.id.toString()}
                        >
                          {locationLabel(location, " — ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage className="mt-1.5" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="vendor_id"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <PanelFieldLabel>
                  Proveedor
                  <RequiredIndicator />
                </PanelFieldLabel>

                <FormControl>
                  <VendorCombobox
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    vendors={vendors}
                    disabled={isVendorsLoading}
                    triggerClassName={controlClass}
                  />
                </FormControl>

                <FormMessage className="mt-1.5" />
              </FormItem>
            )}
          />
        </div>
      </PanelSection>

      <PanelSection
        icon={MessageSquareText}
        title="Contexto de la cotización"
        hint="Información extra asociada"
        compact
        className="h-full"
      >
        <div className="flex flex-col gap-3">
          <div>
            <PanelStaticLabel>Justificación de la requisición</PanelStaticLabel>

            <div
              className={cn(
                CONTROL_H,
                "flex items-center overflow-hidden rounded-lg border border-slate-400/60 bg-background/70 px-3 dark:border-slate-600/60",
              )}
            >
              <MarqueeBlockText
                text={(req.justification || "Sin justificación").trim()}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="observation"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <PanelFieldLabel>Observación (opcional)</PanelFieldLabel>

                <FormControl>
                  <Textarea
                    placeholder="Comentario adicional para la cotización..."
                    rows={3}
                    className={cn(
                      textareaClass,
                      "min-h-18 text-sm max-sm:text-base",
                    )}
                    {...field}
                  />
                </FormControl>

                <FormMessage className="mt-1.5" />
              </FormItem>
            )}
          />
        </div>
      </PanelSection>
    </div>
  );
}
