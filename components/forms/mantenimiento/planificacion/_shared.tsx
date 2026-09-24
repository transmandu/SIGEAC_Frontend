"use client";

import { useMemo } from "react";
import { Control, useFormContext, useWatch } from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { useGetMaintenanceProviders } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceProviders";
import { useGetCatalogManuals } from "@/hooks/mantenimiento/catalogo/useGetCatalogManuals";
import { MaintenanceAircraftPart } from "@/types";
import { partTypeLabel, partTypeRank } from "@/lib/maintenancePartTypes";
import { SearchableSelect, fieldClass, hintClass, labelClass } from "./_theme";

/**
 * Campos que comparten los formularios de Control de Mantenimiento y de
 * Control de Componentes — misma aeronave, mismos proveedores, mismo
 * catálogo de manuales, misma fecha compacta.
 */

export function AircraftSelect({
  control,
  name,
  excludeIds = [],
  hint = "Solo se listan las que aún no tienen un control.",
}: {
  control: Control<any>;
  name: string;
  excludeIds?: string[];
  hint?: string;
}) {
  const { selectedCompany } = useCompanyStore();
  const {
    data: aircrafts,
    isLoading,
    isError,
  } = useGetMaintenanceAircrafts(selectedCompany?.slug);

  // La aeronave actualmente seleccionada siempre puede mostrarse (por eso el
  // lookup usa la lista completa); solo se excluyen del desplegable las que
  // ya tienen otro control.
  const selectableAircrafts = useMemo(
    () =>
      (aircrafts ?? [])
        .filter((a) => !excludeIds.includes(String(a.id)))
        .map((a) => ({ ...a, name: a.acronym })),
    [aircrafts, excludeIds],
  );

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className={labelClass}>Aeronave</FormLabel>
          <SearchableSelect
            options={selectableAircrafts}
            value={field.value}
            loading={isLoading}
            disabled={isError}
            placeholder="Elige la aeronave..."
            searchPlaceholder="Busque una aeronave..."
            emptyLabel="No se ha encontrado ninguna aeronave."
            onSelect={(aircraft) => field.onChange(aircraft.id.toString())}
          />
          <FormDescription className={hintClass}>{hint}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Input de texto normal (sin flechitas ni scroll-cambia-el-valor de
// type="number") que solo deja escribir dígitos y un punto decimal.
export function NumericInput({
  value,
  onChange,
  onBlur,
  name,
  className,
  placeholder,
}: {
  value: unknown;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <Input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      className={className}
      name={name}
      value={(value as string) ?? ""}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
          onChange(raw);
        }
      }}
      onBlur={onBlur}
    />
  );
}

export function CompactDateField({
  control,
  name,
}: {
  control: Control<any>;
  name: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-0">
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    fieldClass,
                    "w-full justify-start px-2.5 font-normal hover:shadow-none",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-1.5 size-3.5 shrink-0 opacity-60" />
                  <span className="truncate">
                    {field.value ? format(field.value, "dd/MM/yy") : "Fecha"}
                  </span>
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden rounded-xl border-slate-400/60 p-0 shadow-lg dark:border-slate-600/60"
              align="start"
            >
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                captionLayout="dropdown"
                startMonth={new Date(1900, 0)}
                endMonth={new Date(new Date().getFullYear(), 11)}
                autoFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Umbral de alerta propio de una fila. Vacío hereda el porcentaje general del
 * control, que se muestra como placeholder.
 */
export function RemainingPercentageField({
  control,
  name,
}: {
  control: Control<any>;
  name: string;
}) {
  const controlPercentage = useWatch({ control, name: "remaining_percentage" });

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-0">
          <FormControl>
            <div className="relative">
              <NumericInput
                className={cn(fieldClass, "pr-6")}
                placeholder={
                  controlPercentage != null ? String(controlPercentage) : ""
                }
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                %
              </span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function ProviderSelect({
  control,
  name,
}: {
  control: Control<any>;
  name: string;
}) {
  const { selectedCompany } = useCompanyStore();
  const { data: providers, isLoading } = useGetMaintenanceProviders(
    selectedCompany?.slug,
  );
  const options = useMemo(() => providers ?? [], [providers]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="min-w-0 flex-1 space-y-0">
          <SearchableSelect
            options={options}
            value={field.value}
            loading={isLoading}
            placeholder="Seleccione..."
            searchPlaceholder="Buscar entidad..."
            emptyLabel="No se encontró ninguna entidad."
            onSelect={(provider) => field.onChange(String(provider.id))}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Elige un manual del catálogo y llena reference_manual con su nombre (sigue
 * editable a mano después) — el catálogo ayuda a llenar, nunca reemplaza el
 * texto libre. Espera los campos `maintenance_catalog_manual_id` y
 * `reference_manual` en el formulario que lo monta.
 */
export function CatalogManualField({
  control,
  aircraftId,
}: {
  control: Control<any>;
  aircraftId?: string;
}) {
  const { setValue } = useFormContext<any>();
  const { selectedCompany } = useCompanyStore();
  const manualId = useWatch({ control, name: "maintenance_catalog_manual_id" });
  const { data: manuals, isLoading } = useGetCatalogManuals(
    selectedCompany?.slug,
    {
      status: "ACTIVE",
      aircraftId,
    },
  );

  return (
    <FormItem className="w-full">
      <FormLabel className={labelClass}>Manual del Catálogo</FormLabel>
      <div className="flex items-center gap-1">
        <SearchableSelect
          options={manuals ?? []}
          value={manualId ? String(manualId) : undefined}
          loading={isLoading}
          placeholder="Elegir del catálogo (opcional)..."
          searchPlaceholder="Buscar manual..."
          emptyLabel={
            aircraftId
              ? "Ningún manual del catálogo tiene servicios asignados a esta aeronave."
              : "Seleccione primero una aeronave para filtrar."
          }
          onSelect={(manual) => {
            setValue("maintenance_catalog_manual_id", manual.id as number, {
              shouldValidate: true,
            });
            setValue("reference_manual", manual.name, { shouldValidate: true });
          }}
        />
        {manualId && (
          <TooltipProvider disableHoverableContent>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground/70 hover:text-destructive"
                  onClick={() =>
                    setValue("maintenance_catalog_manual_id", undefined, {
                      shouldValidate: true,
                    })
                  }
                >
                  <X className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Desvincular del catálogo (conserva el texto)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <FormDescription className={hintClass}>
        Si el manual está cargado en el catálogo del Sistema, el nombre y los
        servicios/certificados del selector se acotan a él.
      </FormDescription>
    </FormItem>
  );
}

/** Valor centinela del select de conjunto: "Fuselaje" = la aeronave misma (parent_aircraft_part_id null). */
export const FUSELAGE = "__fuselage__";

export type ParentOption = { id: string; label: string };

/**
 * "Fuselaje" más las partes asignadas a la aeronave, numeradas por tipo
 * ("Motor 1 - serial", "Motor 2 - serial") igual que en el Control de
 * Mantenimiento — el contador de la parte elegida es la referencia del cálculo.
 */
export function useParentOptions(aircraftId?: string): ParentOption[] {
  const { selectedCompany } = useCompanyStore();
  const { data: aircrafts } = useGetMaintenanceAircrafts(selectedCompany?.slug);

  return useMemo(() => {
    const aircraft = aircrafts?.find((a) => String(a.id) === aircraftId);
    const parts = (aircraft?.aircraft_assignments ?? [])
      .map((assignment) => assignment.aircraft_part)
      .filter((part): part is MaintenanceAircraftPart => !!part?.id)
      .sort((a, b) => partTypeRank(a.type) - partTypeRank(b.type));

    const counters: Record<string, number> = {};
    return [
      { id: FUSELAGE, label: "Fuselaje" },
      ...parts.map((part) => {
        const type = (part.type ?? "").toUpperCase();
        counters[type] = (counters[type] ?? 0) + 1;
        return {
          id: String(part.id),
          label: `${partTypeLabel(part.type)} ${counters[type]}${part.serial ? ` - ${part.serial}` : ""}`,
        };
      }),
    ];
  }, [aircrafts, aircraftId]);
}
