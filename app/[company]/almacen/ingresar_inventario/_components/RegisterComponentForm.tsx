"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { addYears, format, subYears } from "date-fns";
import { es } from "date-fns/locale";

import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  FileUpIcon,
  Loader2,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Separator } from "@/components/ui/separator";

import {
  useConfirmIncomingArticle,
  useCreateArticle,
  useUpdateArticle,
} from "@/actions/mantenimiento/almacen/inventario/articulos/actions";

import { useGetConditions } from "@/hooks/administracion/useGetConditions";
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";
import { useGetBatchesByCategory } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByCategory";
import { useSearchBatchesByPartNumber } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByArticlePartNumber";

import { useCompanyStore } from "@/stores/CompanyStore";

import { cn } from "@/lib/utils";
import loadingGif from "@/public/loading2.gif";
import { toast } from "sonner";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MultiInputField } from "@/components/misc/MultiInputField";
import { Textarea } from "@/components/ui/textarea";
import { EditingArticle } from "./RegisterArticleForm";
import { CreateManufacturerDialog } from "@/components/dialogs/general/CreateManufacturerDialog";
import { CreateBatchDialog } from "@/components/dialogs/mantenimiento/almacen/CreateBatchDialog";
import { MultiSerialInput } from "./MultiSerialInput";

/* ------------------------------- Schema ------------------------------- */

const fileMaxBytes = 10_000_000; // 10 MB

const formSchema = z
  .object({
    serial: z
      .array(
        z.string().min(2, {
          message: "Cada serial debe contener al menos 2 caracteres.",
        })
      )
      .optional(),
    part_number: z
      .string({ message: "Debe seleccionar un número de parte." })
      .min(2, {
        message: "El número de parte debe contener al menos 2 caracteres.",
      }),
    alternative_part_number: z
      .array(
        z.string().min(2, {
          message:
            "Cada número de parte alterno debe contener al menos 2 caracteres.",
        })
      )
      .optional(),
    description: z.string().optional(),
    batch_name: z.string().optional(),
    zone: z
      .string({ message: "Debe ingresar la ubicación del artículo." })
      .min(1, "Campo requerido"),
    caducate_date: z.string().optional(),
    fabrication_date: z.string().optional(),
    calendar_date: z.string().optional(),
    cost: z.string().optional(),
    hour_date: z.coerce
      .number({ required_error: "Ingrese las horas máximas." })
      .min(0, "No puede ser negativo")
      .optional(),
    cycle_date: z.coerce
      .number({ required_error: "Ingrese los ciclos máximos." })
      .min(0, "No puede ser negativo")
      .optional(),
    manufacturer_id: z.string().optional(),
    condition_id: z.string().min(1, "Debe ingresar la condición del artículo."),
    batch_id: z
      .string({ message: "Debe ingresar un lote." })
      .min(1, "Seleccione un lote"),
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
    has_documentation: z.boolean().optional(),
  })
  .superRefine((vals, ctx) => {
    if (vals.fabrication_date && vals.caducate_date) {
      if (vals.fabrication_date > vals.caducate_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "La fecha de fabricación no puede ser posterior a la fecha de caducidad.",
          path: ["fabrication_date"],
        });
      }
    }
  });

export type FormValues = z.infer<typeof formSchema>;

/* ----------------------------- Componente ----------------------------- */

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export default function CreateComponentForm({
  initialData,
  isEditing,
}: {
  initialData?: EditingArticle;
  isEditing?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedCompany, selectedStation } = useCompanyStore();

  // Local state for part number search
  const [partNumberToSearch, setPartNumberToSearch] = useState<string | undefined>(undefined);

  // Local UI state for calendars
  const [fabricationDate, setFabricationDate] = useState<Date | null | undefined>(
    initialData?.component?.shell_time?.fabrication_date
      ? new Date(initialData.component.shell_time.fabrication_date)
      : null // Por defecto "No aplica" (muy pocos componentes tienen esta fecha)
  );
  const [caducateDate, setCaducateDate] = useState<Date | null | undefined>(
    initialData?.component?.shell_time?.caducate_date
      ? new Date(initialData.component.shell_time.caducate_date)
      : null // Por defecto "No aplica" (componentes nuevos o sin fecha)
  );
  const [enableBatchNameEdit, setEnableBatchNameEdit] = useState(false);

  // Wrapper functions for DatePickerField compatibility
  const handleFabricationDateChange = (d?: Date | null) => {
    // Preserve null value to indicate "Not applicable"
    if (d === null) {
      setFabricationDate(null);
    } else if (d === undefined) {
      setFabricationDate(undefined);
    } else {
      setFabricationDate(d);
    }
  };
  const handleCaducateDateChange = (d?: Date | null) => {
    // Preserve null value to indicate "Not applicable"
    if (d === null) {
      setCaducateDate(null);
    } else if (d === undefined) {
      setCaducateDate(undefined);
    } else {
      setCaducateDate(d);
    }
  };

  // Data hooks
  const {
    data: batches,
    isPending: isBatchesLoading,
    isError: isBatchesError,
    refetch: refetchBatches,
  } = useGetBatchesByCategory("componente");

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

  // Search batches by part number
  const { data: searchResults, isFetching: isSearching } = useSearchBatchesByPartNumber(
    selectedCompany?.slug,
    selectedStation || undefined,
    partNumberToSearch,
    "COMPONENTE"
  );

  // Mutations
  const { createArticle } = useCreateArticle();
  const { updateArticle } = useUpdateArticle();
  const { confirmIncoming } = useConfirmIncomingArticle();

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      part_number: initialData?.part_number || "",
      serial: initialData?.serial ? (Array.isArray(initialData.serial) ? initialData.serial : [initialData.serial]) : [],
      alternative_part_number: initialData?.alternative_part_number || [],
      batch_id: initialData?.batches?.id?.toString() || "",
      batch_name: initialData?.batches?.name || "",
      manufacturer_id: initialData?.manufacturer?.id?.toString() || "",
      condition_id: initialData?.condition?.id?.toString() || "",
      description: initialData?.description || "",
      zone: initialData?.zone || "",
      hour_date: initialData?.component?.hard_time?.hour_date
        ? parseInt(initialData.component.hard_time.hour_date)
        : undefined,
      cycle_date: initialData?.component?.hard_time?.cycle_date
        ? parseInt(initialData.component.hard_time.cycle_date)
        : undefined,
      caducate_date: initialData?.component?.shell_time?.caducate_date
        ? initialData?.component?.shell_time?.caducate_date
        : undefined,
      fabrication_date: initialData?.component?.shell_time?.fabrication_date
        ? initialData?.component?.shell_time?.fabrication_date
        : undefined,
      has_documentation: initialData?.has_documentation ?? false,
    },
    mode: "onBlur",
  });

  // Watch para el campo de documentación
  const hasDocumentation = form.watch("has_documentation");

  // Reset on prop change
  useEffect(() => {
    if (!initialData) return;
    form.reset({
      part_number: initialData.part_number ?? "",
      serial: initialData.serial ? (Array.isArray(initialData.serial) ? initialData.serial : [initialData.serial]) : [],
      alternative_part_number: initialData.alternative_part_number ?? [],
      batch_id: initialData.batches?.id?.toString() ?? "",
      batch_name: initialData.batches?.name ?? "",
      manufacturer_id: initialData.manufacturer?.id?.toString() ?? "",
      condition_id: initialData.condition?.id?.toString() ?? "",
      description: initialData.description ?? "",
      zone: initialData.zone ?? "",
      hour_date: initialData.component?.hard_time?.hour_date
        ? parseInt(initialData.component.hard_time.hour_date)
        : undefined,
      cycle_date: initialData.component?.hard_time?.cycle_date
        ? parseInt(initialData.component.hard_time.cycle_date)
        : undefined,
      caducate_date: initialData.component?.shell_time?.caducate_date
        ? initialData.component?.shell_time?.caducate_date
        : undefined,
      fabrication_date: initialData.component?.shell_time?.fabrication_date
        ? initialData.component?.shell_time?.fabrication_date
        : undefined,
      has_documentation: initialData.has_documentation ?? false,
    });
  }, [initialData, form]);

  // Autocompletar descripción cuando encuentra resultados de búsqueda
  useEffect(() => {
    if (searchResults && searchResults.length > 0 && !isEditing) {
      const firstResult = searchResults[0];
      form.setValue("batch_id", firstResult.id.toString(), { shouldValidate: true });
      
      // Notificar al usuario
      if (searchResults.length === 1) {
        console.log("✓ Descripción autocompletada");
      } else {
        console.log(`✓ Se encontraron ${searchResults.length} descripciones. Se seleccionó la primera.`);
      }
    } else if (searchResults && searchResults.length === 0 && partNumberToSearch) {
      console.log("No se encontraron descripciones para este part number");
    }
  }, [searchResults, form, isEditing, partNumberToSearch]);

  const busy =
    isBatchesLoading ||
    isManufacturerLoading ||
    isConditionsLoading ||
    createArticle.isPending ||
    confirmIncoming.isPending ||
    updateArticle.isPending;

  const normalizeUpper = (s?: string) => s?.trim().toUpperCase() ?? "";

  // Derived lookups
  const batchNameById = useMemo(() => {
    const map = new Map<string, string>();
    batches?.forEach((b) => map.set(String(b.id), b.name));
    return map;
  }, [batches]);

  // Ordenar batches: primero los resultados de búsqueda, luego el resto
  const sortedBatches = useMemo(() => {
    if (!batches) return [];
    if (!searchResults || searchResults.length === 0) return batches;
    
    const searchIds = new Set(searchResults.map(r => r.id));
    const foundBatches = batches.filter(b => searchIds.has(b.id));
    const otherBatches = batches.filter(b => !searchIds.has(b.id));
    
    return [...foundBatches, ...otherBatches];
  }, [batches, searchResults]);

  async function onSubmit(values: FormValues) {
    if (!selectedCompany?.slug) return;

    // Validar que el campo de fecha de caducidad esté completado (debe tener fecha o estar marcado como N/A)
    if (caducateDate === undefined) {
      return; // El botón debería estar deshabilitado, pero por seguridad validamos aquí también
    }

    const { caducate_date: _, ...valuesWithoutCaducateDate } = values;
    const caducateDateStr: string | undefined = caducateDate && caducateDate !== null ? format(caducateDate, "yyyy-MM-dd") : undefined;
    
    // Transformar serial: si hay 1 serial -> string, si hay 2+ -> array
    const serialValue = values.serial && values.serial.length > 0 
      ? (values.serial.length === 1 ? values.serial[0] : values.serial)
      : undefined;
    
    const formattedValues: Omit<FormValues, 'caducate_date' | 'serial'> & {
      caducate_date?: string;
      fabrication_date?: string;
      calendar_date?: string;
      part_number: string;
      status: string;
      article_type: string;
      alternative_part_number?: string[];
      batch_name?: string;
      batch_id: string; // Asegurar que batch_id esté en el tipo
      serial?: string | string[];
    } = {
      ...valuesWithoutCaducateDate,
      status: "CHECKING",
      article_type: "componente",
      part_number: normalizeUpper(values.part_number),
      alternative_part_number:
        values.alternative_part_number?.map((v) => normalizeUpper(v)) ?? [],
      serial: serialValue,
      caducate_date: caducateDateStr,
      fabrication_date: fabricationDate && fabricationDate !== null ? format(fabricationDate, "yyyy-MM-dd") : undefined,
      calendar_date: values.calendar_date && format(values.calendar_date, "yyyy-MM-dd"),
      batch_name: enableBatchNameEdit ? values.batch_name : undefined,
      batch_id: values.batch_id, // Incluir explícitamente el batch_id del formulario
    };

    if (isEditing && initialData) {
      // Lógica según el checkbox:
      // - Si enableBatchNameEdit está marcado: enviar batch_name (modifica el batch para todos los artículos)
      // - Si NO está marcado: solo enviar batch_id (reasigna solo este artículo a otro batch)
      const updateData: any = {
        ...formattedValues,
        article_type: "componente",
      };
      
      if (enableBatchNameEdit) {
        // Modificar el nombre del batch (afecta a todos los artículos del batch)
        if (!values.batch_name) {
          toast.error("Error", {
            description: "Debe ingresar un nuevo nombre para la descripción.",
          });
          return;
        }
        updateData.batch_name = values.batch_name;
        // Mantener el batch_id original para que el backend sepa qué batch modificar
        updateData.batch_id = initialData.batches?.id?.toString() || values.batch_id;
      } else {
        // Solo reasignar este artículo a otro batch (NO afecta a otros artículos)
        if (!values.batch_id) {
          toast.error("Error", {
            description: "Debe seleccionar una descripción de componente.",
          });
          return;
        }
        updateData.batch_id = values.batch_id;
        // NO enviar batch_name cuando solo se está reasignando
        delete updateData.batch_name;
      }
          
      await updateArticle.mutateAsync({
        data: updateData,
        company: selectedCompany.slug,
        id: initialData.id,
      });
      // Esperar un momento para que las queries se invaliden antes de redirigir
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push(`/${selectedCompany.slug}/ingenieria/confirmar_inventario`);
      router.refresh(); // Forzar refresco de la página
    } else {
      await createArticle.mutateAsync({
        company: selectedCompany.slug,
        data: formattedValues,
      });
      form.reset();
      setFabricationDate(null); // Restablecer a "No aplica" por defecto
      setCaducateDate(null); // Restablecer a "No aplica" por defecto
    }
  }

  /* ---------------------------- Reusables ---------------------------- */
  function FileField({
    name,
    label,
    accept = ".pdf,image/*",
    description,
  }: {
    name: keyof FormValues;
    label: string;
    accept?: string;
    description?: string;
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
            {description ? <FormDescription>{description}</FormDescription> : null}
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
    goBackYears = [5, 10, 15],
    goForwardYears = [],
    description,
    maxYear,
    showNotApplicable = false,
    required = false,
    error,
  }: {
    label: string;
    value?: Date | null;
    setValue: (d?: Date | null) => void;
    goBackYears?: number[];
    goForwardYears?: number[];
    description?: string;
    /** Año máximo permitido. Si no se especifica, será el año actual + 20 */
    maxYear?: number;
    /** Mostrar botón "No aplica" */
    showNotApplicable?: boolean;
    /** Campo obligatorio */
    required?: boolean;
    /** Mensaje de error */
    error?: string;
  }) {
    const isInvalid = required && value === undefined;
    const displayError = error || (isInvalid ? "Este campo es obligatorio. Debe seleccionar una fecha o marcar 'No aplica'." : undefined);

    return (
      <FormItem className="flex flex-col p-0 mt-2.5 w-full">
        <FormLabel>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </FormLabel>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  disabled={busy || (showNotApplicable && value === null)}
                  className={cn(
                    "flex-1 pl-3 text-left font-normal",
                    (!value || value === null) && "text-muted-foreground",
                    isInvalid && "border-destructive"
                  )}
                >
                  {value === null ? (
                    <span>N/A</span>
                  ) : value ? (
                    format(value, "PPP", { locale: es })
                  ) : (
                    <span>Seleccione una fecha</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0 z-[100]" 
              align="start"
              side="bottom"
              sideOffset={8}
              avoidCollisions={true}
            >
              <Calendar 
                locale={es} 
                mode="single" 
                selected={value || undefined} 
                onSelect={setValue} 
                initialFocus 
                defaultMonth={value || new Date()}
                captionLayout="dropdown-buttons"
                fromYear={1900}
                toYear={maxYear ?? new Date().getFullYear() + 20}
                classNames={{
                  caption_label: "hidden",
                  caption: "flex justify-center pt-1 relative items-center mb-2",
                  caption_dropdowns: "flex justify-center gap-2 items-center",
                  nav: "hidden",
                  nav_button: "hidden",
                  nav_button_previous: "hidden",
                  nav_button_next: "hidden",
                }}
                components={{
                  Dropdown: (props) => (
                    <select
                      {...props}
                      className="h-9 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors cursor-pointer"
                    >
                      {props.children}
                    </select>
                  ),
                }}
              />
            </PopoverContent>
          </Popover>
          {showNotApplicable && (
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Checkbox
                id={`not-applicable-${label.replace(/\s+/g, '-').toLowerCase()}`}
                checked={value === null}
                onCheckedChange={(checked) => {
                  if (checked === true) {
                    setValue(null);
                  } else {
                    setValue(undefined);
                  }
                }}
                disabled={busy}
              />
              <label
                htmlFor={`not-applicable-${label.replace(/\s+/g, '-').toLowerCase()}`}
                className="text-sm font-medium leading-none cursor-pointer whitespace-nowrap select-none"
              >
                No aplica
              </label>
            </div>
          )}
        </div>
        {description ? <FormDescription>{description}</FormDescription> : null}
        {displayError && (
          <p className="text-sm font-medium text-destructive mt-1">{displayError}</p>
        )}
        <FormMessage />
      </FormItem>
    );
  }

  /* -------------------------------- UI -------------------------------- */
  return (
    <Form {...form}>
      <form className="flex flex-col gap-6 max-w-7xl mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Encabezado */}
        <SectionCard title="Registrar componente">
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
                        if (normalized && normalized.length >= 2 && !isEditing) {
                          setPartNumberToSearch(normalized);
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Identificador principal del artículo.
                    {isSearching && <span className="text-primary ml-2">Buscando...</span>}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alternative_part_number"
              render={({ field }) => (
                <FormItem >
                  <FormControl>
                    <MultiInputField
                      values={field.value || []}
                      onChange={(vals) => field.onChange(vals.map((v: string) => normalizeUpper(v)))}
                      placeholder="Ej: 234ABAC"
                    />
                  </FormControl>
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Descripción de Componente</FormLabel>
                      <CreateBatchDialog
                        onSuccess={async (batchName) => {
                          // Invalidar la query y refetch para obtener el batch recién creado
                          await queryClient.invalidateQueries({ 
                            queryKey: ["search-batches", selectedCompany?.slug, selectedStation, "componente"] 
                          });
                          const { data: updatedBatches } = await refetchBatches();
                          const newBatch = updatedBatches?.find((b: any) => b.name === batchName);
                          if (newBatch) {
                            form.setValue("batch_id", newBatch.id.toString(), { shouldValidate: true });
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            disabled={isBatchesLoading || isBatchesError || busy}
                            variant="outline"
                            role="combobox"
                            className={cn("justify-between", !field.value && "text-muted-foreground")}
                          >
                            {isBatchesLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                            {field.value ? (
                              <p className="truncate flex-1 text-left">{batchNameById.get(field.value) ?? ""}</p>
                            ) : (
                              <span className="truncate">Elegir descripción...</span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Buscar descripción..." />
                          <CommandList>
                            <CommandEmpty className="text-xs p-2 text-center">Sin resultados</CommandEmpty>
                            {searchResults && searchResults.length > 0 && (
                              <CommandGroup heading="Coincidencias encontradas">
                                {searchResults.map((batch) => (
                                  <CommandItem
                                    value={`${batch.name}`}
                                    key={batch.id}
                                    onSelect={() => {
                                      form.setValue("batch_id", batch.id.toString(), { shouldValidate: true });
                                      if (isEditing && enableBatchNameEdit) {
                                        form.setValue("batch_name", batch.name, { shouldValidate: true });
                                      }
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", `${batch.id}` === field.value ? "opacity-100" : "opacity-0")} />
                                    <p className="font-semibold text-primary">{batch.name}</p>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                            <CommandGroup heading={searchResults && searchResults.length > 0 ? "Otras descripciones" : "Todas las descripciones"}>
                              {sortedBatches
                                ?.filter(batch => !searchResults?.some(sr => sr.id === batch.id))
                                .map((batch) => (
                                  <CommandItem
                                    value={`${batch.name}`}
                                    key={batch.id}
                                    onSelect={() => {
                                      form.setValue("batch_id", batch.id.toString(), { shouldValidate: true });
                                      if (isEditing && enableBatchNameEdit) {
                                        form.setValue("batch_name", batch.name, { shouldValidate: true });
                                      }
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", `${batch.id}` === field.value ? "opacity-100" : "opacity-0")} />
                                    <p>{batch.name}</p>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Descripción del componente a registrar.</FormDescription>
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
                      onCheckedChange={(checked) => setEnableBatchNameEdit(checked as boolean)}
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
                          <FormDescription>Ingrese el nuevo nombre para esta descripción de artículo.</FormDescription>
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

        {/* Identificación y estado */}
        <SectionCard title="Identificación y estado">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="serial"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Serial</FormLabel>
                  <FormControl>
                    <MultiSerialInput
                      values={field.value || []}
                      onChange={field.onChange}
                      disabled={busy}
                      placeholder="Ej: 05458E1"
                    />
                  </FormControl>
                  <FormDescription>Serial del componente si aplica.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Condición</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isConditionsLoading || busy}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isConditionsLoading ? "Cargando..." : "Seleccione..."} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {conditions?.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                      {isConditionsError && (
                        <div className="p-2 text-sm text-muted-foreground">Error al cargar condiciones.</div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>Estado físico/operativo del artículo.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
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
                          form.setValue("manufacturer_id", manufacturer.id.toString(), { shouldValidate: true });
                        }
                      }}
                      triggerButton={
                        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs">
                          <Plus className="h-3 w-3 mr-1" />
                          Crear nuevo
                        </Button>
                      }
                    />
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={isManufacturerLoading || isManufacturerError || busy}
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {isManufacturerLoading && (
                            <Loader2 className="size-4 animate-spin mr-2" />
                          )}
                          {field.value ? (
                            <p>
                              {
                                manufacturers
                                  ?.filter((m) => m.type)
                                  .find((m) => `${m.id}` === field.value)
                                  ?.name
                              }
                            </p>
                          ) : (
                            "Seleccione fabricante..."
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar fabricante..." />
                        <CommandList>
                          <CommandEmpty className="text-xs p-2 text-center">
                            No se encontró el fabricante.
                          </CommandEmpty>
                          <CommandGroup>
                            {manufacturers
                              ?.filter((m) => m.type)
                              .map((manufacturer) => (
                                <CommandItem
                                  value={`${manufacturer.name}`}
                                  key={manufacturer.id}
                                  onSelect={() => {
                                    form.setValue(
                                      "manufacturer_id",
                                      manufacturer.id.toString(),
                                      { shouldValidate: true }
                                    );
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      `${manufacturer.id}` === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <p>{manufacturer.name} ({manufacturer.type})</p>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Marca del artículo.</FormDescription>
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
                    <Input placeholder="Ej: Pasillo 4, Estante B" {...field} disabled={busy} />
                  </FormControl>
                  <FormDescription>Zona física en almacén.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </SectionCard>

        {/* Fechas y límites */}
        <SectionCard title="Fechas del Componente">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePickerField
              label="Fecha de Fabricación"
              value={fabricationDate}
              setValue={handleFabricationDateChange}
              goBackYears={[5, 10, 15]}
              description="Fecha de fabricación del Componente."
              maxYear={new Date().getFullYear()}
              showNotApplicable={true}
            />

            <DatePickerField
              label="Fecha de Shelf-Life"
              value={caducateDate}
              setValue={handleCaducateDateChange}
              goForwardYears={[5, 10, 15]}
              description="Fecha límite que debe cumplir el Componente almacenado."
              showNotApplicable={true}
              required={true}
            />
          </div>
        </SectionCard>

        {/* Descripción y archivos */}
        <SectionCard title="Detalles y documentos">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="Ej: Motor V8 de..." {...field} disabled={busy} />
                  </FormControl>
                  <FormDescription>Breve descripción del artículo.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="has_documentation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={busy}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>¿El artículo tiene documentación?</FormLabel>
                    <FormDescription>
                      Marque esta casilla si el artículo cuenta con documentación (certificados, imágenes, etc.).
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {hasDocumentation && (
              <>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileField name="image" label="Imagen del artículo" accept="image/*" description="Imagen descriptiva." />

                  <div className="space-y-4">
                    <FileField name="certificate_8130" label={<span>Certificado <span className="text-primary font-semibold">8130</span></span> as any} description="PDF o imagen. Máx. 10 MB." />
                    <FileField name="certificate_fabricant" label={<span>Certificado del <span className="text-primary">fabricante</span></span> as any} description="PDF o imagen. Máx. 10 MB." />
                    <FileField name="certificate_vendor" label={<span>Certificado del <span className="text-primary">vendedor</span></span> as any} description="PDF o imagen. Máx. 10 MB." />
                  </div>
                </div>
              </>
            )}
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
              !form.getValues("batch_id") ||
              caducateDate === undefined
            }
            type="submit"
          >
            {busy ? (
              <Image className="text-black" src={loadingGif} width={170} height={170} alt="Cargando..." />
            ) : (
              <span>{isEditing ? "Confirmar ingreso" : "Crear artículo"}</span>
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
  );
}
