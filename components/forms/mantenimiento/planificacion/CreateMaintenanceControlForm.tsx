"use client";

import { useEffect, useMemo, useRef } from "react";
import { useForm, useFieldArray, useWatch, useFormContext, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import {
  Check,
  ClipboardList,
  FileCheck2,
  Loader2,
  Plane,
  Plus,
  Puzzle,
  Wrench,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerField } from "@/components/ui/DatePickerField";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { partTypeLabel, partTypeRank } from "@/lib/maintenancePartTypes";
import {
  FormSection,
  SearchableSelect,
  fieldClass,
  hintClass,
  labelClass,
  selectTriggerClass,
} from "./_theme";

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
          <FormDescription className={hintClass}>
            Solo se listan las que aún no tienen un control de mantenimiento.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function DateField({
  control,
  name,
  label = "Fecha",
}: {
  control: Control<any>;
  name: string;
  label?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          <DatePickerField
            label={label}
            value={field.value}
            setValue={(date) => field.onChange(date ?? undefined)}
            maxYear={new Date().getFullYear() + 5}
          />
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
  const options = useMemo(() => providers ?? [], [providers]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className={labelClass}>Realizado Por</FormLabel>
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

type ProviderMode = "required" | "optional";

/** Celda "no aplica": mantiene la altura y el rótulo de un campo real, para
 * que la cuadrícula del ítem no salte al cambiar de unidad de conteo. */
function PlaceholderField({ label }: { label: string }) {
  return (
    <FormItem className="w-full">
      <FormLabel className={cn(labelClass, "text-muted-foreground/50")}>{label}</FormLabel>
      <div className={cn(fieldClass, "flex items-center px-3 text-sm text-muted-foreground/50 shadow-none")}>
        No aplica
      </div>
    </FormItem>
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
        <FormItem className="w-full space-y-2">
          <div className="flex h-5 items-center gap-1.5">
            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-3.5 w-3.5" />
            <span className={cn(labelClass, "font-normal")}>¿Entidad responsable?</span>
          </div>
          {field.value ? (
            <ProviderField control={control} name={`${namePrefix}.maintenance_provider_id`} />
          ) : (
            <div className={cn(fieldClass, "flex items-center px-3 text-sm text-muted-foreground/50 shadow-none")}>
              Sin especificar
            </div>
          )}
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
  const name = useWatch({ control, name: `${namePrefix}.name` });
  const needsInitialReading = countingMethod && countingMethod !== "DAYS";
  const isDaysBased = countingMethod === "DAYS";

  return (
    <div className="group relative rounded-lg border border-slate-400/40 bg-gradient-to-br from-background/60 to-background/30 p-4 backdrop-blur-sm transition-colors hover:border-blue-400/30 dark:border-slate-600/40">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label={name ? `Quitar ${name}` : "Quitar fila"}
        className="absolute right-2 top-2 h-7 w-7 text-muted-foreground/70 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <X className="size-3.5" />
      </Button>

      <FormField
        control={control}
        name={`${namePrefix}.name`}
        render={({ field }) => (
          <FormItem className="w-full pr-9">
            <FormLabel className={labelClass}>Nombre</FormLabel>
            <FormControl>
              <Input placeholder="EJ: Certificado de Aeronavegabilidad" className={fieldClass} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <FormField
          control={control}
          name={`${namePrefix}.counting_method`}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className={labelClass}>Unidad</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className={selectTriggerClass}>
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
            <FormItem className="w-full">
              <FormLabel className={labelClass}>Límite</FormLabel>
              <FormControl>
                <NumericInput
                  placeholder="0"
                  className={fieldClass}
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

        {needsInitialReading ? (
          <FormField
            control={control}
            name={`${namePrefix}.first_applied_value`}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className={labelClass}>Lectura Inicial</FormLabel>
                <FormControl>
                  <NumericInput
                    placeholder="0"
                    className={fieldClass}
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
        ) : (
          <PlaceholderField label="Lectura Inicial" />
        )}

        {isDaysBased ? (
          <FormField
            control={control}
            name={`${namePrefix}.extra_days`}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className={labelClass}>Días Extra</FormLabel>
                <FormControl>
                  <NumericInput
                    placeholder="0"
                    className={fieldClass}
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
        ) : (
          <PlaceholderField label="Días Extra" />
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 border-t border-slate-400/20 pt-3 dark:border-slate-600/20 sm:grid-cols-2">
        <DateField control={control} name={`${namePrefix}.first_applied_date`} label="1ra Fecha Aplicada" />
        {providerMode === "required" ? (
          <ProviderField control={control} name={`${namePrefix}.maintenance_provider_id`} />
        ) : (
          <OptionalProviderCell control={control} namePrefix={namePrefix} />
        )}
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
      {fields.map((field, index) => (
        <ItemRow
          key={field.id}
          control={control}
          namePrefix={`${name}.${index}`}
          onRemove={() => remove(index)}
          providerMode={providerMode}
        />
      ))}
      {fields.length === 0 && (
        <p className={cn(hintClass, "italic")}>{emptyLabel}</p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append(createEmptyRow())}
        className="gap-1.5 border-dashed text-muted-foreground hover:border-blue-400/40 hover:text-primary"
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
      {rows.map(({ id, index }) => (
        <ItemRow
          key={id}
          control={control}
          namePrefix={`part_services.${index}`}
          onRemove={() => onRemove(index)}
        />
      ))}
      {rows.length === 0 && <p className={cn(hintClass, "italic")}>{emptyLabel}</p>}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAdd}
        className="gap-1.5 border-dashed text-muted-foreground hover:border-blue-400/40 hover:text-primary"
      >
        <Plus className="size-3.5" />
        Agregar fila
      </Button>
    </div>
  );
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
    return <p className={cn(hintClass, "italic")}>Seleccione primero una aeronave.</p>;
  }

  if (isLoading) {
    return <Loader2 className="size-4 animate-spin text-muted-foreground" />;
  }

  if (!availableParts.length) {
    return <p className={cn(hintClass, "italic")}>Esta aeronave no tiene partes asignadas.</p>;
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
                "flex cursor-pointer select-none items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all duration-200",
                checked
                  ? "border-blue-400/40 bg-primary/10 shadow-sm shadow-blue-500/10"
                  : "border-slate-400/50 bg-gradient-to-br from-background/70 to-background/40 backdrop-blur-md hover:border-blue-400/30 hover:shadow-sm hover:shadow-blue-500/10 dark:border-slate-600/50",
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                  checked ? "border-primary bg-primary text-white" : "border-muted-foreground/40",
                )}
              >
                {checked && <Check className="h-3 w-3" />}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {partTypeLabel(part.type)}
                </span>
                <span className="font-medium">{part.part_name || part.part_number}</span>
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
            <FormSection
              key={part.id}
              icon={Wrench}
              title={part.part_name || part.part_number}
              action={<Badge variant="outline">{partTypeLabel(part.type)}</Badge>}
            >
              <PartServiceRows
                control={control}
                rows={rowsForPart(partId)}
                onAdd={() => append({ ...emptyServiceItem(), aircraft_part_id: partId })}
                onRemove={(index) => remove(index)}
                emptyLabel="Agregue al menos un servicio para esta parte."
              />
            </FormSection>
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
        className="flex flex-col gap-6"
      >
        <FormSection
          icon={ClipboardList}
          title="Datos Básicos"
          hint="Aeronave, título y a partir de qué remanente se avisa."
          action={<CreateMaintenanceProviderDialog />}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AircraftSelect control={form.control} name="aircraft_id" excludeIds={excludeAircraftIds} />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={labelClass}>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: Control de Mantenimiento YV2272" className={fieldClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remaining_percentage"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={labelClass}>% de Remanente para Alerta</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <NumericInput
                        className={cn(fieldClass, "pr-8")}
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
                  <FormDescription className={hintClass}>
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
                <FormItem className="w-full md:col-span-2">
                  <FormLabel className={labelClass}>
                    Descripción <span className="text-muted-foreground text-xs">(Opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="..." className={cn(fieldClass, "h-auto resize-none py-2")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="has_reference_manual"
              render={({ field }) => (
                <FormItem
                  className={cn(
                    fieldClass,
                    "h-auto shadow-none md:col-span-2 flex flex-row items-start space-x-3 space-y-0 p-4 hover:shadow-none",
                  )}
                >
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className={labelClass}>¿Tiene manual de referencia?</FormLabel>
                    <FormDescription className={hintClass}>
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
                  <FormItem className="w-full md:col-span-2">
                    <FormLabel className={labelClass}>Manual de Referencia</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="EJ: MAINTENANCE SCHEDULE REV. 5 DEL 15/MAY/2016"
                        className={fieldClass}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </FormSection>

        {aircraftId ? (
          <>
            <FormSection
              icon={FileCheck2}
              title="Certificados"
              hint="Documentos a bordo de la aeronave: aeronavegabilidad, seguro, radio, ELT..."
            >
              <MaintenanceItemRows
                control={form.control}
                name="certificates"
                emptyLabel="Agregue los certificados de la aeronave."
                providerMode="optional"
                createEmptyRow={emptyCertificate}
              />
            </FormSection>

            <FormSection
              icon={Wrench}
              title="Servicios de la Aeronave"
              hint="Inspecciones periódicas de la aeronave como conjunto."
            >
              <MaintenanceItemRows
                control={form.control}
                name="services"
                emptyLabel="Agregue los servicios de la aeronave."
                createEmptyRow={emptyServiceItem}
              />
            </FormSection>

            <FormSection
              icon={Puzzle}
              title="Partes de la Aeronave"
              hint="Motores, turbinas y hélices con servicios propios."
            >
              <PartsSection control={form.control} />
            </FormSection>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-400/50 bg-muted/20 p-8 text-center dark:border-slate-600/50">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
              <Plane className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-muted-foreground">
              Seleccione una aeronave para continuar
            </p>
            <p className={hintClass}>Ahí se cargan sus certificados, servicios y partes.</p>
          </div>
        )}

        <Button
          className="h-11 gap-2 self-end rounded-lg bg-gradient-to-br from-primary to-primary/85 px-6 text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-blue-500/25 disabled:opacity-70"
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
