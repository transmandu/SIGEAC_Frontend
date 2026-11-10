"use client";

import { useMemo } from "react";
import { Plane, Warehouse as WarehouseIcon, Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  useCreateWarehouse,
  useUpdateWarehouse,
} from "@/actions/mantenimiento/almacen/almacenes/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import {
  fieldClass,
  hintClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { OptionCombobox } from "@/components/forms/general/OptionCombobox";
import { PanelFieldLabel, PanelSection } from "@/components/forms/PanelSection";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useGetWarehouses } from "@/hooks/administracion/useGetWarehouses";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { locationLabel } from "@/lib/locations";
import { cn } from "@/lib/utils";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Warehouse } from "@/types";

const NAME_MAX = 50;

const TYPES = [
  {
    value: "AERONAUTICAL",
    label: "Aeronáutico",
    hint: "Piezas, componentes, herramientas y consumibles.",
    icon: Plane,
  },
  {
    value: "GENERAL",
    label: "General",
    hint: "Artículos generales.",
    icon: Package,
  },
] as const;

const FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  location_id: "Ubicación",
  type: "Tipo",
};

const sameName = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

const buildSchema = (existing: Warehouse[], current?: Warehouse) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
        .max(NAME_MAX, {
          message: `No puede superar los ${NAME_MAX} caracteres.`,
        }),
      location_id: z.string().min(1, { message: "Seleccione la ubicación." }),
      type: z.enum(["AERONAUTICAL", "GENERAL"], {
        message: "Seleccione el tipo de almacén.",
      }),
    })
    .superRefine((values, ctx) => {
      // El servidor exige que no se repita el nombre dentro de la misma sede.
      const repeated = existing.some(
        (warehouse) =>
          warehouse.id !== current?.id &&
          String(warehouse.location?.id ?? "") === values.location_id &&
          sameName(warehouse.name, values.name),
      );

      if (repeated) {
        ctx.addIssue({
          code: "custom",
          path: ["name"],
          message: "Ya hay un almacén con ese nombre en esa ubicación.",
        });
      }
    });

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

interface FormProps {
  onClose?: () => void;
  /** Con almacén, el formulario edita en lugar de crear. */
  warehouse?: Warehouse;
}

const CreateWarehouseForm = ({ onClose, warehouse }: FormProps) => {
  const { selectedCompany } = useCompanyStore();
  const { data: locations, isLoading: loadingLocations } =
    useGetLocationsByCompany(selectedCompany?.slug);
  const { data: warehouses } = useGetWarehouses();
  const { createWarehouse } = useCreateWarehouse();
  const { updateWarehouse } = useUpdateWarehouse();
  const mutation = warehouse ? updateWarehouse : createWarehouse;

  // Con registros colgando, el tipo y la sede no se cambian (lo rechaza el servidor).
  const locked = (warehouse?.records_count ?? 0) > 0;

  const schema = useMemo(
    () => buildSchema(warehouses ?? [], warehouse),
    [warehouses, warehouse],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: warehouse?.name ?? "",
      location_id: warehouse?.location?.id ? String(warehouse.location.id) : "",
      type: (warehouse?.type?.toUpperCase() as FormValues["type"]) ?? undefined,
    },
  });

  const onSubmit = async (values: FormValues) => {
    const company = selectedCompany?.slug;
    if (!company) return;

    const data = {
      name: values.name,
      location_id: Number(values.location_id),
      type: values.type,
    };

    try {
      if (warehouse) {
        await updateWarehouse.mutateAsync({
          company,
          id: warehouse.id,
          data,
        });
      } else {
        await createWarehouse.mutateAsync({ company, data });
      }
      onClose?.();
    } catch (error) {
      const errors = serverFieldErrors(error);
      if (errors) applyServerFieldErrors(form.setError, errors, FIELD_LABELS);
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        busy={mutation.isPending}
        canSave={warehouse ? form.formState.isDirty : true}
        isEditing={!!warehouse}
        submitLabel={warehouse ? "Guardar cambios" : "Crear almacén"}
        onCancel={onClose}
        // stopPropagation: el formulario puede montarse dentro de otro y el
        // submit subiría por el árbol de React hasta el formulario padre.
        onSubmit={(event) => {
          event.stopPropagation();
          form.handleSubmit(onSubmit, invalidFormHandler(FIELD_LABELS))(event);
        }}
      >
        <PanelSection
          icon={WarehouseIcon}
          title="Almacén"
          hint="Su nombre, qué guarda y la sede en la que se encuentra."
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <PanelFieldLabel>
                    Nombre del almacén
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </PanelFieldLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Almacén General"
                      autoComplete="off"
                      maxLength={NAME_MAX}
                      className={fieldClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field, fieldState }) => (
                <FormItem>
                  <PanelFieldLabel preventClick>
                    Tipo
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </PanelFieldLabel>
                  <RadioGroup
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={locked}
                    className="grid-cols-2 gap-2.5"
                  >
                    {TYPES.map(({ value, label, hint, icon: Icon }) => (
                      <label
                        key={value}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition-colors dark:border-slate-700/60 dark:bg-slate-900/60",
                          "hover:border-primary/40 hover:bg-primary/3",
                          "has-focus-visible:ring-2 has-focus-visible:ring-primary/40",
                          "has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/6",
                          fieldState.error && "border-destructive/60",
                          locked &&
                            "cursor-not-allowed opacity-60 hover:border-slate-200 hover:bg-white dark:hover:bg-slate-900/60",
                        )}
                      >
                        <RadioGroupItem value={value} className="sr-only" />
                        <span
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors",
                            field.value === value &&
                              "bg-primary/10 text-primary",
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm leading-tight font-medium">
                            {label}
                          </span>
                          <span className="block text-xs text-muted-foreground max-sm:hidden">
                            {hint}
                          </span>
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                  <FormDescription className={hintClass}>
                    {locked
                      ? "No se puede cambiar: el almacén ya tiene registros."
                      : "Define qué artículos recibe el almacén."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location_id"
              render={({ field, fieldState }) => (
                <FormItem>
                  <PanelFieldLabel preventClick>
                    Ubicación
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </PanelFieldLabel>
                  <OptionCombobox
                    value={field.value}
                    onChange={field.onChange}
                    options={(locations ?? []).map((location) => ({
                      id: String(location.id),
                      label: locationLabel(location),
                    }))}
                    placeholder="Seleccione la ubicación..."
                    searchPlaceholder="Buscar ubicación..."
                    loading={loadingLocations}
                    disabled={locked}
                    invalid={!!fieldState.error}
                  />
                  <FormDescription className={hintClass}>
                    {locked
                      ? "No se puede cambiar: el almacén ya tiene registros."
                      : "Sede en la que se encuentra el almacén."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </PanelSection>
      </ArticleFormShell>
    </Form>
  );
};

export default CreateWarehouseForm;
