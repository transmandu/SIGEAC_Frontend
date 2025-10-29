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

import { useGetConditions } from "@/hooks/administracion/useGetConditions";
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";
import { useGetSecondaryUnits } from "@/hooks/general/unidades/useGetSecondaryUnits";
import { useGetBatchesByCategory } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByCategory";

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
    .min(2, { message: "El número de parte debe contener al menos 2 caracteres." }),
  lot_number: z.string().optional(),
  alternative_part_number: z
    .array(z.string().min(2, { message: "Cada número alterno debe contener al menos 2 caracteres." }))
    .optional(),
  description: z.string().optional(),
  batch_name: z.string().optional(),
  zone: z.string().optional(),
  caducate_date: z.string().optional(),
  fabrication_date: z.string().optional(),
  manufacturer_id: z.string().optional(),
  condition_id: z.string().min(1, "Debe ingresar la condición del artículo."),
  quantity: z.coerce.number({ message: "Debe ingresar una cantidad." }).min(0, { message: "No puede ser negativo." }),
  batch_id: z.string({ message: "Debe ingresar un lote." }).min(1, "Seleccione un lote"),
  is_managed: z.boolean().optional(),
  certificate_8130: z.instanceof(File, { message: "Suba un archivo válido." }).refine((f) => f.size <= fileMaxBytes, "Tamaño máximo 10 MB.").optional(),
  certificate_fabricant: z.instanceof(File, { message: "Suba un archivo válido." }).refine((f) => f.size <= fileMaxBytes, "Tamaño máximo 10 MB.").optional(),
  certificate_vendor: z.instanceof(File, { message: "Suba un archivo válido." }).refine((f) => f.size <= fileMaxBytes, "Tamaño máximo 10 MB.").optional(),
  image: z.instanceof(File).optional(),
  convertion_id: z.number().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

/* ----------------------------- Helpers UI ----------------------------- */

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
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
              className={cn("w-full pl-3 text-left font-normal", !value && "text-muted-foreground")}
            >
              {value ? format(value, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {(showBack || showForward) && (
            <Select
              onValueChange={(v) => {
                const n = parseInt(v);
                if (n === 0) { setValue(new Date()); return; }
                if (n < 0) setValue(subYears(new Date(), Math.abs(n)));
                else setValue(addYears(new Date(), n));
              }}
            >
              <SelectTrigger className="p-3"><SelectValue placeholder="Atajos de fecha" /></SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="0">Actual</SelectItem>
                {showBack && [5, 10, 15].map((y) => (
                  <SelectItem key={`b-${y}`} value={`${-y}`}>Ir {y} años atrás</SelectItem>
                ))}
                {showForward && [5, 10, 15].map((y) => (
                  <SelectItem key={`f-${y}`} value={`${y}`}>{y} años</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Calendar locale={es} mode="single" selected={value} onSelect={setValue} initialFocus month={value} />
        </PopoverContent>
      </Popover>
      {description ? <FormDescription>{description}</FormDescription> : null}
      <FormMessage />
    </FormItem>
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
  const { selectedCompany } = useCompanyStore();

  // Data hooks
  const { data: batches, isPending: isBatchesLoading, isError: isBatchesError } = useGetBatchesByCategory("consumible");
  const { data: manufacturers, isLoading: isManufacturerLoading, isError: isManufacturerError } = useGetManufacturers(selectedCompany?.slug);
  const { data: conditions, isLoading: isConditionsLoading, error: isConditionsError } = useGetConditions();
  const { data: secondaryUnits, isLoading: secondaryLoading } = useGetSecondaryUnits(selectedCompany?.slug);

  // Mutations
  const { createArticle } = useCreateArticle();
  const { updateArticle } = useUpdateArticle();
  const { confirmIncoming } = useConfirmIncomingArticle();

  // Local UI state
  const [secondaryOpen, setSecondaryOpen] = useState(false);
  const [secondarySelected, setSecondarySelected] = useState<Convertion | null>(null);
  const [secondaryQuantity, setSecondaryQuantity] = useState<number | undefined>();
  const [caducateDate, setCaducateDate] = useState<Date | undefined>(
    initialData?.consumable?.caducate_date ? new Date(initialData.consumable.caducate_date) : undefined
  );
  const [fabricationDate, setFabricationDate] = useState<Date | undefined>(
    initialData?.consumable?.fabrication_date ? new Date(initialData?.consumable?.fabrication_date) : undefined
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
      quantity: (initialData as any)?.quantity ?? 0,
      is_managed: (initialData as any)?.is_managed ?? true,
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
      quantity: (initialData as any)?.quantity ?? 0,
      is_managed: (initialData as any)?.is_managed ?? true,
    });
  }, [initialData, form]);

  // Conversión secundaria -> quantity
  useEffect(() => {
    if (secondarySelected && typeof secondaryQuantity === "number" && !Number.isNaN(secondaryQuantity)) {
      const qty = (secondarySelected.convertion_rate ?? 1) * (secondarySelected.quantity_unit ?? 1) * secondaryQuantity;
      form.setValue("quantity", qty, { shouldDirty: true, shouldValidate: true });
      form.setValue("convertion_id", secondarySelected.id, { shouldDirty: true, shouldValidate: false });
    }
  }, [secondarySelected, secondaryQuantity, form]);

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
    } = {
      ...values,
      status: "CHECKING",
      part_number: normalizeUpper(values.part_number),
      article_type: "consumible",
      alternative_part_number: values.alternative_part_number?.map((v) => normalizeUpper(v)) ?? [],
      caducate_date: caducateDate ? format(caducateDate, "yyyy-MM-dd") : undefined,
      fabrication_date: fabricationDate ? format(fabricationDate, "yyyy-MM-dd") : undefined,
      batch_name: enableBatchNameEdit ? values.batch_name : undefined,
    };

    if (isEditing && initialData) {
      await updateArticle.mutateAsync({
        data: { ...formattedValues },
        id: initialData?.id,
        company: selectedCompany.slug,
      });
      router.push(`/${selectedCompany.slug}/almacen/inventario`);
    } else {
      await createArticle.mutateAsync({ company: selectedCompany.slug, data: formattedValues });
      form.reset();
      setFabricationDate(undefined);
      setCaducateDate(undefined);
      setSecondarySelected(null);
      setSecondaryQuantity(undefined);
    }
  }

  /* -------------------------------- UI -------------------------------- */
  return (
    <Form {...form}>
      <form className="flex flex-col gap-6 max-w-7xl mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
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
                      disabled={busy}
                      onBlur={(e) => field.onChange(normalizeUpper(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Identificador principal del artículo.</FormDescription>
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
                    <Input placeholder="Ej: LOTE123" {...field} disabled={busy} />
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
                            disabled={isBatchesLoading || isBatchesError || busy}
                            variant="outline"
                            role="combobox"
                            className={cn("justify-between", !field.value && "text-muted-foreground")}
                          >
                            {isBatchesLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                            {field.value ? <p className="truncate flex-1 text-left">{batchNameById.get(field.value) ?? ""}</p> : <span className="truncate">Elegir descripción...</span>}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Buscar descripción..." />
                          <CommandList>
                            <CommandEmpty className="text-xs p-2 text-center">Sin resultados</CommandEmpty>
                            <CommandGroup>
                              {batches?.map((batch) => (
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
                    <FormDescription>Descripción del consumible a registrar.</FormDescription>
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

        {/* Propiedades */}
        <SectionCard title="Propiedades">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                  <Select disabled={isManufacturerLoading || busy} onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isManufacturerLoading ? "Cargando..." : "Seleccione..."} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {manufacturers?.filter((m) => m.type === "PART").map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          {m.name}
                        </SelectItem>
                      ))}
                      {isManufacturerError && (
                        <div className="p-2 text-sm text-muted-foreground">Error al cargar fabricantes.</div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>Marca específica del artículo.</FormDescription>
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
                    <Input placeholder="Ej: Pasillo 4, repisa 3..." {...field} disabled={busy} />
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
            {/* Método de ingreso (unidad secundaria) */}
            <div className="flex flex-col space-y-2 mt-2.5">
              <FormLabel>Método de ingreso</FormLabel>
              <Popover open={secondaryOpen} onOpenChange={setSecondaryOpen}>
                <PopoverTrigger asChild>
                  <Button disabled={secondaryLoading || busy} variant="outline" role="combobox" aria-expanded={secondaryOpen} className="justify-between">
                    {secondarySelected ? `${secondarySelected.secondary_unit} (${secondarySelected.unit?.label || secondarySelected.unit?.value || ''})` : secondaryLoading ? "Cargando..." : "Seleccione..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar unidad..." />
                    <CommandList>
                      <CommandEmpty>No existen unidades secundarias.</CommandEmpty>
                      <CommandGroup>
                        {secondaryUnits?.map((s) => (
                          <CommandItem
                            key={s.id}
                            value={s.id.toString()}
                            onSelect={(val) => {
                              const found = secondaryUnits.find((u) => u.id.toString() === val) || null;
                              setSecondarySelected(found);
                              setSecondaryOpen(false);
                              if (found && typeof secondaryQuantity === "number") {
                                const calc = (found.convertion_rate ?? 1) * (found.quantity_unit ?? 1) * (secondaryQuantity ?? 0);
                                form.setValue("quantity", calc, { shouldDirty: true, shouldValidate: true });
                                form.setValue("convertion_id", found.id, { shouldDirty: true });
                              }
                            }}
                          >
                            <span className="flex-1">{s.secondary_unit} <span className="text-muted-foreground">({s.unit?.label || s.unit?.value || ''})</span></span>
                            <Check className={cn("ml-2", secondarySelected?.id.toString() === s.id.toString() ? "opacity-100" : "opacity-0")} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground">Indique cómo será ingresado el artículo.</p>
            </div>

            {/* Cantidad secundaria */}
            <div className="space-y-2">
              <FormLabel>Cantidad</FormLabel>
              <Input
                type="number"
                inputMode="decimal"
                disabled={busy}
                min="0"
                onChange={(e) => {
                  const n = parseFloat(e.target.value);
                  if (!Number.isNaN(n) && n < 0) return;
                  setSecondaryQuantity(Number.isNaN(n) ? undefined : n);
                }}
                placeholder="Ej: 2, 4, 6..."
              />
              <p className="text-sm text-muted-foreground">Cantidad según método de ingreso seleccionado.</p>
            </div>

            {/* Cantidad resultante */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Cantidad resultante</FormLabel>
                  <FormControl>
                    <Input disabled type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormDescription>Unidades base que se registrarán.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ¿Es manejable? */}
            <FormField
              control={form.control}
              name="is_managed"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>¿Necesita despachar el artículo en pequeñas cantidades?</FormLabel>
                    <FormDescription />
                  </div>
                </FormItem>
              )}
            />
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
                    <Textarea rows={5} placeholder="Ej: Fluido hidráulico MIL-PRF-83282..." {...field} disabled={busy} />
                  </FormControl>
                  <FormDescription>Observaciones sobre el artículo.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileField form={form} name="image" label="Imagen del artículo" accept="image/*" description="Imagen descriptiva." busy={busy} />

              <div className="space-y-4">
                <FileField form={form} name="certificate_8130" label={<span>Certificado <span className="text-primary font-semibold">8130</span></span>} description="PDF o imagen. Máx. 10 MB." busy={busy} />
                <FileField form={form} name="certificate_fabricant" label={<span>Certificado del <span className="text-primary">fabricante</span></span>} description="PDF o imagen. Máx. 10 MB." busy={busy} />
                <FileField form={form} name="certificate_vendor" label={<span>Certificado del <span className="text-primary">vendedor</span></span>} description="PDF o imagen. Máx. 10 MB." busy={busy} />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Acciones */}
        <div className="flex items-center gap-3">
          <Button
            className="bg-primary text-white hover:bg-blue-900 disabled:bg-slate-100 disabled:text-slate-400"
            disabled={busy || !selectedCompany || !form.getValues("part_number") || !form.getValues("batch_id")}
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
