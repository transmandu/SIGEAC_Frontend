"use client";

import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { format, parseISO } from "date-fns";

import { Check, ChevronsUpDown, FileUpIcon, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { useSearchBatchesByPartNumber } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByArticlePartNumber";
import { useGetBatchesByCategory } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByCategory";
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";

import { useCompanyStore } from "@/stores/CompanyStore";

import { cn } from "@/lib/utils";
import loadingGif from "@/public/loading2.gif";
import { toast } from "sonner";

import { CreateManufacturerDialog } from "@/components/dialogs/general/CreateManufacturerDialog";
import { CreateResguardoAircraftDialog } from "@/components/dialogs/mantenimiento/aeronaves/CreateResguardoAircraftDialog";
import { CreateBatchDialog } from "@/components/dialogs/mantenimiento/almacen/CreateBatchDialog";
import PreviewCreateComponentDialog from "@/components/dialogs/mantenimiento/almacen/PreviewCreateComponentDialog";
import { MultiInputField } from "@/components/misc/MultiInputField";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { SectionCard } from "@/components/ui/SectionCard";
import { Textarea } from "@/components/ui/textarea";
import { MultiSerialInput } from "./MultiSerialInput";
import { EditingArticle } from "./RegisterArticleForm";
import { useAuth } from "@/contexts/AuthContext";

/* ------------------------------- Schema ------------------------------- */

const fileMaxBytes = 10_000_000; // 10 MB

const formSchema = z
  .object({
    serial: z
      .array(
        z.string().min(1, {
          message: "El serial debe contener al menos 1 caracter.",
        }),
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
        }),
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
    aircraft_id: z.string().optional(),
    life_limit_part_hours: z.coerce
      .number({ invalid_type_error: "Debe ingresar una cantidad numérica" })
      .min(0, { message: "No puede ser negativo." })
      .optional()
      .or(z.literal("").transform(() => undefined)),
    life_limit_part_cycles: z.coerce
      .number({ invalid_type_error: "Debe ingresar una cantidad numérica" })
      .min(0, { message: "No puede ser negativo." })
      .optional()
      .or(z.literal("").transform(() => undefined)),
    life_limit_part_calendar: z.string().optional(),
    shelf_life: z.coerce
      .number({ invalid_type_error: "Debe ingresar una cantidad numérica" })
      .int({ message: "Debe ser un número entero " }) // <--- Restricción de enteros
      .min(0, { message: "No puede ser negativo." })
      .optional()
      .or(z.literal("").transform(() => undefined)),
    shelf_life_unit: z.string().optional(),
    inspector: z.string().optional(),
    ata_code: z.string().optional(),
    inspect_date: z.string().optional(),
    hard_time_hours: z.coerce
      .number({ invalid_type_error: "Debe ingresar una cantidad numérica" })
      .min(0, { message: "No puede ser negativo." })
      .optional()
      .or(z.literal("").transform(() => undefined)),
    hard_time_cycles: z.coerce
      .number({ invalid_type_error: "Debe ingresar una cantidad numérica" })
      .min(0, { message: "No puede ser negativo." })
      .optional()
      .or(z.literal("").transform(() => undefined)),
    hard_time_calendar: z.string().optional(),
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

interface PreviewValues extends FormValues {
  batch_name?: string;
  condition_name?: string;
  manufacturer_name?: string;
  serial: string[]; // aseguramos que siempre sea array para el preview
}

/* ----------------------------- Componente ----------------------------- */

export default function CreatePartForm({
  initialData,
  isEditing,
}: {
  initialData?: EditingArticle;
  isEditing?: boolean;
}) {
  const { user } = useAuth();
  const userRoles = user?.roles?.map((role) => role.name) || [];
  const isEngineering = userRoles.some((role) =>
    ["ENGINEERING", "SUPERUSER"].includes(role),
  );

  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedCompany, selectedStation } = useCompanyStore();

  // Local state for part number search
  const [partNumberToSearch, setPartNumberToSearch] = useState<
    string | undefined
  >(undefined);

  // Local UI state for calendars
  const [fabricationDate, setFabricationDate] = useState<
    Date | null | undefined
  >(
    initialData?.part_component?.fabrication_date
      ? parseISO(initialData.part_component.fabrication_date)
      : null, // Por defecto "No aplica" (muy pocos componentes tienen esta fecha)
  );

  const [caducateDate, setCaducateDate] = useState<Date | null | undefined>(
    initialData?.part_component?.caducate_date
      ? parseISO(initialData.part_component.caducate_date)
      : null, // Por defecto "No aplica" (componentes nuevos o sin fecha)
  );

  const [inspectDate, setInspectDate] = useState<Date | null | undefined>(
    initialData?.inspect_date
      ? parseISO(initialData.inspect_date)
      : null, // Por defecto "No aplica" (componentes nuevos o sin fecha)
  );

  const [lifeLimitPartCalendar, setLifeLimitPartCalendar] = useState<
    Date | null | undefined
  >(
    initialData?.part_component?.life_limit_part_calendar
      ? parseISO(initialData.part_component.life_limit_part_calendar)
      : null, // Por defecto "No aplica" (componentes nuevos o sin fecha)
  );

  const [hardTimeCalendar, setHardTimeCalendar] = useState<
    Date | null | undefined
  >(
    initialData?.part_component?.hard_time_calendar
      ? parseISO(initialData.part_component.hard_time_calendar)
      : null, // Por defecto "No aplica" (componentes nuevos o sin fecha)
  );

  const [enableBatchNameEdit, setEnableBatchNameEdit] = useState(false);

  // Data hooks
  const {
    data: batches,
    isPending: isBatchesLoading,
    isError: isBatchesError,
    refetch: refetchBatches,
  } = useGetBatchesByCategory("PART");

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

  const { data: aircrafts, isLoading: isAircraftsLoading } =
    useGetMaintenanceAircrafts(selectedCompany?.slug);

  // Search batches by part number
  const { data: searchResults, isFetching: isSearching } =
    useSearchBatchesByPartNumber(
      selectedCompany?.slug,
      selectedStation || undefined,
      partNumberToSearch,
      "PART",
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
      serial: initialData?.serial
        ? Array.isArray(initialData.serial)
          ? initialData.serial
          : [initialData.serial]
        : [],
      alternative_part_number: initialData?.alternative_part_number || [],
      batch_id: initialData?.batches?.id?.toString() || "",
      batch_name: initialData?.batches?.name || "",
      manufacturer_id: initialData?.manufacturer?.id?.toString() || "",
      condition_id: initialData?.condition?.id?.toString() || "",
      description: initialData?.description || "",
      zone: initialData?.zone || "",
      hour_date: initialData?.part_component?.hour_date
        ? parseInt(initialData.part_component.hour_date)
        : undefined,
      cycle_date: initialData?.part_component?.cycle_date
        ? parseInt(initialData.part_component.cycle_date)
        : undefined,
      caducate_date: initialData?.part_component?.caducate_date
        ? initialData?.part_component?.caducate_date
        : undefined,
      fabrication_date: initialData?.part_component?.fabrication_date
        ? initialData?.part_component?.fabrication_date
        : undefined,
      has_documentation: initialData?.has_documentation ?? false,
      aircraft_id: "",
      life_limit_part_calendar: initialData?.part_component
        ?.life_limit_part_calendar
        ? initialData?.part_component?.life_limit_part_calendar
        : undefined,
      life_limit_part_cycles: initialData?.part_component
        ?.life_limit_part_cycles
        ? Number(initialData.part_component.life_limit_part_cycles)
        : undefined,
      life_limit_part_hours: initialData?.part_component?.life_limit_part_hours
        ? Number(initialData.part_component.life_limit_part_hours)
        : undefined,
      inspect_date: initialData?.inspect_date
        ? initialData?.inspect_date
        : undefined,
      ata_code: initialData?.ata_code || "",
    },
    mode: "onBlur",
  });

  // Watch para el campo de documentación
  const hasDocumentation = form.watch("has_documentation");

  // Watch condition_id to check if it's "resguardo"
  const conditionId = form.watch("condition_id");
  const selectedCondition = conditions?.find(
    (c) => c.id.toString() === conditionId,
  );
  const isResguardo = selectedCondition?.name?.toLowerCase() === "resguardo";

  // Reset on prop change
  useEffect(() => {
    if (!initialData) return;
    form.reset({
      part_number: initialData.part_number ?? "",
      serial: initialData.serial
        ? Array.isArray(initialData.serial)
          ? initialData.serial
          : [initialData.serial]
        : [],
      alternative_part_number: initialData.alternative_part_number ?? [],
      batch_id: initialData.batches?.id?.toString() ?? "",
      batch_name: initialData.batches?.name ?? "",
      manufacturer_id: initialData.manufacturer?.id?.toString() ?? "",
      condition_id: initialData.condition?.id?.toString() ?? "",
      description: initialData.description ?? "",
      zone: initialData.zone ?? "",
      hour_date: initialData.part_component?.hour_date
        ? parseInt(initialData.part_component.hour_date)
        : undefined,
      cycle_date: initialData.part_component?.cycle_date
        ? parseInt(initialData.part_component.cycle_date)
        : undefined,
      caducate_date: initialData.part_component?.caducate_date
        ? initialData.part_component?.caducate_date
        : undefined,
      fabrication_date: initialData.part_component?.fabrication_date
        ? initialData.part_component?.fabrication_date
        : undefined,
      has_documentation: initialData.has_documentation ?? false,
      aircraft_id: "",
      life_limit_part_calendar: initialData.part_component
        ?.life_limit_part_calendar
        ? initialData.part_component?.life_limit_part_calendar
        : undefined,
      life_limit_part_cycles: initialData.part_component?.life_limit_part_cycles
        ? Number(initialData.part_component.life_limit_part_cycles)
        : undefined,
      life_limit_part_hours: initialData.part_component?.life_limit_part_hours
        ? Number(initialData.part_component.life_limit_part_hours)
        : undefined,
      inspector: initialData.inspector || "",
      inspect_date: initialData?.inspect_date
        ? initialData?.inspect_date
        : undefined,
      ata_code: initialData?.ata_code || "",
    });
  }, [initialData, form]);

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
          `✓ Se encontraron ${searchResults.length} descripciones. Se seleccionó la primera.`,
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

    const searchIds = new Set(searchResults.map((r) => r.id));
    const foundBatches = batches.filter((b) => searchIds.has(b.id));
    const otherBatches = batches.filter((b) => !searchIds.has(b.id));

    return [...foundBatches, ...otherBatches];
  }, [batches, searchResults]);

  const [openPreview, setOpenPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewValues | null>(null);

  async function onSubmit(values: FormValues) {
    const rawValues = form.getValues();

    const previewVals: PreviewValues = {
      ...rawValues,
      inspect_date: inspectDate ? format(inspectDate, "yyyy-MM-dd") : undefined,
      fabrication_date: fabricationDate
        ? format(fabricationDate, "yyyy-MM-dd")
        : undefined, // o "" si quieres
      caducate_date: caducateDate
        ? format(caducateDate, "yyyy-MM-dd")
        : undefined,
      life_limit_part_calendar: lifeLimitPartCalendar
        ? format(lifeLimitPartCalendar, "yyyy-MM-dd")
        : undefined,
      batch_name:
        batchNameById.get(rawValues.batch_id) || rawValues.batch_name || "—",
      condition_name:
        conditions?.find((c) => c.id.toString() === rawValues.condition_id)
          ?.name || "—",
      manufacturer_name:
        manufacturers?.find(
          (m) => m.id.toString() === rawValues.manufacturer_id,
        )?.name || "—",
      serial: Array.isArray(rawValues.serial)
        ? rawValues.serial
        : rawValues.serial
          ? [rawValues.serial]
          : [],
    };

    setPreviewData(previewVals);
    setOpenPreview(true);
  }

  async function submitToBackend(values: FormValues) {
    if (!selectedCompany?.slug) return;

    // Validar que el campo de fecha de caducidad esté completado (debe tener fecha o estar marcado como N/A)
    if (caducateDate === undefined) {
      return; // El botón debería estar deshabilitado, pero por seguridad validamos aquí también
    }

    const { caducate_date: _, ...valuesWithoutCaducateDate } = values;
    const caducateDateStr: string | undefined =
      caducateDate && caducateDate !== null
        ? format(caducateDate, "yyyy-MM-dd")
        : undefined;

    // Transformar serial: si hay 1 serial -> string, si hay 2+ -> array
    const serialValue =
      values.serial && values.serial.length > 0
        ? values.serial.length === 1
          ? values.serial[0]
          : values.serial
        : undefined;

    const formattedValues: Omit<FormValues, "caducate_date" | "serial"> & {
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
      aircraft_id?: string;
    } = {
      ...valuesWithoutCaducateDate,
      status: "CHECKING",
      article_type: "part",
      part_number: normalizeUpper(values.part_number),
      alternative_part_number:
        values.alternative_part_number?.map((v) => normalizeUpper(v)) ?? [],
      serial: serialValue,
      caducate_date: caducateDateStr,
      fabrication_date:
        fabricationDate && fabricationDate !== null
          ? format(fabricationDate, "yyyy-MM-dd")
          : undefined,
      calendar_date:
        values.calendar_date && format(values.calendar_date, "yyyy-MM-dd"),
      batch_name: enableBatchNameEdit ? values.batch_name : undefined,
      batch_id: values.batch_id, // Incluir explícitamente el batch_id del formulario
      aircraft_id: values.aircraft_id, // Incluir aircraft_id si está presente
      life_limit_part_cycles: values.life_limit_part_cycles,
      life_limit_part_hours: values.life_limit_part_hours,
    };

    if (isEditing && initialData) {
      // Lógica según el checkbox:
      // - Si enableBatchNameEdit está marcado: enviar batch_name (modifica el batch para todos los artículos)
      // - Si NO está marcado: solo enviar batch_id (reasigna solo este artículo a otro batch)
      const updateData: any = {
        ...formattedValues,
        article_type: "part",
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
        updateData.batch_id =
          initialData.batches?.id?.toString() || values.batch_id;
      } else {
        // Solo reasignar este artículo a otro batch (NO afecta a otros artículos)
        if (!values.batch_id) {
          toast.error("Error", {
            description: "Debe seleccionar una descripción de la parte.",
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
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push(`/${selectedCompany.slug}/ingenieria/confirmar_inventario`);
      router.refresh(); // Forzar refresco de la página
    } else {
      await createArticle.mutateAsync({
        company: selectedCompany.slug,
        data: formattedValues,
      });
      form.reset();
      // Restablecer a "No aplica" por defecto
      setFabricationDate(null);
      setCaducateDate(null);
      setLifeLimitPartCalendar(null);
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
    const fileValue = form.watch(name as any);
    const fileName = fileValue instanceof File ? fileValue.name : "";

    const handleClearFile = (inputRef: HTMLInputElement | null) => {
      // Limpiar el input de archivo
      if (inputRef) {
        inputRef.value = "";
      }
      // Limpiar el valor en el formulario
      form.setValue(name as any, undefined as any, {
        shouldDirty: true,
        shouldValidate: true,
      });
    };

    return (
      <FormField
        control={form.control}
        name={name as any}
        render={() => {
          let inputRef: HTMLInputElement | null = null;

          return (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <div className="relative">
                  <FileUpIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none" />
                  <Input
                    ref={(el) => {
                      inputRef = el;
                    }}
                    type="file"
                    accept={accept}
                    disabled={busy}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        form.setValue(name as any, f as any, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                    className="hidden"
                    id={`file-input-${name}`}
                  />
                  <div
                    onClick={() => !busy && !fileName && inputRef?.click()}
                    className={`flex items-center justify-between pl-10 pr-3 py-2 w-full border border-gray-300 rounded ${
                      !busy && !fileName
                        ? "cursor-pointer hover:border-gray-400"
                        : ""
                    } ${busy ? "opacity-50" : ""}`}
                  >
                    <span
                      className={`text-sm truncate flex-1 ${fileName ? "text-gray-900" : "text-gray-500"}`}
                    >
                      {fileName || "Ningún archivo seleccionado"}
                    </span>
                    {fileName && !busy && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearFile(inputRef);
                        }}
                        className="ml-2 p-1 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                        title="Eliminar archivo"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-red-600"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </FormControl>
              {description ? (
                <FormDescription>{description}</FormDescription>
              ) : null}
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  }

  /* -------------------------------- UI -------------------------------- */
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 max-w-7xl mx-auto"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Encabezado */}
        <SectionCard title="Registrar Parte">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="inspector"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Inspector (Incoming)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del Inspector" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormItem className="w-full">
              <DatePickerField
                label="Fecha de Incoming"
                value={inspectDate}
                setValue={setInspectDate}
                description="Fecha de Incoming"
                busy={busy}
                shortcuts="forward"
                showNotApplicable={true}
                required={true}
              />
            </FormItem>

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
              name="alternative_part_number"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MultiInputField
                      values={field.value || []}
                      onChange={(vals) =>
                        field.onChange(
                          vals.map((v: string) => normalizeUpper(v)),
                        )
                      }
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
                      <FormLabel>Descripción de la Parte</FormLabel>
                      <CreateBatchDialog
                        onSuccess={async (batchName) => {
                          // Invalidar la query y refetch para obtener el batch recién creado
                          await queryClient.invalidateQueries({
                            queryKey: [
                              "search-batches",
                              selectedCompany?.slug,
                              selectedStation,
                              "PART",
                            ],
                          });
                          const { data: updatedBatches } =
                            await refetchBatches();
                          const newBatch = updatedBatches?.find(
                            (b: any) => b.name === batchName,
                          );
                          if (newBatch) {
                            form.setValue("batch_id", newBatch.id.toString(), {
                              shouldValidate: true,
                            });
                          }
                        }}
                        defaultCategory="PART"
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
                            disabled={
                              isBatchesLoading || isBatchesError || busy
                            }
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between",
                              !field.value && "text-muted-foreground",
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
                          <CommandInput
                            placeholder="Buscar descripción..."
                            onKeyDown={(e) => {
                              if (e.key === "Tab") {
                                e.preventDefault();
                                const selected = e.currentTarget
                                  .closest("[cmdk-root]")
                                  ?.querySelector(
                                    '[cmdk-item][aria-selected="true"]',
                                  ) as HTMLElement;
                                if (selected) {
                                  selected.click();
                                } else {
                                  const firstItem = e.currentTarget
                                    .closest("[cmdk-root]")
                                    ?.querySelector(
                                      '[cmdk-item]:not([data-disabled="true"])',
                                    ) as HTMLElement;
                                  if (firstItem) {
                                    firstItem.click();
                                  }
                                }
                              }
                            }}
                          />
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
                                        { shouldValidate: true },
                                      );
                                      if (isEditing && enableBatchNameEdit) {
                                        form.setValue(
                                          "batch_name",
                                          batch.name,
                                          { shouldValidate: true },
                                        );
                                      }
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        `${batch.id}` === field.value
                                          ? "opacity-100"
                                          : "opacity-0",
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
                                      (sr) => sr.id === batch.id,
                                    ),
                                )
                                .map((batch) => (
                                  <CommandItem
                                    value={`${batch.name}`}
                                    key={batch.id}
                                    onSelect={() => {
                                      form.setValue(
                                        "batch_id",
                                        batch.id.toString(),
                                        { shouldValidate: true },
                                      );
                                      if (isEditing && enableBatchNameEdit) {
                                        form.setValue(
                                          "batch_name",
                                          batch.name,
                                          { shouldValidate: true },
                                        );
                                      }
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        `${batch.id}` === field.value
                                          ? "opacity-100"
                                          : "opacity-0",
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
                      Descripción de la parte a registrar.
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
            <FormField
              control={form.control}
              name="ata_code"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Codigo ATA </FormLabel>
                  <FormControl>
                    <Input placeholder="Codigo ATA" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
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
                  <FormDescription>
                    Serial de la parte si aplica.
                  </FormDescription>
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
                    <SelectContent
                      onKeyDown={(e) => {
                        if (e.key === "Tab") {
                          e.preventDefault();
                          const focused = document.activeElement as HTMLElement;
                          if (focused?.getAttribute("role") === "option") {
                            // Simular Enter en el elemento seleccionado
                            const enterEvent = new KeyboardEvent("keydown", {
                              key: "Enter",
                              code: "Enter",
                              keyCode: 13,
                              bubbles: true,
                              cancelable: true,
                            });
                            focused.dispatchEvent(enterEvent);
                          } else {
                            // Si no hay elemento enfocado, enfocar y seleccionar el primero
                            const firstItem = e.currentTarget.querySelector(
                              '[role="option"]:not([data-disabled="true"])',
                            ) as HTMLElement;
                            if (firstItem) {
                              firstItem.focus();
                              const enterEvent = new KeyboardEvent("keydown", {
                                key: "Enter",
                                code: "Enter",
                                keyCode: 13,
                                bubbles: true,
                                cancelable: true,
                              });
                              firstItem.dispatchEvent(enterEvent);
                            }
                          }
                        }
                      }}
                    >
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
                  <FormDescription>
                    Estado físico/operativo del artículo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de aeronave - Solo se muestra cuando la condición es "resguardo" */}
            {isResguardo && (
              <FormField
                control={form.control}
                name="aircraft_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <div className="flex items-center justify-between">
                      <FormLabel>Aeronave de origen</FormLabel>
                      <CreateResguardoAircraftDialog
                        onSuccess={(aircraftId) => {
                          form.setValue("aircraft_id", aircraftId, {
                            shouldValidate: true,
                          });
                        }}
                        triggerButton={
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Crear nueva
                          </Button>
                        }
                      />
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            disabled={isAircraftsLoading || busy}
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {isAircraftsLoading && (
                              <Loader2 className="size-4 animate-spin mr-2" />
                            )}
                            {field.value ? (
                              <p>
                                {
                                  aircrafts?.find(
                                    (a) => a.id.toString() === field.value,
                                  )?.acronym
                                }
                              </p>
                            ) : (
                              "Seleccione aeronave..."
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar aeronave..." />
                          <CommandList>
                            <CommandEmpty className="text-xs p-2 text-center">
                              No se encontró la aeronave.
                            </CommandEmpty>
                            <CommandGroup>
                              {aircrafts?.map((aircraft) => (
                                <CommandItem
                                  value={aircraft.acronym}
                                  key={aircraft.id}
                                  onSelect={() => {
                                    form.setValue(
                                      "aircraft_id",
                                      aircraft.id.toString(),
                                      { shouldValidate: true },
                                    );
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      `${aircraft.id}` === field.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  <p>
                                    {aircraft.acronym} -{" "}
                                    {aircraft.client?.name || "Sin empresa"}
                                  </p>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Aeronave de la que se extrajo el artículo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                            { shouldValidate: true },
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={
                            isManufacturerLoading || isManufacturerError || busy
                          }
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground",
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
                                  .find((m) => `${m.id}` === field.value)?.name
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
                        <CommandInput
                          placeholder="Buscar fabricante..."
                          onKeyDown={(e) => {
                            if (e.key === "Tab") {
                              e.preventDefault();
                              const selected = e.currentTarget
                                .closest("[cmdk-root]")
                                ?.querySelector(
                                  '[cmdk-item][aria-selected="true"]',
                                ) as HTMLElement;
                              if (selected) {
                                selected.click();
                              } else {
                                const firstItem = e.currentTarget
                                  .closest("[cmdk-root]")
                                  ?.querySelector(
                                    '[cmdk-item]:not([data-disabled="true"])',
                                  ) as HTMLElement;
                                if (firstItem) {
                                  firstItem.click();
                                }
                              }
                            }
                          }}
                        />
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
                                      { shouldValidate: true },
                                    );
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      `${manufacturer.id}` === field.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  <p>
                                    {manufacturer.name} ({manufacturer.type})
                                  </p>
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
                    <Input
                      placeholder="Ej: Pasillo 4, Estante B"
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

        {/* Fechas y límites */}
        <SectionCard title="Fechas de la Parte">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem className="w-full">
              <DatePickerField
                label="Fecha de Fabricación"
                value={fabricationDate}
                setValue={setFabricationDate}
                description="Fecha de fabricación de la Parte."
                busy={busy}
                shortcuts="back"
                maxYear={new Date().getFullYear()}
                showNotApplicable={true}
              />
            </FormItem>

            <FormItem className="w-full">
              <DatePickerField
                label="Fecha de Caducidad"
                value={caducateDate}
                setValue={setCaducateDate}
                description="Fecha de Caducidad de la Parte."
                busy={busy}
                shortcuts="forward"
                showNotApplicable={true}
                required={true}
              />
            </FormItem>
          </div>
        </SectionCard>

        <SectionCard title="Life Limit Part">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="life_limit_part_cycles"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Life Limit Part Cycles</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder=""
                      {...field}
                      value={field.value || ""}
                      disabled={busy}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>Ciclos</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="life_limit_part_hours"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Life Limit Part Hours</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="decimal"
                      disabled={busy}
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder=""
                    />
                  </FormControl>
                  <FormDescription>Horas</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className="w-full">
              <DatePickerField
                label="Life Limit Part Calendar"
                value={lifeLimitPartCalendar}
                setValue={setLifeLimitPartCalendar}
                description="Fecha de vencimiento del Life Limit Part"
                busy={busy}
                shortcuts="forward"
                showNotApplicable={true}
                required={true}
              />
            </FormItem>
          </div>
        </SectionCard>

        {/* Fechas y límites */}
        <SectionCard title="Shelf Life">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="shelf_life"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Shelf Life</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: 10"
                      {...field}
                      disabled={busy}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Tiempo de Almacenamiento</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shelf_life_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shelf Life Unit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar la unidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MONTHS">MES</SelectItem>
                      <SelectItem value="DAYS">DIAS</SelectItem>
                      <SelectItem value="YEARS">AÑO</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Unidad de Tiempo</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </SectionCard>

        {isEngineering && (
          <SectionCard title="Hard Time Component">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hard_time_cycles"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Hard Time Cycles</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder=""
                        {...field}
                        value={field.value || ""}
                        disabled={busy}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>Ciclos</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hard_time_hours"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Hard Time Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="decimal"
                        disabled={busy}
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder=""
                      />
                    </FormControl>
                    <FormDescription>Horas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem className="w-full">
                <DatePickerField
                  label="Hard Time Calendar"
                  value={hardTimeCalendar}
                  setValue={setHardTimeCalendar}
                  description="Fecha de vencimiento del Hard Time"
                  busy={busy}
                  shortcuts="forward"
                  showNotApplicable={true}
                  required={true}
                />
              </FormItem>
            </div>
          </SectionCard>
        )}
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
                    <Textarea
                      rows={5}
                      placeholder="Ej: Motor V8 de..."
                      {...field}
                      disabled={busy}
                    />
                  </FormControl>
                  <FormDescription>
                    Breve descripción del artículo.
                  </FormDescription>
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
                      Marque esta casilla si el artículo cuenta con
                      documentación (certificados, imágenes, etc.).
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {hasDocumentation && (
              <>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileField
                    name="image"
                    label="Imagen del artículo"
                    accept="image/*"
                    description="Imagen descriptiva."
                  />

                  <div className="space-y-4">
                    <FileField
                      name="certificate_8130"
                      label={
                        (
                          <span>
                            Certificado{" "}
                            <span className="text-primary font-semibold">
                              8130
                            </span>
                          </span>
                        ) as any
                      }
                      description="PDF o imagen. Máx. 10 MB."
                    />
                    <FileField
                      name="certificate_fabricant"
                      label={
                        (
                          <span>
                            Certificado del{" "}
                            <span className="text-primary">fabricante</span>
                          </span>
                        ) as any
                      }
                      description="PDF o imagen. Máx. 10 MB."
                    />
                    <FileField
                      name="certificate_vendor"
                      label={
                        (
                          <span>
                            Certificado del{" "}
                            <span className="text-primary">vendedor</span>
                          </span>
                        ) as any
                      }
                      description="PDF o imagen. Máx. 10 MB."
                    />
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
              <Image
                className="text-black"
                src={loadingGif}
                width={170}
                height={170}
                alt="Cargando..."
              />
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
      <PreviewCreateComponentDialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        values={previewData} // puede ser null antes de abrir
        onConfirm={(vals) => {
          setOpenPreview(false);
          submitToBackend(vals as unknown as FormValues);
        }}
      />
    </Form>
  );
}
