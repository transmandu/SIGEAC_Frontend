"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  Control,
  FieldErrors,
  UseFormReturn,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { format } from "date-fns";
import { toast } from "sonner";
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

/**
 * Propone "Control de <Tipo> <MATRÍCULA>" como título al elegir la aeronave.
 *
 * Es una sugerencia, no un valor impuesto: solo escribe si el campo está
 * vacío o si todavía tiene la sugerencia de la aeronave anterior, así un
 * título que el usuario escribió a mano nunca se pisa al cambiar de aeronave.
 * En edición arranca con el título ya guardado como "última sugerencia" solo
 * si coincide con la fórmula; si no, se respeta desde el primer render.
 */
export function useSuggestedControlTitle(
  form: UseFormReturn<any>,
  controlLabel: string,
) {
  const { control, setValue, getValues } = form;
  const { selectedCompany } = useCompanyStore();
  const { data: aircrafts } = useGetMaintenanceAircrafts(selectedCompany?.slug);
  const aircraftId = useWatch({ control, name: "aircraft_id" }) as string;

  const buildTitle = (acronym: string) =>
    `Control de ${controlLabel} ${acronym}`;

  // Se compara contra la fórmula, no contra la matrícula suelta: así el
  // título guardado de un control existente cuenta como sugerencia y se
  // actualiza al cambiar de aeronave, igual que uno recién generado.
  const lastSuggestion = useRef<string | null>(
    (() => {
      const current = (getValues("title") as string)?.trim();
      if (!current) return null;
      return /^Control de .+ \S+$/.test(current) ? current : null;
    })(),
  );

  useEffect(() => {
    const acronym = aircrafts?.find(
      (a) => String(a.id) === aircraftId,
    )?.acronym;
    if (!acronym) return;

    const current = ((getValues("title") as string) ?? "").trim();
    if (current && current !== lastSuggestion.current) return;

    const suggestion = buildTitle(acronym);
    if (current === suggestion) return;

    lastSuggestion.current = suggestion;
    setValue("title", suggestion, { shouldValidate: true, shouldDirty: true });
    // setValue/getValues no son estables en RHF; basta con reaccionar al
    // cambio de aeronave y a la llegada de la lista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aircraftId, aircrafts, controlLabel]);
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
 *
 * Con `follows`, el campo trae el valor escrito en vez de vacío y sigue al
 * general mientras nadie lo toque a mano: al mover el % del control se
 * actualizan las filas que aún tenían el valor heredado, y las editadas
 * quedan como están.
 */
export function RemainingPercentageField({
  control,
  name,
  follows = false,
}: {
  control: Control<any>;
  name: string;
  follows?: boolean;
}) {
  const { setValue, getValues } = useFormContext<any>();
  const controlPercentage = useWatch({ control, name: "remaining_percentage" });

  // Se compara contra el valor general anterior, no contra el actual: así se
  // distingue "quedó heredado" de "lo escribió el usuario, y da igual".
  const previousControlPercentage = useRef(controlPercentage);
  useEffect(() => {
    if (!follows) return;

    const previous = previousControlPercentage.current;
    previousControlPercentage.current = controlPercentage;
    if (previous === controlPercentage) return;

    const current = getValues(name);
    const wasInherited =
      current === undefined ||
      current === "" ||
      String(current) === String(previous);

    if (wasInherited) {
      // shouldDirty: en edición este campo termina con un valor distinto al
      // guardado, y el formulario exige motivo de corrección según isDirty.
      setValue(name, controlPercentage, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    // setValue/getValues no son estables en RHF.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlPercentage, follows, name]);

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

/** Valor centinela del select de conjunto: "Fuselaje" = la aeronave misma (aircraft_part_id null). */
export const FUSELAGE = "__fuselage__";

/**
 * `label` es el texto de una línea que usan los selects de conjunto padre;
 * `typeLabel`, `name` y `serial` son las mismas partes por separado, para las
 * tarjetas de selección de dos líneas (tipo arriba, identidad + serial
 * abajo) — dos partes del mismo tipo y modelo ("Motor 1", "Motor 2") solo se
 * distinguen por su serial.
 */
export type ParentOption = {
  id: string;
  label: string;
  typeLabel: string;
  name: string;
  serial?: string;
};

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
      { id: FUSELAGE, label: "Fuselaje", typeLabel: "", name: "Fuselaje" },
      ...parts.map((part) => {
        const type = (part.type ?? "").toUpperCase();
        counters[type] = (counters[type] ?? 0) + 1;
        const typeLabel = `${partTypeLabel(part.type)} ${counters[type]}`;
        return {
          id: String(part.id),
          // El select conserva el texto con serial que ya mostraba.
          label: `${typeLabel}${part.serial ? ` - ${part.serial}` : ""}`,
          typeLabel,
          name: part.part_name || part.part_number,
          serial: part.serial || undefined,
        };
      }),
    ];
  }, [aircrafts, aircraftId]);
}

type FirstError = { path: string; message: string };

function firstFieldError(
  node: unknown,
  path: string[] = [],
): FirstError | null {
  if (!node || typeof node !== "object") return null;
  const { message } = node as { message?: unknown };
  if (typeof message === "string" && message && path.length) {
    return { path: path.join("."), message };
  }
  for (const [key, child] of Object.entries(node)) {
    if (key === "ref" || key === "message" || key === "type") continue;
    const found = firstFieldError(child, [...path, key]);
    if (found) return found;
  }
  return null;
}

/**
 * Segundo argumento de `form.handleSubmit` en los formularios de control.
 * Son largos y con secciones de filas: un campo inválido suele quedar fuera de
 * pantalla, y sin esto "Guardar" parecía no hacer nada. Avisa, dice dónde y
 * lleva el foco al primer campo con error.
 */
export function notifyInvalidForm<T extends Record<string, any>>(
  form: UseFormReturn<T>,
) {
  return (errors: FieldErrors<T>) => {
    console.warn("[Formulario de control] Validación fallida:", errors);
    const first = firstFieldError(errors);
    toast.error("Faltan datos o hay valores inválidos", {
      description: first?.message ?? "Revise los campos marcados en rojo.",
    });
    if (first) {
      try {
        form.setFocus(first.path as never);
      } catch {
        // El campo no tiene un ref enfocable (selector, fecha): el mensaje del
        // toast y el texto en rojo bajo el campo bastan.
      }
    }
  };
}

const APPLICATION_KEYS = [
  "applied_date",
  "maintenance_provider_id",
  "action",
  "initial_value",
  "consumed_at_event",
];

/**
 * Si el usuario tocó algo de la APLICACIÓN vigente de un ítem existente
 * (fecha, quién la hizo, acción, lecturas). `dirty` es su rama de
 * `formState.dirtyFields`. Si no la tocó, el envío no la lleva y el backend
 * deja intacto el cumplimiento que ya tenía, en vez de reescribirlo con lo
 * mismo (o de exigir lecturas que ese cumplimiento nunca guardó).
 */
export function applicationEdited(dirty: unknown): boolean {
  if (!dirty || typeof dirty !== "object") return false;
  return Object.entries(dirty).some(([key, value]) =>
    APPLICATION_KEYS.includes(key)
      ? value === true || applicationEdited(value)
      : applicationEdited(value),
  );
}

/**
 * Quita del envío la aplicación de un ítem existente que el usuario no tocó
 * (ver applicationEdited). Lo nuevo y lo editado viaja completo.
 */
export function withoutUnchangedApplication<
  T extends {
    id?: number;
    applied_date?: string;
    intervals?: { initial_value?: number }[];
  },
>(item: T, dirty: unknown): T {
  if (item.id === undefined || applicationEdited(dirty)) return item;
  return {
    ...item,
    applied_date: undefined,
    intervals: item.intervals?.map((interval) => ({
      ...interval,
      initial_value: undefined,
    })),
  };
}

/** Rama `index` de una lista de `dirtyFields` (que son arrays de objetos). */
export function dirtyAt(list: unknown, index: number): unknown {
  return Array.isArray(list) ? list[index] : undefined;
}
