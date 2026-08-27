// use client

import {
  useCreateBatch,
  useUpdateBatch,
} from "@/actions/mantenimiento/almacen/inventario/lotes/actions";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetWarehousesByLocation } from "@/hooks/administracion/useGetWarehousesByUser";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { batches_categories } from "@/lib/batches_categories";
import { generateSlug, getValueFromLabel } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import CreateUnitForm from "@/components/forms/ajustes/CreateUnitForm";
import { useGetBatchesByCategory } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByCategory";
import { NumericInput } from "@/components/forms/mantenimiento/almacen/_components/NumericInput";
import { Batch } from "@/types";
import { format } from "path";

const CATEGORY_VALUES = {
  COMPONENT: "COMPONENT",
  TOOL: "TOOL",
  CONSUMABLE: "CONSUMABLE",
  PART: "PART",
} as const;

const UNIT_LABEL = ["UNIDADES", "UNIDAD"];
const WAREHOUSE_TYPE = "AERONAUTICO";

// Función para determinar si una categoría requiere las restricciones especiales
const requiresUnidadAndWarehouseRestrictions = (category: string) => {
  return (
    category === CATEGORY_VALUES.COMPONENT ||
    category === CATEGORY_VALUES.TOOL ||
    category === CATEGORY_VALUES.PART
  );
};

// Función para determinar si una categoría requiere almacén aeronáutico
const requiresAeronauticWarehouse = (category: string) => {
  return (
    category === CATEGORY_VALUES.COMPONENT ||
    category === CATEGORY_VALUES.PART
  );
};

const COMPONENT_PART_GROUP = [
  CATEGORY_VALUES.COMPONENT,
  CATEGORY_VALUES.PART,
];
const isComponentOrPart = (category?: string) =>
  COMPONENT_PART_GROUP.includes(category as any);

/**
 * Nivel de stock opcional: el vacío se normaliza a `undefined` antes de
 * validar, porque `z.coerce` lo convertiría en 0 y "sin nivel" no es lo mismo
 * que "nivel cero" — un mínimo en 0 nunca alerta.
 */
const optionalStockLevel = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().min(0, { message: "No puede ser negativo." }).optional(),
);

const FormSchema = z
  .object({
    name: z.string().min(3, { message: "Debe introducir un nombre válido." }),
    description: z.string().optional(),
    category: z.string({ message: "Debe ingresar una categoria para el lote." }),
    alternative_part_number: z.string().optional(),
    // ata_code: z.string().optional(),
    is_hazardous: z.boolean().optional(),
    // medition_unit: z.string().min(1, { message: "Debe seleccionar una unidad." }),
    warehouse_id: z.string(),
    min_quantity: optionalStockLevel,
    maximum_quantity: optionalStockLevel,
  })
  // Un máximo por debajo del mínimo haría que la requisición pida ≤ 0.
  .refine(
    (values) =>
      values.maximum_quantity === undefined ||
      values.min_quantity === undefined ||
      values.maximum_quantity >= values.min_quantity,
    {
      message: "La cantidad máxima no puede ser menor que la mínima.",
      path: ["maximum_quantity"],
    },
  );

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  onClose: () => void;
  onSuccess?: (batchName: string) => void;
  defaultCategory?: string;
  isEditing?: boolean;
  initialData?: Batch;
}

export function CreateBatchForm({
  onClose,
  onSuccess,
  defaultCategory,
  isEditing = false,
  initialData,
}: FormProps) {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const {
    data: warehouses,
    error,
    isLoading,
  } = useGetWarehousesByLocation({
    company: selectedCompany?.slug,
    location_id: selectedStation,
  });

  const {
    data: units,
    isLoading: isUnitsLoading,
    refetch: refetchUnits,
  } = useGetUnits(selectedCompany?.slug);
  const { createBatch } = useCreateBatch();
  const { updateBatch } = useUpdateBatch();

const form = useForm<FormSchemaType>({
  resolver: zodResolver(FormSchema),
  defaultValues: {
    is_hazardous: initialData?.is_hazardous || false,
    category: initialData?.category
      ? getValueFromLabel(initialData.category)
      : defaultCategory || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    // ata_code: initialData?.ata_code || "",
    // medition_unit: initialData?.unit?.value?.toString() || "",
    warehouse_id: initialData?.warehouse_id?.toString() || "",
    // `undefined` y no 0: son opcionales, y un mínimo en 0 nunca alertaría.
    min_quantity: initialData?.min_quantity ?? undefined,
    maximum_quantity: initialData?.maximum_quantity ?? undefined,
  },
});

  const { control, setError, clearErrors, setValue } = form;
  const name = useWatch({ control, name: "name" });
  const category = useWatch({ control, name: "category" });
  const { data: batches } = useGetBatchesByCategory(category || "");
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const isNameDuplicate =
    category && name && batches?.some((batch) => batch.name === name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultCategory)
      form.setValue("category", defaultCategory, { shouldValidate: true });
  }, [defaultCategory, form]);

  const shouldRestrictUnit = requiresUnidadAndWarehouseRestrictions(category);

  // useEffect(() => {
  //   if (shouldRestrictUnit && units?.length && !isUnitsLoading) {
  //     const unidad = units.find((u) => UNIT_LABEL.includes(u.label));
  //     if (unidad && form.getValues("medition_unit") !== unidad.value) {
  //       form.setValue("medition_unit", unidad.value, {
  //         shouldValidate: true,
  //         shouldDirty: false,
  //       });
  //     }
  //   }
  // }, [shouldRestrictUnit, units, isUnitsLoading, form]);

  // Efecto para restringir almacén a tipo "AERONAUTICO" para categorías específicas
  useEffect(() => {
    if (
      requiresAeronauticWarehouse(category) &&
      warehouses?.length &&
      !isLoading
    ) {
      const warehouse =
        warehouses.find((w) => w.type === WAREHOUSE_TYPE) || warehouses[0];
      if (
        warehouse &&
        form.getValues("warehouse_id") !== warehouse.id.toString()
      ) {
        form.setValue("warehouse_id", warehouse.id.toString(), {
          shouldValidate: true,
          shouldDirty: false,
        });
      }
    }
  }, [category, warehouses, isLoading, form]);

  useEffect(() => {
    if (isNameDuplicate && !(isEditing && initialData?.name === form.getValues("name"))) {
      setError("name", {
        type: "manual",
        message: "El numero de parte ya existe en esta categoría.",
      });
    } else {
      clearErrors("name");
    }
  }, [isNameDuplicate, setError, clearErrors, form, initialData?.name, isEditing]);

  const onSubmit = async (data: FormSchemaType) => {
    if (isSubmitting) return; // bloquea clicks múltiples
    setIsSubmitting(true);

    try {
      const company = selectedCompany?.slug;
      if (!company) {
        setError("name", {
          type: "manual",
          message: "No se ha seleccionado una compañia.",
        });
        return;
      }
      if (isNameDuplicate && !(isEditing && initialData?.name === data.name)) {
        setError("name", {
          type: "manual",
          message: "El numero de parte ya existe en esta categoría.",
        });
        return;
      }

      if (isEditing && initialData) {
        await updateBatch.mutateAsync({
          id: initialData.id.toString(),
          data: {
            ...data,
            slug: generateSlug(data.name),
            warehouse_id: Number(data.warehouse_id),
          },
          company,
        });
      } else {
        await createBatch.mutateAsync({
          data: {
            ...data,
            slug: generateSlug(data.name),
            warehouse_id: Number(data.warehouse_id),
          },
          company,
        });
      }

      onSuccess?.(data.name);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Form {...form}>
      <form
        className="flex flex-col space-y-3 w-full"
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(onSubmit)(e);
        }}
      >
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="w-[240px]">
                <FormLabel>Categoria del Renglón</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  disabled={isEditing && !isComponentOrPart(category)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={"Seleccione..."} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {batches_categories
                      .filter((cat) => {
                        if (!isEditing) return true;

                        if (isComponentOrPart(category)) {
                          return COMPONENT_PART_GROUP.includes(
                            cat.value as any,
                          );
                        }
                        // Para cualquier otro caso, no permitir cambios
                        return cat.value === category;
                      })
                      .map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: Martillos " {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 w-full">
          {/* Selector de unidad primaria deshabilitado: la unidad se define
              ahora por artículo, no por renglón. Se conserva junto al diálogo
              de creación del final por si se reactiva. */}
          {/* <FormField
            control={form.control}
            name="medition_unit"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Unidades</FormLabel>
                <div className="flex gap-2">
                  <Select
                    disabled={isUnitsLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="flex-1">
                        <SelectValue
                          placeholder={
                            isUnitsLoading ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              "Seleccione..."
                            )
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isUnitsLoading && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      {units
                        ?.filter((unit) =>
                          requiresUnidadAndWarehouseRestrictions(category)
                            ? UNIT_LABEL.includes(unit.label)
                            : true,
                        )
                        .map((unit) => (
                          <SelectItem key={unit.id} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      {!units?.length && (
                        <p className="text-xs p-2 text-muted-foreground">
                          No se han encontrado unidades...
                        </p>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsUnitDialogOpen(true)}
                    className="shrink-0"
                    disabled={
                      requiresUnidadAndWarehouseRestrictions(category) ||
                      isUnitsLoading
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <FormDescription>
                  Unidad primaria para medir el renglón.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <FormField
            control={form.control}
            name="warehouse_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Almacén</FormLabel>
                <Select
                  disabled={isLoading}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoading ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            "Seleccione..."
                          )
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoading && <Loader2 className="size-4 animate-spin" />}
                    {warehouses
                      ?.filter((w) =>
                        requiresAeronauticWarehouse(category)
                          ? w.type === WAREHOUSE_TYPE
                          : true,
                      )
                      .map((warehouse) => (
                        <SelectItem
                          key={warehouse.id}
                          value={warehouse.id.toString()}
                        >
                          {warehouse.name} - {warehouse.location.address}
                        </SelectItem>
                      ))}
                    {!warehouses?.length && (
                      <p className="text-xs p-2 text-muted-foreground">
                        {error
                          ? "Ha ocurrido un error al cargar los almacenes..."
                          : "No se han encontrado almacenes..."}
                      </p>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {category === CATEGORY_VALUES.CONSUMABLE && (
            <FormField
              control={form.control}
              name="is_hazardous"
              render={({ field }) => (
                <FormItem className="flex flex-row space-x-3 space-y-0 p-8 w-full">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      ¿El renglón contiene articulos peligrosos?
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          )}
        </div>
        {/* Los niveles de stock son del renglón y solo aplican al consumible:
            su alerta contrasta el mínimo con la suma de sus lotes. En las demás
            categorías el artículo se cuenta por pieza y no hay tal suma. */}
        {category === CATEGORY_VALUES.CONSUMABLE && (
          <div className="flex gap-2 w-full">
            <FormField
              control={form.control}
              name="min_quantity"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Cantidad mínima</FormLabel>
                  <FormControl>
                    <NumericInput
                      {...field}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Ej: 10"
                      className="h-10 rounded-md text-sm"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Opcional. Al bajar de este nivel se alerta el stock.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maximum_quantity"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Cantidad máxima</FormLabel>
                  <FormControl>
                    <NumericInput
                      {...field}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Ej: 40"
                      className="h-10 rounded-md text-sm"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Opcional. Nivel a reponer, no un tope de existencia.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observación</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="EJ: #### - ### - ###"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          className="bg-primary mt-2 text-white hover:bg-blue-900"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <p>{isEditing ? "Guardar" : "Crear"}</p>
          )}
        </Button>
      </form>
      {/* <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Crear Unidad Primaria</DialogTitle>
            <DialogDescription>
              Cree una nueva unidad primaria rellenando la información
              necesaria.
            </DialogDescription>
          </DialogHeader>
          <CreateUnitForm
            onClose={() => setIsUnitDialogOpen(false)}
            onSuccess={(unitData) => {
              refetchUnits().then(() => {
                setValue("medition_unit", unitData.value);
                setIsUnitDialogOpen(false);
              });
            }}
          />
        </DialogContent>
      </Dialog> */}
    </Form>
  );
}
