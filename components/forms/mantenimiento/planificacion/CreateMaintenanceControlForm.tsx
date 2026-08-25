"use client";

import { useEffect, useMemo, useRef } from "react";
import { useForm, useFieldArray, useWatch, useFormContext, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { CalendarIcon, Loader2, Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { useGetMaintenanceProviders } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceProviders";
import { useGetMaintenanceControls } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceControls";
import {
  useCreateMaintenanceControl,
  useUpdateMaintenanceControl,
} from "@/actions/mantenimiento/planificacion/control_mantenimiento/actions";
import { CreateMaintenanceProviderDialog } from "@/components/dialogs/mantenimiento/planificacion/CreateMaintenanceProviderDialog";
import { MaintenanceAircraftPart, MaintenanceControl } from "@/types";

const countingMethodEnum = z.enum(["HOURS", "CYCLES", "DAYS"]);

// "" (input vacío) debe leerse como "no puesto todavía", no como 0 —
// si no, el chequeo de "obligatorio en horas/ciclos" de más abajo nunca
// dispara porque z.coerce.number() ya convirtió "" en 0.
const optionalNumeric = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.coerce.number().min(0).optional(),
);

const optionalInteger = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.coerce.number().int().min(0).optional(),
);

const baseItemSchema = z.object({
  // Presente solo al editar; permite al backend actualizar el mismo
  // registro en vez de recrearlo, para no perder su historial de
  // cumplimientos. Las filas nuevas (creadas en el formulario) no lo llevan.
  id: z.number().optional(),
  name: z.string().min(1, "Requerido"),
  counting_method: countingMethodEnum,
  limit_value: z.coerce.number().positive("Debe ser mayor a 0"),
  first_applied_date: z.date({ required_error: "Seleccione una fecha" }),
  // Lectura de horas/ciclos de la aeronave en la fecha de primera aplicación;
  // obligatoria solo cuando la unidad no es días (ver superRefine de abajo),
  // porque "próximo" en horas/ciclos se calcula desde acá, no de la fecha.
  first_applied_value: optionalNumeric,
  // Días extra sobre la frecuencia, solo relevante cuando la unidad es
  // días (no todos los certificados vencen justo a los N días); opcional.
  extra_days: optionalInteger,
});

// Los certificados son documentos a bordo: algunos sí llevan una entidad
// aeronáutica responsable y otros no, así que "Realizado por" va oculto
// detrás de un checkbox y es opcional (has_provider controla si se pide).
// Los servicios (de aeronave y de parte) siempre lo requieren.
const certificateSchema = baseItemSchema.extend({
  has_provider: z.boolean().optional(),
  maintenance_provider_id: z.string().optional(),
});

const itemSchema = baseItemSchema.extend({
  maintenance_provider_id: z.string().min(1, "Seleccione quién lo realiza"),
});

const partServiceSchema = itemSchema.extend({
  aircraft_part_id: z.string(),
});

const formSchema = z
  .object({
    aircraft_id: z.string().min(1, "Seleccione una aeronave"),
    title: z.string().min(1, "Ingrese un título"),
    description: z.string().optional(),
    has_reference_manual: z.boolean().default(false),
    reference_manual: z.string().optional(),
    remaining_percentage: z.coerce.number().min(0, "Debe ser ≥ 0").max(100, "Debe ser ≤ 100"),
    certificates: z.array(certificateSchema).default([]),
    services: z.array(itemSchema).default([]),
    selected_part_ids: z.array(z.string()).default([]),
    part_services: z.array(partServiceSchema).default([]),
  })
  .superRefine((vals, ctx) => {
    if (vals.has_reference_manual && !vals.reference_manual?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indique el manual de referencia",
        path: ["reference_manual"],
      });
    }

    vals.selected_part_ids.forEach((partId) => {
      const hasService = vals.part_services.some((s) => s.aircraft_part_id === partId);
      if (!hasService) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Agregue al menos un servicio para cada parte seleccionada",
          path: ["part_services"],
        });
      }
    });

    const requireInitialReading = (
      items: { counting_method: string; first_applied_value?: number }[],
      basePath: (string | number)[],
    ) => {
      items.forEach((item, index) => {
        if (item.counting_method !== "DAYS" && item.first_applied_value === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Indique las horas/ciclos que tenía la aeronave en la primera aplicación",
            path: [...basePath, index, "first_applied_value"],
          });
        }
      });
    };

    requireInitialReading(vals.certificates, ["certificates"]);
    requireInitialReading(vals.services, ["services"]);
    requireInitialReading(vals.part_services, ["part_services"]);

    vals.certificates.forEach((certificate, index) => {
      if (certificate.has_provider && !certificate.maintenance_provider_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Seleccione quién lo realiza",
          path: ["certificates", index, "maintenance_provider_id"],
        });
      }
    });
  });

type FormValues = z.infer<typeof formSchema>;

const emptyCertificate = () => ({
  name: "",
  counting_method: "HOURS" as const,
  limit_value: undefined as unknown as number,
  first_applied_date: undefined as unknown as Date,
  has_provider: false,
  maintenance_provider_id: "",
});

const emptyServiceItem = () => ({
  ...emptyCertificate(),
  maintenance_provider_id: "",
});

function AircraftSelect({
  control,
  name,
  excludeIds = [],
}: {
  control: Control<any>;
  name: string;
  excludeIds?: string[];
}) {
  const { selectedCompany } = useCompanyStore();
  const { data: aircrafts, isLoading, isError } = useGetMaintenanceAircrafts(selectedCompany?.slug);

  // La aeronave actualmente seleccionada siempre puede mostrarse (por eso el
  // lookup de abajo usa la lista completa); solo se excluyen del listado
  // desplegable las que ya tienen otro control de mantenimiento.
  const selectableAircrafts = useMemo(
    () => aircrafts?.filter((a) => !excludeIds.includes(String(a.id))) ?? [],
    [aircrafts, excludeIds],
  );

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-3">
          <FormLabel>Aeronave</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  disabled={isLoading || isError}
                  variant="outline"
                  role="combobox"
                  className={cn("justify-between", !field.value && "text-muted-foreground")}
                >
                  {isLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                  {field.value ? (
                    <p>{aircrafts?.find((a) => `${a.id}` === field.value)?.acronym}</p>
                  ) : (
                    "Elige la aeronave..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Busque una aeronave..." />
                <CommandList>
                  <CommandEmpty className="text-sm p-2 text-center">
                    No se ha encontrado ninguna aeronave.
                  </CommandEmpty>
                  <CommandGroup>
                    {selectableAircrafts.map((aircraft) => (
                      <CommandItem
                        value={`${aircraft.id}`}
                        key={aircraft.id}
                        onSelect={() => field.onChange(aircraft.id.toString())}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            `${aircraft.id}` === field.value ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <p>{aircraft.acronym}</p>
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
  );
}

function DateField({ control, name }: { control: Control<any>; name: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "h-8 w-full justify-start text-left text-sm font-normal px-2",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  {field.value ? format(field.value, "dd/MM/yy", { locale: es }) : <span>Sel.</span>}
                  <CalendarIcon className="ml-auto h-3.5 w-3.5 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                captionLayout="dropdown-buttons"
                fromYear={1900}
                toYear={new Date().getFullYear()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Input de texto normal (sin flechitas ni scroll-cambia-el-valor de
// type="number") que solo deja escribir dígitos y un punto decimal.
function NumericInput({
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

function ProviderField({ control, name }: { control: Control<any>; name: string }) {
  const { selectedCompany } = useCompanyStore();
  const { data: providers, isLoading } = useGetMaintenanceProviders(selectedCompany?.slug);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {/* Radix reserva "" para volver al placeholder: pasarlo como valor
              controlado remonta el content en bucle. Va undefined. */}
          <Select onValueChange={field.onChange} value={field.value || undefined}>
            <FormControl>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder={isLoading ? "Cargando..." : "Realizado por"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {providers?.map((provider) => (
                <SelectItem key={provider.id} value={String(provider.id)}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

const ROW_GRID = "grid-cols-[1fr_90px_70px_90px_90px_130px_150px_28px]";
const ROW_LABELS = [
  "Nombre",
  "Unidad",
  "Límite",
  "Lectura Inicial",
  "Días Extra",
  "1ra Fecha Aplicada",
  "Realizado Por",
];

type ProviderMode = "required" | "optional";

function ItemRowsHeader() {
  return (
    <div className={cn("grid gap-3 px-1", ROW_GRID)}>
      {ROW_LABELS.map((label) => (
        <span key={label} className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
          {label}
        </span>
      ))}
      <span />
    </div>
  );
}

// Los certificados no siempre tienen una entidad aeronáutica responsable
// (algunos sí, otros no), así que va oculto detrás de un checkbox en vez de
// pedirse siempre como en los servicios.
function OptionalProviderCell({ control, namePrefix }: { control: Control<any>; namePrefix: string }) {
  return (
    <FormField
      control={control}
      name={`${namePrefix}.has_provider`}
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <div className="flex h-8 items-center gap-1.5">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-3.5 w-3.5" />
            </FormControl>
            <span className="text-xs text-muted-foreground">Entidad</span>
          </div>
          {field.value && <ProviderField control={control} name={`${namePrefix}.maintenance_provider_id`} />}
        </FormItem>
      )}
    />
  );
}

function ItemRow({
  control,
  namePrefix,
  onRemove,
  providerMode = "required",
}: {
  control: Control<any>;
  namePrefix: string;
  onRemove: () => void;
  providerMode?: ProviderMode;
}) {
  const countingMethod = useWatch({ control, name: `${namePrefix}.counting_method` });
  const needsInitialReading = countingMethod && countingMethod !== "DAYS";
  const isDaysBased = countingMethod === "DAYS";

  return (
    <div className={cn("grid gap-3 items-start", ROW_GRID)}>
      <FormField
        control={control}
        name={`${namePrefix}.name`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="EJ: Certificado de Aeronavegabilidad" className="h-8 text-sm" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${namePrefix}.counting_method`}
        render={({ field }) => (
          <FormItem>
            <Select onValueChange={field.onChange} value={field.value || undefined}>
              <FormControl>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Unidad" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="HOURS">Horas</SelectItem>
                <SelectItem value="CYCLES">Ciclos</SelectItem>
                <SelectItem value="DAYS">Días</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${namePrefix}.limit_value`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <NumericInput
                placeholder="0"
                className="h-8 text-sm"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${namePrefix}.first_applied_value`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              {needsInitialReading ? (
                <NumericInput
                  placeholder="0"
                  className="h-8 text-sm"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              ) : (
                <div className="flex h-8 items-center justify-center text-xs text-muted-foreground">—</div>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${namePrefix}.extra_days`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              {isDaysBased ? (
                <NumericInput
                  placeholder="0"
                  className="h-8 text-sm"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              ) : (
                <div className="flex h-8 items-center justify-center text-xs text-muted-foreground">—</div>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <DateField control={control} name={`${namePrefix}.first_applied_date`} />
      {providerMode === "required" ? (
        <ProviderField control={control} name={`${namePrefix}.maintenance_provider_id`} />
      ) : (
        <OptionalProviderCell control={control} namePrefix={namePrefix} />
      )}
      <div className="flex items-center pt-0.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function MaintenanceItemRows({
  control,
  name,
  emptyLabel,
  providerMode = "required",
  createEmptyRow,
}: {
  control: Control<any>;
  name: string;
  emptyLabel: string;
  providerMode?: ProviderMode;
  createEmptyRow: () => Record<string, unknown>;
}) {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="space-y-3">
      {fields.length > 0 && <ItemRowsHeader />}
      {fields.map((field, index) => (
        <ItemRow
          key={field.id}
          control={control}
          namePrefix={`${name}.${index}`}
          onRemove={() => remove(index)}
          providerMode={providerMode}
        />
      ))}
      {fields.length === 0 && <p className="text-xs text-muted-foreground">{emptyLabel}</p>}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append(createEmptyRow())}
        className="h-7 gap-1 text-xs"
      >
        <Plus className="size-3.5" />
        Agregar fila
      </Button>
    </div>
  );
}

function PartServiceRows({
  control,
  rows,
  onAdd,
  onRemove,
  emptyLabel,
}: {
  control: Control<any>;
  rows: { id: string; index: number }[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  emptyLabel: string;
}) {
  return (
    <div className="space-y-3">
      {rows.length > 0 && <ItemRowsHeader />}
      {rows.map(({ id, index }) => (
        <ItemRow
          key={id}
          control={control}
          namePrefix={`part_services.${index}`}
          onRemove={() => onRemove(index)}
        />
      ))}
      {rows.length === 0 && <p className="text-xs text-muted-foreground">{emptyLabel}</p>}
      <Button type="button" variant="outline" size="sm" onClick={onAdd} className="h-7 gap-1 text-xs">
        <Plus className="size-3.5" />
        Agregar fila
      </Button>
    </div>
  );
}

// Orden fijo requerido para el listado de partes: motor, turbina, hélice,
// apu; cualquier otro type (ej. "Tren de aterrizaje") queda al final.
const PART_TYPE_ORDER: Record<string, number> = {
  MOTOR: 0,
  TURBINA: 1,
  HELICE: 2,
  APU: 3,
};

const PART_TYPE_LABELS: Record<string, string> = {
  MOTOR: "Motor",
  TURBINA: "Turbina",
  HELICE: "Hélice",
  APU: "APU",
};

function partTypeRank(type?: string): number {
  return PART_TYPE_ORDER[(type ?? "").toUpperCase()] ?? 99;
}

function partTypeLabel(type?: string): string {
  return PART_TYPE_LABELS[(type ?? "").toUpperCase()] ?? type ?? "Otro";
}

function PartsSection({ control }: { control: Control<any> }) {
  const { setValue } = useFormContext<FormValues>();
  const { selectedCompany } = useCompanyStore();
  const { data: aircrafts, isLoading } = useGetMaintenanceAircrafts(selectedCompany?.slug);
  const { fields, append, remove, replace } = useFieldArray({ control, name: "part_services" });

  const aircraftId = useWatch({ control, name: "aircraft_id" }) as string;
  const selectedPartIds = (useWatch({ control, name: "selected_part_ids" }) as string[]) ?? [];

  // Las partes de una aeronave se obtienen de sus asignaciones activas
  // (aircraft_assignments), no de un campo aircraft_id en aircraft_parts.
  // Se ordenan siempre: motor, turbina, hélice, apu, otros.
  const availableParts = useMemo(() => {
    const selectedAircraft = aircrafts?.find((a) => String(a.id) === aircraftId);
    return (selectedAircraft?.aircraft_assignments ?? [])
      .map((assignment) => assignment.aircraft_part)
      .filter((part): part is MaintenanceAircraftPart => !!part?.id)
      .sort((a, b) => {
        const rankDiff = partTypeRank(a.type) - partTypeRank(b.type);
        if (rankDiff !== 0) return rankDiff;
        return (a.part_name || a.part_number || "").localeCompare(b.part_name || b.part_number || "");
      });
  }, [aircrafts, aircraftId]);

  // Al cambiar de aeronave, la selección de partes ya no aplica. Se usa
  // replace() del propio useFieldArray de "part_services" (no form.setValue
  // directo) para no desincronizar su estado interno.
  const previousAircraftId = useRef(aircraftId);
  useEffect(() => {
    if (previousAircraftId.current !== aircraftId) {
      previousAircraftId.current = aircraftId;
      setValue("selected_part_ids", []);
      replace([]);
    }
    // replace/setValue no son estables en RHF; el efecto debe correr solo al
    // cambiar de aeronave.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aircraftId]);

  // La key de cada fila sale del id estable de RHF, no del índice: remove()
  // reindexa fields y una key posicional remonta los Popover/Select de Radix.
  const rowsForPart = (partId: string) =>
    fields
      .map((field: any, index) => ({ id: field.id as string, partId: field.aircraft_part_id, index }))
      .filter((row) => row.partId === partId);

  const togglePart = (part: MaintenanceAircraftPart) => {
    const partId = String(part.id);
    if (selectedPartIds.includes(partId)) {
      setValue(
        "selected_part_ids",
        selectedPartIds.filter((id) => id !== partId),
      );
      const indices = rowsForPart(partId).map((row) => row.index);
      if (indices.length) remove(indices);
    } else {
      // Solo marca la parte como seleccionada; la primera fila de servicio
      // se agrega con el botón "Agregar fila" (mismo flujo que certificados/
      // servicios), para no montar un Select nuevo en el mismo click que
      // cambia la selección.
      setValue("selected_part_ids", [...selectedPartIds, partId]);
    }
  };

  if (!aircraftId) {
    return <p className="text-sm text-muted-foreground">Seleccione primero una aeronave.</p>;
  }

  if (isLoading) {
    return <Loader2 className="size-4 animate-spin" />;
  }

  if (!availableParts.length) {
    return <p className="text-sm text-muted-foreground">Esta aeronave no tiene partes asignadas.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {availableParts.map((part) => {
          const checked = selectedPartIds.includes(String(part.id));
          return (
            <div
              key={part.id}
              role="checkbox"
              aria-checked={checked}
              tabIndex={0}
              onClick={() => togglePart(part)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  togglePart(part);
                }
              }}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors cursor-pointer select-none",
                checked ? "border-primary bg-primary/10" : "border-border hover:bg-muted",
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                  checked ? "border-primary bg-primary text-white" : "border-muted-foreground/40",
                )}
              >
                {checked && <Check className="h-3 w-3" />}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {partTypeLabel(part.type)}
                </span>
                <span>{part.part_name || part.part_number}</span>
              </span>
            </div>
          );
        })}
      </div>

      {availableParts
        .filter((part) => selectedPartIds.includes(String(part.id)))
        .map((part) => {
          const partId = String(part.id);
          return (
            <Card key={part.id}>
              <CardHeader className="py-3 flex flex-row items-center gap-2">
                <CardTitle className="text-base">{part.part_name || part.part_number}</CardTitle>
                <Badge variant="outline">{partTypeLabel(part.type)}</Badge>
              </CardHeader>
              <CardContent>
                <PartServiceRows
                  control={control}
                  rows={rowsForPart(partId)}
                  onAdd={() => append({ ...emptyServiceItem(), aircraft_part_id: partId })}
                  onRemove={(index) => remove(index)}
                  emptyLabel="Agregue al menos un servicio para esta parte."
                />
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}

function mapToFormCertificate(item: NonNullable<MaintenanceControl["items"]>[number]) {
  return {
    id: item.id,
    name: item.name,
    counting_method: item.counting_method,
    limit_value: Number(item.limit_value),
    // parseISO (no `new Date`): un string "yyyy-MM-dd" con `new Date` se
    // interpreta como medianoche UTC y en Venezuela (UTC-4) cae al día
    // anterior; parseISO lo toma en hora local.
    first_applied_date: parseISO(item.first_applied_date),
    first_applied_value:
      item.first_applied_value !== null && item.first_applied_value !== undefined
        ? Number(item.first_applied_value)
        : undefined,
    extra_days:
      item.extra_days !== null && item.extra_days !== undefined ? Number(item.extra_days) : undefined,
    has_provider: !!item.maintenance_provider_id,
    maintenance_provider_id: item.maintenance_provider_id ? String(item.maintenance_provider_id) : "",
  };
}

function mapToFormService(item: NonNullable<MaintenanceControl["items"]>[number]) {
  return {
    ...mapToFormCertificate(item),
    maintenance_provider_id: item.maintenance_provider_id ? String(item.maintenance_provider_id) : "",
  };
}

const emptyFormValues: FormValues = {
  aircraft_id: "",
  title: "",
  description: "",
  has_reference_manual: false,
  reference_manual: "",
  remaining_percentage: 10,
  certificates: [],
  services: [],
  selected_part_ids: [],
  part_services: [],
};

function buildDefaultValues(initialData?: MaintenanceControl): FormValues {
  if (!initialData) return emptyFormValues;

  const items = initialData.items ?? [];
  const parts = initialData.parts ?? [];

  return {
    aircraft_id: String(initialData.aircraft_id),
    title: initialData.title,
    description: initialData.description ?? "",
    has_reference_manual: initialData.has_reference_manual,
    reference_manual: initialData.reference_manual ?? "",
    remaining_percentage: Number(initialData.remaining_percentage),
    certificates: items.filter((i) => i.category === "CERTIFICATE").map(mapToFormCertificate),
    services: items
      .filter((i) => i.category === "SERVICE" && !i.maintenance_control_part_id)
      .map(mapToFormService),
    selected_part_ids: parts.map((p) => String(p.aircraft_part_id)),
    part_services: items
      .filter((i) => i.maintenance_control_part_id)
      .map((i) => {
        // String(...) en ambos lados: el id puede llegar como number o
        // string según el campo, y === estricto entre tipos distintos
        // nunca matchea (por eso las partes se veían sin servicios).
        const part = parts.find((p) => String(p.id) === String(i.maintenance_control_part_id));
        return { ...mapToFormService(i), aircraft_part_id: part ? String(part.aircraft_part_id) : "" };
      }),
  };
}

export default function CreateMaintenanceControlForm({ initialData }: { initialData?: MaintenanceControl }) {
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const isEditing = !!initialData;
  const { createMaintenanceControl } = useCreateMaintenanceControl();
  const { updateMaintenanceControl } = useUpdateMaintenanceControl();
  const { data: maintenanceControls } = useGetMaintenanceControls(selectedCompany?.slug);

  // Una aeronave solo puede tener un control; se excluyen del selector las
  // que ya tienen uno, salvo la del control que se está editando.
  const excludeAircraftIds = useMemo(
    () =>
      (maintenanceControls ?? [])
        .filter((c) => c.id !== initialData?.id)
        .map((c) => String(c.aircraft_id)),
    [maintenanceControls, initialData?.id],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: buildDefaultValues(initialData),
  });

  const hasReferenceManual = form.watch("has_reference_manual");
  const aircraftId = form.watch("aircraft_id");

  const onSubmit = async (values: FormValues) => {
    const toBaseItem = (item: z.infer<typeof certificateSchema>) => ({
      id: item.id,
      name: item.name,
      counting_method: item.counting_method,
      limit_value: item.limit_value,
      first_applied_date: format(item.first_applied_date, "yyyy-MM-dd"),
      first_applied_value: item.first_applied_value,
      extra_days: item.extra_days,
      // Los certificados solo mandan proveedor si el usuario activó el
      // checkbox; los servicios lo sobreescriben más abajo (siempre va).
      maintenance_provider_id: item.has_provider ? item.maintenance_provider_id : undefined,
    });

    const toServiceItem = (item: z.infer<typeof itemSchema>) => ({
      ...toBaseItem(item),
      maintenance_provider_id: item.maintenance_provider_id,
    });

    const payload = {
      aircraft_id: values.aircraft_id,
      title: values.title,
      description: values.description,
      has_reference_manual: values.has_reference_manual ?? false,
      reference_manual: values.reference_manual,
      remaining_percentage: values.remaining_percentage,
      certificates: values.certificates.map(toBaseItem),
      services: values.services.map(toServiceItem),
      parts: values.selected_part_ids.map((partId) => ({
        aircraft_part_id: partId,
        services: values.part_services
          .filter((service) => service.aircraft_part_id === partId)
          .map(toServiceItem),
      })),
    };

    if (isEditing) {
      await updateMaintenanceControl.mutateAsync({ id: initialData.id, company: selectedCompany!.slug, data: payload });
    } else {
      await createMaintenanceControl.mutateAsync({ company: selectedCompany!.slug, data: payload });
    }

    router.push(`/${selectedCompany!.slug}/planificacion/control_mantenimiento`);
  };

  const isPending = createMaintenanceControl.isPending || updateMaintenanceControl.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          // Enter dentro de un <input> envía el formulario nativamente
          // (equivalente a click en el botón submit); con tantos campos de
          // texto en el flujo, eso generaba un envío prematuro accidental.
          if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
            e.preventDefault();
          }
        }}
        className="flex flex-col gap-6 max-w-6xl mx-auto"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Datos Básicos</CardTitle>
            <CreateMaintenanceProviderDialog />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AircraftSelect control={form.control} name="aircraft_id" excludeIds={excludeAircraftIds} />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: Control de Mantenimiento YV2272" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remaining_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>% de Remanente para Alerta</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <NumericInput
                        className="pr-7"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        %
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Con cuánto remanente (sobre el límite de horas/ciclos/días) se avisa que un servicio está próximo a vencer.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    Descripción <span className="text-muted-foreground text-xs">(Opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="has_reference_manual"
              render={({ field }) => (
                <FormItem className="md:col-span-2 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>¿Tiene manual de referencia?</FormLabel>
                    <FormDescription>
                      Indique si este control se basa en un manual específico.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            {hasReferenceManual && (
              <FormField
                control={form.control}
                name="reference_manual"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Manual de Referencia</FormLabel>
                    <FormControl>
                      <Input placeholder="EJ: MAINTENANCE SCHEDULE REV. 5 DEL 15/MAY/2016" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {aircraftId ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Certificados</CardTitle>
              </CardHeader>
              <CardContent>
                <MaintenanceItemRows
                  control={form.control}
                  name="certificates"
                  emptyLabel="Agregue los certificados de la aeronave."
                  providerMode="optional"
                  createEmptyRow={emptyCertificate}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Servicios de la Aeronave</CardTitle>
              </CardHeader>
              <CardContent>
                <MaintenanceItemRows
                  control={form.control}
                  name="services"
                  emptyLabel="Agregue los servicios de la aeronave."
                  createEmptyRow={emptyServiceItem}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Partes de la Aeronave</CardTitle>
              </CardHeader>
              <CardContent>
                <PartsSection control={form.control} />
              </CardContent>
            </Card>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Seleccione una aeronave para cargar sus certificados, servicios y partes.
          </p>
        )}

        <Button
          className="bg-primary text-white hover:bg-blue-900 disabled:bg-primary/70"
          disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <p>{isEditing ? "Guardar Cambios" : "Crear Control de Mantenimiento"}</p>
          )}
        </Button>
      </form>
    </Form>
  );
}
