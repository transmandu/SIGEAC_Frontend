"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { addYears, format, subYears } from "date-fns";
import { es } from "date-fns/locale";

import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  FileUpIcon,
  Loader2,
  Plus,
  X,
} from "lucide-react";

import {
  useConfirmIncomingArticle,
  useCreateArticle,
  useUpdateArticle,
} from "@/actions/mantenimiento/almacen/inventario/articulos/actions";

import { MultiInputField } from "@/components/misc/MultiInputField";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useGetConditions } from "@/hooks/administracion/useGetConditions";
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";
import { useGetBatchesByCategory } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByCategory";
import { useSearchBatchesByPartNumber } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByArticlePartNumber";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { useGetSecondaryUnits } from "@/hooks/general/unidades/useGetSecondaryUnits";

import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Batch, Convertion } from "@/types";

import loadingGif from "@/public/loading2.gif";
import { EditingArticle } from "./RegisterArticleForm";
import { CreateManufacturerDialog } from "@/components/dialogs/general/CreateManufacturerDialog";

/* ------------------------------- Schema ------------------------------- */

const fileMaxBytes = 10_000_000; // 10 MB

const formSchema = z.object({
  part_number: z
    .string({ message: "Debe ingresar un número de parte." })
    .min(2, {
      message: "El número de parte debe contener al menos 2 caracteres.",
    }),
  lot_number: z.string().optional(),
  alternative_part_number: z
    .array(
      z.string().min(2, {
        message: "Cada número alterno debe contener al menos 2 caracteres.",
      })
    )
    .optional(),
  description: z.string().optional(),
  batch_name: z.string().optional(),
  zone: z.string().optional(),
  caducate_date: z.string().optional(),
  fabrication_date: z.string().optional(),
  manufacturer_id: z.string().optional(),
  condition_id: z.string().min(1, "Debe ingresar la condición del artículo."),
  quantity: z.coerce
    .number({ message: "Debe ingresar una cantidad." })
    .min(0, { message: "No puede ser negativo." }),
  min_quantity: z.coerce
    .number()
    .min(0, { message: "No puede ser negativo." })
    .optional(),
  batch_id: z
    .string({ message: "Debe ingresar un lote." })
    .min(1, "Seleccione un lote"),
  is_managed: z.boolean().optional(),
  certificate_8130: z
    .instanceof(File, { message: "Suba un archivo válido." })
    .refine((f) => f.size <= fileMaxBytes, "Tamaño máximo 10 MB.")
    .optional(),
  certificate_fabricant: z
    .instanceof(File, { message: "Suba un archivo válido." })
    .refine((f) => f.size <= fileMaxBytes, "Tamaño máximo 10 MB.")
    .optional(),
  certificate_vendor: z
    .instanceof(File, { message: "Suba un archivo válido." })
    .refine((f) => f.size <= fileMaxBytes, "Tamaño máximo 10 MB.")
    .optional(),
  image: z.instanceof(File).optional(),
  convertion_id: z.number().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

/* ----------------------------- Interfaces ----------------------------- */

interface UnitSelection {
  convertion_id: number;
  is_main_unit: boolean;
}

/* ----------------------------- Helpers UI ----------------------------- */

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

function FileField({
  form,
  name,
  label,
  accept = ".pdf,image/*",
  description,
  busy,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  name: keyof FormValues;
  label: React.ReactNode;
  accept?: string;
  description?: string;
  busy?: boolean;
}) {
  return (
    <FormField
      control={form.control}
      name={name as any}
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative h-10 w-full">
              <FileUpIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
              <Input
                type="file"
                accept={accept}
                disabled={busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f)
                    form.setValue(name as any, f as any, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                }}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
              />
            </div>
          </FormControl>
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function DatePickerField({
  label,
  value,
  setValue,
  description,
  busy,
  shortcuts = "both",
}: {
  label: string;
  value?: Date;
  setValue: (d?: Date) => void;
  description?: string;
  busy?: boolean;
  /** "both" | "back" | "forward" | "none" */
  shortcuts?: "both" | "back" | "forward" | "none";
}) {
  const showBack = shortcuts === "both" || shortcuts === "back";
  const showForward = shortcuts === "both" || shortcuts === "forward";
  return (
    <FormItem className="flex flex-col p-0 mt-2.5 w-full">
      <FormLabel>{label}</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              disabled={busy}
              className={cn(
                "w-full pl-3 text-left font-normal",
                !value && "text-muted-foreground"
              )}
            >
              {value ? (
                format(value, "PPP", { locale: es })
              ) : (
                <span>Seleccione una fecha</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {(showBack || showForward) && (
            <Select
              onValueChange={(v) => {
                const n = parseInt(v);
                if (n === 0) {
                  setValue(new Date());
                  return;
                }
                if (n < 0) setValue(subYears(new Date(), Math.abs(n)));
                else setValue(addYears(new Date(), n));
              }}
            >
              <SelectTrigger className="p-3">
                <SelectValue placeholder="Atajos de fecha" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="0">Actual</SelectItem>
                {showBack &&
                  [5, 10, 15].map((y) => (
                    <SelectItem key={`b-${y}`} value={`${-y}`}>
                      Ir {y} años atrás
                    </SelectItem>
                  ))}
                {showForward &&
                  [5, 10, 15].map((y) => (
                    <SelectItem key={`f-${y}`} value={`${y}`}>
                      {y} años
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
          <Calendar
            locale={es}
            mode="single"
            selected={value}
            onSelect={setValue}
            initialFocus
            month={value}
          />
        </PopoverContent>
      </Popover>
      {description ? <FormDescription>{description}</FormDescription> : null}
      <FormMessage />
    </FormItem>
  );
}

/* ----------------------------- Modal Unidades ----------------------------- */

function UnitsModal({
  open,
  onOpenChange,
  secondaryUnits,
  selectedUnits,
  onSelectedUnitsChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  secondaryUnits: Convertion[];
  selectedUnits: UnitSelection[];
  onSelectedUnitsChange: (units: UnitSelection[]) => void;
}) {
  const [currentUnitId, setCurrentUnitId] = useState<number | "">("");
  const [isPrimary, setIsPrimary] = useState(false);

  const availableUnits = secondaryUnits.filter(
    (unit) =>
      !selectedUnits.some((selected) => selected.convertion_id === unit.id)
  );

  const addUnit = () => {
    if (!currentUnitId) return;

    const newUnit: UnitSelection = {
      convertion_id: currentUnitId as number,
      is_main_unit: isPrimary,
    };

    // Si se marca como primaria, quitar primaria de las demás
    const updatedUnits = isPrimary
      ? selectedUnits.map((unit) => ({ ...unit, is_main_unit: false }))
      : [...selectedUnits];

    updatedUnits.push(newUnit);
    onSelectedUnitsChange(updatedUnits);

    // Reset form
    setCurrentUnitId("");
    setIsPrimary(false);
  };

  const removeUnit = (unitId: number) => {
    const updatedUnits = selectedUnits.filter(
      (unit) => unit.convertion_id !== unitId
    );
    onSelectedUnitsChange(updatedUnits);
  };

  const setAsPrimary = (unitId: number) => {
    const updatedUnits = selectedUnits.map((unit) => ({
      ...unit,
      is_main_unit: unit.convertion_id === unitId,
    }));
    onSelectedUnitsChange(updatedUnits);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configurar Conversiones de Unidades</DialogTitle>
          <DialogDescription>
            Seleccione las conversiones de unidades adicionales para este
            artículo y establezca cuál será la unidad primaria.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Formulario para agregar nueva conversión */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Conversión de Unidad
              </label>
              <Select
                value={currentUnitId.toString()}
                onValueChange={(value) =>
                  setCurrentUnitId(value ? parseInt(value) : "")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una conversión" />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map((conversion) => (
                    <SelectItem
                      key={conversion.id}
                      value={conversion.id.toString()}
                    >
                      {conversion.primary_unit.label}
                      {conversion.secondary_unit?.label &&
                        ` (${conversion.secondary_unit.label})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-primary"
                  checked={isPrimary}
                  onCheckedChange={(checked) =>
                    setIsPrimary(checked as boolean)
                  }
                />
                <label
                  htmlFor="is-primary"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Establecer como primaria
                </label>
              </div>
              <Button onClick={addUnit} disabled={!currentUnitId}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>
          </div>

          {/* Lista de conversiones seleccionadas */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Conversiones seleccionadas:</h4>
            {selectedUnits.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No hay conversiones seleccionadas
              </p>
            ) : (
              <div className="space-y-2">
                {selectedUnits.map((unit) => {
                  const conversionInfo = secondaryUnits.find(
                    (u) => u.id === unit.convertion_id
                  );
                  return (
                    <div
                      key={unit.convertion_id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">
                          {conversionInfo?.primary_unit.label}
                          {conversionInfo?.secondary_unit?.label &&
                            ` (${conversionInfo.secondary_unit.label})`}
                        </span>
                        {unit.is_main_unit && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                            Primaria
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {!unit.is_main_unit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAsPrimary(unit.convertion_id)}
                          >
                            Hacer primaria
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUnit(unit.convertion_id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- Componente ----------------------------- */

export default function CreateConsumableForm({
  initialData,
  isEditing,
}: {
  initialData?: EditingArticle;
  isEditing?: boolean;
}) {
  const router = useRouter();
  const { selectedCompany, selectedStation } = useCompanyStore();

  // Local state for part number search
  const [partNumberToSearch, setPartNumberToSearch] = useState<
    string | undefined
  >(undefined);

  // Modal state
  const [unitsModalOpen, setUnitsModalOpen] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<UnitSelection[]>([]);

  // Nuevo estado para controlar la visibilidad
  const [showResultQuantity, setShowResultQuantity] = useState(true);

  // Data hooks
  const {
    data: batches,
    isPending: isBatchesLoading,
    isError: isBatchesError,
  } = useGetBatchesByCategory("consumible");
  const {
    data: manufacturers,
    isLoading: isManufacturerLoading,
    isError: isManufacturerError,
  } = useGetManufacturers(selectedCompany?.slug);

  const {
    data: conditions,
    isLoading: isConditionsLoading,
    error: isConditionsError,
  } = useGetConditions();

  const { data: units, isLoading: unitsLoading } = useGetUnits(
    selectedCompany?.slug
  );

  const { data: secondaryUnits, isLoading: secondaryUnitsLoading } =
    useGetSecondaryUnits(selectedCompany?.slug);

  // Search batches by part number
  const { data: searchResults, isFetching: isSearching } =
    useSearchBatchesByPartNumber(
      selectedCompany?.slug,
      selectedStation || undefined,
      partNumberToSearch,
      "CONSUMIBLE"
    );

  // Mutations
  const { createArticle } = useCreateArticle();
  const { updateArticle } = useUpdateArticle();
  const { confirmIncoming } = useConfirmIncomingArticle();

  // Local UI state
  const [secondaryOpen, setSecondaryOpen] = useState(false);
  const [secondarySelected, setSecondarySelected] = useState<any | null>(null);
  const [secondaryQuantity, setSecondaryQuantity] = useState<
    number | undefined
  >();
  const [caducateDate, setCaducateDate] = useState<Date | undefined>(
    initialData?.consumable?.caducate_date
      ? new Date(initialData.consumable.caducate_date)
      : undefined
  );
  const [fabricationDate, setFabricationDate] = useState<Date | undefined>(
    initialData?.consumable?.fabrication_date
      ? new Date(initialData?.consumable?.fabrication_date)
      : undefined
  );
  const [enableBatchNameEdit, setEnableBatchNameEdit] = useState(false);

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      part_number: initialData?.part_number || "",
      alternative_part_number: initialData?.alternative_part_number || [],
      batch_id: initialData?.batches?.id?.toString() || "",
      batch_name: initialData?.batches?.name || "",
      manufacturer_id: initialData?.manufacturer?.id?.toString() || "",
      condition_id: initialData?.condition?.id?.toString() || "",
      description: initialData?.description || "",
      zone: initialData?.zone || "",
      lot_number: initialData?.consumable?.lot_number || "",
      caducate_date: initialData?.consumable?.caducate_date || undefined,
      fabrication_date: initialData?.consumable?.fabrication_date || undefined,
      quantity: initialData?.consumable?.quantity ?? 0,
      min_quantity: initialData?.consumable?.min_quantity
        ? Number(initialData.consumable.min_quantity)
        : undefined,
      is_managed: initialData?.consumable?.is_managed
        ? initialData.consumable.is_managed === "1" ||
          initialData.consumable.is_managed === true
        : true,
    },
    mode: "onBlur",
  });

  // Reset si cambia initialData
  useEffect(() => {
    if (!initialData) return;
    form.reset({
      part_number: initialData.part_number ?? "",
      alternative_part_number: initialData.alternative_part_number ?? [],
      batch_id: initialData.batches?.id?.toString() ?? "",
      batch_name: initialData.batches?.name ?? "",
      manufacturer_id: initialData.manufacturer?.id?.toString() ?? "",
      condition_id: initialData.condition?.id?.toString() ?? "",
      description: initialData.description ?? "",
      zone: initialData.zone ?? "",
      lot_number: initialData.consumable?.lot_number ?? "",
      caducate_date: initialData?.consumable?.caducate_date || undefined,
      fabrication_date: initialData?.consumable?.fabrication_date || undefined,
      quantity: initialData.consumable?.quantity ?? 0,
      min_quantity: initialData.consumable?.min_quantity
        ? Number(initialData.consumable.min_quantity)
        : undefined,
      is_managed: initialData.consumable?.is_managed
        ? initialData.consumable.is_managed === "1" ||
          initialData.consumable.is_managed === true
        : true,
    });
  }, [initialData, form]);

  // Efecto para determinar si mostrar u ocultar el campo de cantidad resultante
  useEffect(() => {
    if (secondarySelected) {
      // Ocultar si no hay unidad secundaria o si la equivalencia es 1 (conversión 1:1)
      const shouldHide =
        !secondarySelected.secondary_unit ||
        secondarySelected.equivalence === 1;
      setShowResultQuantity(!shouldHide);

      // Si está oculto, sincronizar directamente la cantidad
      if (shouldHide && secondaryQuantity !== undefined) {
        form.setValue("quantity", secondaryQuantity || 0, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    } else {
      // Si no hay conversión seleccionada, mostrar el campo
      setShowResultQuantity(true);
    }
  }, [secondarySelected, secondaryQuantity, form]);

  // Función para calcular y actualizar la cantidad resultante
  const calculateAndUpdateQuantity = (
    quantity: number | undefined,
    conversion: any
  ) => {
    if (quantity === undefined) {
      // Cuando se borra el input, establecer a 0
      form.setValue("quantity", 0, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    if (conversion) {
      // Solo calcular si la conversión tiene unidad secundaria y no es 1:1
      if (conversion.secondary_unit && conversion.equivalence !== 1) {
        const calculatedQuantity = quantity * (conversion.equivalence || 1);
        form.setValue("quantity", calculatedQuantity, {
          shouldDirty: true,
          shouldValidate: true,
        });
      } else {
        // Para conversiones 1:1 o sin unidad secundaria, usar la cantidad directamente
        form.setValue("quantity", quantity, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      // Establecer el convertion_id en todos los casos
      form.setValue("convertion_id", conversion.id, {
        shouldDirty: true,
        shouldValidate: false,
      });
    } else {
      // Si no hay conversión seleccionada, usar la cantidad directamente
      form.setValue("quantity", quantity, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  // Modificar el efecto existente para calcular la cantidad resultante
  useEffect(() => {
    if (secondarySelected && secondaryQuantity !== undefined) {
      calculateAndUpdateQuantity(secondaryQuantity, secondarySelected);
    }
  }, [secondarySelected, secondaryQuantity]);

  // Autocompletar descripción cuando encuentra resultados de búsqueda
  useEffect(() => {
    if (searchResults && searchResults.length > 0 && !isEditing) {
      const firstResult = searchResults[0];
      form.setValue("batch_id", firstResult.id.toString(), {
        shouldValidate: true,
      });

      // Notificar al usuario
      if (searchResults.length === 1) {
        console.log("✓ Descripción autocompletada");
      } else {
        console.log(
          `✓ Se encontraron ${searchResults.length} descripciones. Se seleccionó la primera.`
        );
      }
    } else if (
      searchResults &&
      searchResults.length === 0 &&
      partNumberToSearch
    ) {
      console.log("No se encontraron descripciones para este part number");
    }
  }, [searchResults, form, isEditing, partNumberToSearch]);

  // Sincronizar checkbox con unidad seleccionada
  useEffect(() => {
    if (secondarySelected) {
      const isCurrentlyPrimary = selectedUnits.some(
        (unit) =>
          unit.convertion_id === secondarySelected.id && unit.is_main_unit
      );
      // El checkbox se maneja automáticamente por el estado
    }
  }, [secondarySelected, selectedUnits]);

  const normalizeUpper = (s?: string) => s?.trim().toUpperCase() ?? "";

  const busy =
    isBatchesLoading ||
    isManufacturerLoading ||
    isConditionsLoading ||
    createArticle.isPending ||
    confirmIncoming.isPending ||
    updateArticle.isPending;

  const batchNameById = useMemo(() => {
    const map = new Map<string, string>();
    batches?.forEach((b) => map.set(String(b.id), b.name));
    return map;
  }, [batches]);

  // Ordenar batches: primero los resultados de búsqueda, luego el resto
  const sortedBatches = useMemo(() => {
    if (!batches) return [];
    if (!searchResults || searchResults.length === 0) return batches;

    const searchIds = new Set(searchResults.map((r) => r.id));
    const foundBatches = batches.filter((b) => searchIds.has(b.id));
    const otherBatches = batches.filter((b) => !searchIds.has(b.id));

    return [...foundBatches, ...otherBatches];
  }, [batches, searchResults]);

  async function onSubmit(values: FormValues) {
    if (!selectedCompany?.slug) return;

    const formattedValues: FormValues & {
      caducate_date?: string;
      fabrication_date?: string;
      part_number: string;
      article_type: string;
      status: string;
      alternative_part_number?: string[];
      batch_name?: string;
      convertions?: UnitSelection[];
    } = {
      ...values,
      status: "CHECKING",
      part_number: normalizeUpper(values.part_number),
      article_type: "consumible",
      alternative_part_number:
        values.alternative_part_number?.map((v) => normalizeUpper(v)) ?? [],
      caducate_date: caducateDate
        ? format(caducateDate, "yyyy-MM-dd")
        : undefined,
      fabrication_date: fabricationDate
        ? format(fabricationDate, "yyyy-MM-dd")
        : undefined,
      batch_name: enableBatchNameEdit ? values.batch_name : undefined,
      // Incluir las unidades seleccionadas en el envío
      convertions: selectedUnits.length > 0 ? selectedUnits : undefined,
    };

    if (isEditing && initialData) {
      await updateArticle.mutateAsync({
        data: { ...formattedValues },
        id: initialData?.id,
        company: selectedCompany.slug,
      });
      router.push(`/${selectedCompany.slug}/almacen/inventario_articulos`);
    } else {
      await createArticle.mutateAsync({
        company: selectedCompany.slug,
        data: formattedValues,
      });
      form.reset();
      setFabricationDate(undefined);
      setCaducateDate(undefined);
      setSecondarySelected(null);
      setSecondaryQuantity(undefined);
      setSelectedUnits([]); // Limpiar unidades al crear
    }
  }

  /* -------------------------------- UI -------------------------------- */
  return (
    <>
      <Form {...form}>
        <form
          className="flex flex-col gap-6 max-w-7xl mx-auto"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {/* Encabezado */}
          <SectionCard title="Registrar consumible">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="part_number"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nro. de parte</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: 234ABAC"
                        {...field}
                        disabled={busy || isSearching}
                        onBlur={(e) => {
                          const normalized = normalizeUpper(e.target.value);
                          field.onChange(normalized);
                          // Iniciar búsqueda si hay un valor y no está editando
                          if (
                            normalized &&
                            normalized.length >= 2 &&
                            !isEditing
                          ) {
                            setPartNumberToSearch(normalized);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Identificador principal del artículo.
                      {isSearching && (
                        <span className="text-primary ml-2">Buscando...</span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lot_number"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nro. de lote</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: LOTE123"
                        {...field}
                        disabled={busy}
                      />
                    </FormControl>
                    <FormDescription>Lote del consumible.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3 w-full">
                <FormField
                  control={form.control}
                  name="batch_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-3 mt-1.5 w-full">
                      <FormLabel>Descripción de Consumible</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              disabled={
                                isBatchesLoading || isBatchesError || busy
                              }
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {isBatchesLoading && (
                                <Loader2 className="size-4 animate-spin mr-2" />
                              )}
                              {field.value ? (
                                <p className="truncate flex-1 text-left">
                                  {batchNameById.get(field.value) ?? ""}
                                </p>
                              ) : (
                                <span className="truncate">
                                  Elegir descripción...
                                </span>
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Command>
                            <CommandInput placeholder="Buscar descripción..." />
                            <CommandList>
                              <CommandEmpty className="text-xs p-2 text-center">
                                Sin resultados
                              </CommandEmpty>
                              {searchResults && searchResults.length > 0 && (
                                <CommandGroup heading="Coincidencias encontradas">
                                  {searchResults.map((batch) => (
                                    <CommandItem
                                      value={`${batch.name}`}
                                      key={batch.id}
                                      onSelect={() => {
                                        form.setValue(
                                          "batch_id",
                                          batch.id.toString(),
                                          { shouldValidate: true }
                                        );
                                        if (isEditing && enableBatchNameEdit) {
                                          form.setValue(
                                            "batch_name",
                                            batch.name,
                                            { shouldValidate: true }
                                          );
                                        }
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          `${batch.id}` === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      <p className="font-semibold text-primary">
                                        {batch.name}
                                      </p>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )}
                              <CommandGroup
                                heading={
                                  searchResults && searchResults.length > 0
                                    ? "Otras descripciones"
                                    : "Todas las descripciones"
                                }
                              >
                                {sortedBatches
                                  ?.filter(
                                    (batch) =>
                                      !searchResults?.some(
                                        (sr) => sr.id === batch.id
                                      )
                                  )
                                  .map((batch) => (
                                    <CommandItem
                                      value={`${batch.name}`}
                                      key={batch.id}
                                      onSelect={() => {
                                        form.setValue(
                                          "batch_id",
                                          batch.id.toString(),
                                          { shouldValidate: true }
                                        );
                                        if (isEditing && enableBatchNameEdit) {
                                          form.setValue(
                                            "batch_name",
                                            batch.name,
                                            { shouldValidate: true }
                                          );
                                        }
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          `${batch.id}` === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      <p>{batch.name}</p>
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Descripción del consumible a registrar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isEditing && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enable-batch-edit"
                        checked={enableBatchNameEdit}
                        onCheckedChange={(checked) =>
                          setEnableBatchNameEdit(checked as boolean)
                        }
                      />
                      <label
                        htmlFor="enable-batch-edit"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        ¿Modificar la descripción del artículo?
                      </label>
                    </div>
                    {enableBatchNameEdit && (
                      <FormField
                        control={form.control}
                        name="batch_name"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Nuevo nombre sugerido</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Escriba el nuevo nombre para la descripción"
                                {...field}
                                disabled={busy}
                              />
                            </FormControl>
                            <FormDescription>
                              Ingrese el nuevo nombre para esta descripción de
                              artículo.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </SectionCard>

          {/* Propiedades */}
          <SectionCard title="Propiedades">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="condition_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Condición</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isConditionsLoading || busy}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isConditionsLoading
                                ? "Cargando..."
                                : "Seleccione..."
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conditions?.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                        {isConditionsError && (
                          <div className="p-2 text-sm text-muted-foreground">
                            Error al cargar condiciones.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>Estado del artículo.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DatePickerField
                label="Fecha de Fabricación"
                value={fabricationDate}
                setValue={setFabricationDate}
                description="Fecha de creación del artículo."
                busy={busy}
                shortcuts="back"
              />

              <DatePickerField
                label="Fecha de Caducidad - Shelf-Life"
                value={caducateDate}
                setValue={setCaducateDate}
                description="Fecha límite del artículo."
                busy={busy}
                shortcuts="forward"
              />

              <FormField
                control={form.control}
                name="manufacturer_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <div className="flex items-center justify-between">
                      <FormLabel>Fabricante</FormLabel>
                      <CreateManufacturerDialog
                        defaultType="PART"
                        onSuccess={(manufacturer) => {
                          if (manufacturer?.id) {
                            form.setValue(
                              "manufacturer_id",
                              manufacturer.id.toString(),
                              { shouldValidate: true }
                            );
                          }
                        }}
                        triggerButton={
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Crear nuevo
                          </Button>
                        }
                      />
                    </div>
                    <Select
                      disabled={isManufacturerLoading || busy}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isManufacturerLoading
                                ? "Cargando..."
                                : "Seleccione..."
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {manufacturers
                          ?.filter((m) => m.type)
                          .map((m) => (
                            <SelectItem key={m.id} value={m.id.toString()}>
                              {m.name} ({m.type})
                            </SelectItem>
                          ))}
                        {isManufacturerError && (
                          <div className="p-2 text-sm text-muted-foreground">
                            Error al cargar fabricantes.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Marca específica del artículo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zone"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Ubicación interna</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Pasillo 4, repisa 3..."
                        {...field}
                        disabled={busy}
                      />
                    </FormControl>
                    <FormDescription>Zona física en almacén.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SectionCard>

          {/* Ingreso y cantidad */}
          <SectionCard title="Ingreso y cantidad">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Método de ingreso (conversiones secundarias) */}
              <div className="flex flex-col space-y-2 mt-2.5">
                <FormLabel>Método de ingreso</FormLabel>
                <Popover open={secondaryOpen} onOpenChange={setSecondaryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      disabled={secondaryUnitsLoading || busy}
                      variant="outline"
                      role="combobox"
                      aria-expanded={secondaryOpen}
                      className="justify-between"
                    >
                      {secondarySelected
                        ? `${secondarySelected.secondary_unit?.label ?? ""} ${
                            secondarySelected.secondary_unit
                              ? `(${secondarySelected.primary_unit.label})`
                              : secondarySelected.primary_unit.label
                          }`
                        : secondaryUnitsLoading
                          ? "Cargando..."
                          : "Seleccione..."}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar conversión..." />
                      <CommandList>
                        <CommandEmpty>
                          No existen conversiones disponibles.
                        </CommandEmpty>
                        <CommandGroup>
                          {secondaryUnits?.map((conversion) => (
                            <CommandItem
                              key={conversion.id}
                              value={conversion.id.toString()}
                              onSelect={(val) => {
                                const found =
                                  secondaryUnits.find(
                                    (conv) => conv.id.toString() === val
                                  ) || null;
                                setSecondarySelected(found);
                                setSecondaryOpen(false);

                                // Calcular cantidad inmediatamente al seleccionar
                                if (found && secondaryQuantity !== undefined) {
                                  calculateAndUpdateQuantity(
                                    secondaryQuantity,
                                    found
                                  );
                                }
                              }}
                            >
                              <span className="flex-1">
                                {conversion.secondary_unit?.label ||
                                  conversion.primary_unit.label}
                                {conversion.secondary_unit && (
                                  <span className="text-muted-foreground">
                                    {" "}
                                    ({conversion.primary_unit.label})
                                  </span>
                                )}
                                {!conversion.secondary_unit && (
                                  <span className="text-muted-foreground text-xs ml-2">
                                  </span>
                                )}
                              </span>
                              <Check
                                className={cn(
                                  "ml-2",
                                  secondarySelected?.id.toString() ===
                                    conversion.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-muted-foreground">
                  Seleccione una conversión para el ingreso del artículo.
                </p>
              </div>

              {/* Cantidad */}
              <div className="space-y-2">
                <FormLabel>Cantidad</FormLabel>
                <Input
                  type="number"
                  inputMode="decimal"
                  disabled={busy}
                  min="0"
                  value={secondaryQuantity ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;

                    // Manejar cuando el input está vacío
                    if (value === "") {
                      setSecondaryQuantity(undefined);
                      calculateAndUpdateQuantity(undefined, secondarySelected);
                      return;
                    }

                    const n = parseFloat(value);
                    if (!Number.isNaN(n) && n < 0) return;

                    const newQuantity = Number.isNaN(n) ? undefined : n;
                    setSecondaryQuantity(newQuantity);

                    // Calcular en tiempo real
                    calculateAndUpdateQuantity(newQuantity, secondarySelected);
                  }}
                  placeholder="Ej: 2, 4, 6..."
                />
                <p className="text-sm text-muted-foreground">
                  Cantidad según método de ingreso seleccionado.
                </p>
              </div>

              {/* Cantidad resultante - CONDICIONAL */}
              {showResultQuantity ? (
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Cantidad resultante</FormLabel>
                      <FormControl>
                        <Input
                          disabled
                          type="number"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {secondarySelected
                          ? `Equivalente en ${secondarySelected.primary_unit.label}`
                          : "Unidades base que se registrarán."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                // Espacio vacío para mantener el layout cuando está oculto
                <div className="w-full"></div>
              )}

              {/* Cantidad mínima */}
              <FormField
                control={form.control}
                name="min_quantity"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Cantidad Mínima</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Ej: 5"
                        {...field}
                        disabled={busy}
                        onChange={(e) => {
                          const n = parseFloat(e.target.value);
                          if (!Number.isNaN(n) && n < 0) return;
                          field.onChange(e.target.value === "" ? undefined : n);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Cantidad mínima de stock para alertas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botón para configurar conversiones adicionales */}
              <div className="col-span-1 md:col-span-2 xl:col-span-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUnitsModalOpen(true)}
                  disabled={busy || !secondaryUnits?.length}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Configurar Conversiones Adicionales
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedUnits.length > 0
                    ? `${selectedUnits.length} conversión(es) configurada(s) - ${selectedUnits.filter((u) => u.is_main_unit).length} primaria(s)`
                    : "Configure conversiones de unidades adicionales para este artículo"}
                </p>
              </div>

              {/* Establecer conversión actual como primaria */}
              <FormItem className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={
                      secondarySelected
                        ? selectedUnits.some(
                            (unit) =>
                              unit.convertion_id === secondarySelected.id &&
                              unit.is_main_unit
                          )
                        : false
                    }
                    onCheckedChange={(checked) => {
                      if (checked && secondarySelected) {
                        // Agregar la conversión actual como primaria
                        const newUnit: UnitSelection = {
                          convertion_id: secondarySelected.id,
                          is_main_unit: true,
                        };

                        // Quitar primaria de las demás y agregar esta
                        const updatedUnits = selectedUnits
                          .filter(
                            (unit) =>
                              unit.convertion_id !== secondarySelected.id
                          )
                          .map((unit) => ({ ...unit, is_main_unit: false }));

                        updatedUnits.push(newUnit);
                        setSelectedUnits(updatedUnits);
                      } else if (!checked && secondarySelected) {
                        // Remover la conversión actual si está desmarcada
                        const updatedUnits = selectedUnits.filter(
                          (unit) => unit.convertion_id !== secondarySelected.id
                        );
                        setSelectedUnits(updatedUnits);
                      }
                    }}
                    disabled={!secondarySelected}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Establecer la conversión actual como primaria
                  </FormLabel>
                  <FormDescription>
                    {secondarySelected
                      ? `La conversión "${secondarySelected.secondary_unit?.label || secondarySelected.primary_unit.label}" ${selectedUnits.some((unit) => unit.convertion_id === secondarySelected.id && unit.is_main_unit) ? "está establecida" : "se establecerá"} como primaria para despacho.`
                      : "Seleccione primero una conversión de ingreso para establecerla como primaria."}
                  </FormDescription>
                </div>
              </FormItem>
            </div>
          </SectionCard>

          {/* Detalles y archivos */}
          <SectionCard title="Detalles y documentos">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detalles/Observaciones</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Ej: Fluido hidráulico MIL-PRF-83282..."
                        {...field}
                        disabled={busy}
                      />
                    </FormControl>
                    <FormDescription>
                      Observaciones sobre el artículo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileField
                  form={form}
                  name="image"
                  label="Imagen del artículo"
                  accept="image/*"
                  description="Imagen descriptiva."
                  busy={busy}
                />

                <div className="space-y-4">
                  <FileField
                    form={form}
                    name="certificate_8130"
                    label={
                      <span>
                        Certificado{" "}
                        <span className="text-primary font-semibold">8130</span>
                      </span>
                    }
                    description="PDF o imagen. Máx. 10 MB."
                    busy={busy}
                  />
                  <FileField
                    form={form}
                    name="certificate_fabricant"
                    label={
                      <span>
                        Certificado del{" "}
                        <span className="text-primary">fabricante</span>
                      </span>
                    }
                    description="PDF o imagen. Máx. 10 MB."
                    busy={busy}
                  />
                  <FileField
                    form={form}
                    name="certificate_vendor"
                    label={
                      <span>
                        Certificado del{" "}
                        <span className="text-primary">vendedor</span>
                      </span>
                    }
                    description="PDF o imagen. Máx. 10 MB."
                    busy={busy}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            <Button
              className="bg-primary text-white hover:bg-blue-900 disabled:bg-slate-100 disabled:text-slate-400"
              disabled={
                busy ||
                !selectedCompany ||
                !form.getValues("part_number") ||
                !form.getValues("batch_id")
              }
              type="submit"
            >
              {busy ? (
                <Image
                  className="text-black"
                  src={loadingGif}
                  width={170}
                  height={170}
                  alt="Cargando..."
                />
              ) : (
                <span>
                  {isEditing ? "Confirmar ingreso" : "Crear artículo"}
                </span>
              )}
            </Button>

            {busy && (
              <div className="inline-flex items-center text-sm text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando…
              </div>
            )}
          </div>
        </form>
      </Form>

      {/* Modal de Configuración de Conversiones */}
      <UnitsModal
        open={unitsModalOpen}
        onOpenChange={setUnitsModalOpen}
        secondaryUnits={secondaryUnits || []}
        selectedUnits={selectedUnits}
        onSelectedUnitsChange={setSelectedUnits}
      />
    </>
  );
}
