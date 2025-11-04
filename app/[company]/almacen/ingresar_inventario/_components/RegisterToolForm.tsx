"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CalendarIcon, Check, FileUpIcon, Loader2, Plus, Wrench } from "lucide-react";

import { useConfirmIncomingArticle, useCreateArticle } from "@/actions/mantenimiento/almacen/inventario/articulos/actions";

import { MultiInputField } from "@/components/misc/MultiInputField";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";
import { useGetBatchesByCategory } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByCategory";
import { useSearchBatchesByPartNumber } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByArticlePartNumber";

import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Batch } from "@/types";

import loadingGif from "@/public/loading2.gif";
import { EditingArticle } from "./RegisterArticleForm";
import { CreateManufacturerDialog } from "@/components/dialogs/general/CreateManufacturerDialog";
import { useUpdateArticle } from "@/actions/mantenimiento/almacen/inventario/articulos/actions";

/* ------------------------------- Schema ------------------------------- */

const fileMaxBytes = 10_000_000; // 10 MB

const formSchema = z
  .object({
    article_type: z.string().optional(),
    part_number: z.string().min(2, "Al menos 2 caracteres."),
    alternative_part_number: z.array(z.string().min(2)).optional(),
    serial: z.string().optional(),
    model: z.string().optional(),
    description: z.string().min(2, "Al menos 2 caracteres."),
    batch_name: z.string().optional(),
    zone: z.string().min(1, "Campo requerido"),
    manufacturer_id: z.string().min(1, "Seleccione un fabricante"),
    batch_id: z.string().min(1, "Seleccione una descripción"),

    // Calibración
    needs_calibration: z.boolean().optional(),
    calibration_date: z.date().optional(),
    next_calibration: z.coerce.number().int().positive().optional(),

    // Archivos
    certificate_8130: z
      .instanceof(File, { message: "Archivo inválido." })
      .refine((f) => f.size <= fileMaxBytes, "Máx. 10 MB.")
      .optional(),
    certificate_fabricant: z
      .instanceof(File, { message: "Archivo inválido." })
      .refine((f) => f.size <= fileMaxBytes, "Máx. 10 MB.")
      .optional(),
    certificate_vendor: z
      .instanceof(File, { message: "Archivo inválido." })
      .refine((f) => f.size <= fileMaxBytes, "Máx. 10 MB.")
      .optional(),
    image: z.instanceof(File).optional(),
  })
  .superRefine((vals, ctx) => {
    if (vals.needs_calibration) {
      if (!vals.calibration_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese la última fecha de calibración.",
          path: ["calibration_date"],
        });
      }
      if (!vals.next_calibration || vals.next_calibration <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese días para la próxima calibración (número > 0).",
          path: ["next_calibration"],
        });
      }
    }
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
  onSelect,
  description,
  busy,
  maxYear,
}: {
  label: string;
  value?: Date;
  onSelect: (d?: Date) => void;
  description?: string;
  busy?: boolean;
  /** Año máximo permitido. Si no se especifica, será el año actual + 20 */
  maxYear?: number;
}) {
  return (
    <FormItem className="flex flex-col w-full mt-1.5 space-y-3">
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
            selected={value} 
            onSelect={onSelect} 
            initialFocus 
            defaultMonth={value ?? new Date()}
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
      {description ? <FormDescription>{description}</FormDescription> : null}
      <FormMessage />
    </FormItem>
  );
}

/* ----------------------------- Componente ----------------------------- */

export default function CreateToolForm({ initialData, isEditing }: { initialData?: EditingArticle; isEditing?: boolean }) {
  const router = useRouter();
  const { selectedCompany, selectedStation } = useCompanyStore();

  // Local state for part number search
  const [partNumberToSearch, setPartNumberToSearch] = useState<string | undefined>(undefined);

  const { data: batches, isPending: isBatchesLoading, isError: isBatchesError } = useGetBatchesByCategory("herramienta");
  const { data: manufacturers, isLoading: isManufacturerLoading, isError: isManufacturerError } = useGetManufacturers(selectedCompany?.slug);

  // Search batches by part number
  const { data: searchResults, isFetching: isSearching } = useSearchBatchesByPartNumber(
    selectedCompany?.slug,
    selectedStation || undefined,
    partNumberToSearch,
    "HERRAMIENTA"
  );

  const { createArticle } = useCreateArticle();
  const { updateArticle } = useUpdateArticle();
  const { confirmIncoming } = useConfirmIncomingArticle();

  const [enableBatchNameEdit, setEnableBatchNameEdit] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      part_number: initialData?.part_number || "",
      alternative_part_number: initialData?.alternative_part_number || [],
      serial: initialData?.serial || "",
      description: initialData?.description || "",
      zone: initialData?.zone || "",
      manufacturer_id: initialData?.manufacturer?.id?.toString() || "",
      batch_id: initialData?.batches?.id?.toString() || "",
      batch_name: initialData?.batches?.name || "",
      needs_calibration: initialData?.tool?.needs_calibration ?? false,
      calibration_date: initialData?.tool?.calibration_date ? new Date(initialData.tool.calibration_date) : undefined,
      next_calibration: undefined,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    form.setValue("article_type", "herramienta");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialData) return;
    form.reset({
      part_number: initialData.part_number || "",
      alternative_part_number: initialData.alternative_part_number || [],
      serial: initialData.serial || "",
      description: initialData.description || "",
      zone: initialData.zone || "",
      manufacturer_id: initialData.manufacturer?.id?.toString() || "",
      batch_id: initialData.batches?.id?.toString() || "",
      batch_name: initialData.batches?.name || "",
      needs_calibration: initialData.tool?.needs_calibration ?? false,
      calibration_date: initialData.tool?.calibration_date ? new Date(initialData.tool.calibration_date) : undefined,
      next_calibration: undefined,
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
    createArticle.isPending || 
    confirmIncoming.isPending || 
    updateArticle.isPending;

  const batchesOptions = useMemo<Batch[] | undefined>(() => batches, [batches]);

  // Ordenar batches: primero los resultados de búsqueda, luego el resto
  const sortedBatches = useMemo(() => {
    if (!batches) return [];
    if (!searchResults || searchResults.length === 0) return batches;
    
    const searchIds = new Set(searchResults.map(r => r.id));
    const foundBatches = batches.filter(b => searchIds.has(b.id));
    const otherBatches = batches.filter(b => !searchIds.has(b.id));
    
    return [...foundBatches, ...otherBatches];
  }, [batches, searchResults]);

  const normalizeUpper = (s?: string) => s?.trim().toUpperCase() ?? "";

  async function onSubmit(values: FormValues) {
    if (!selectedCompany?.slug) return;

    const payload: any = {
      ...values,
      status: "CHECKING",
      part_number: normalizeUpper(values.part_number),
      alternative_part_number: values.alternative_part_number?.map((v) => normalizeUpper(v)) ?? [],
      calibration_date: values.calibration_date ? format(values.calibration_date, "yyyy-MM-dd") : undefined,
      batch_name: enableBatchNameEdit ? values.batch_name : undefined,
      // next_calibration se envía como número si existe
    };

    if (isEditing) {
      await updateArticle.mutateAsync({ data: { ...payload }, id: (initialData as any)?.id, company: selectedCompany.slug });
      router.push(`/${selectedCompany.slug}/almacen/inventario_articulos`);
    } else {
      await createArticle.mutateAsync({ company: selectedCompany.slug, data: payload });
      form.reset();
    }
  }

  const isCalibrated = form.watch("needs_calibration");

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 max-w-7xl mx-auto"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Header */}
        <SectionCard title="Registrar herramienta">
          <CardTitle className="sr-only">Registrar herramienta</CardTitle>
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="part_number"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Nro. de parte</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: TW-500"
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
                    Identificador principal.
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
              name="serial"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Serial</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: S-000123"
                      {...field}
                      disabled={busy}
                    />
                  </FormControl>
                  <FormDescription>Serial de la herramienta.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alternative_part_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nros. de parte alternos</FormLabel>
                  <FormControl>
                    <MultiInputField
                      values={field.value || []}
                      onChange={(vals) =>
                        field.onChange(
                          vals.map((v: string) => normalizeUpper(v))
                        )
                      }
                      placeholder={`Ej: P/N-ALT-01, PN-ALT-02`}
                      label=""
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
                  <FormItem className="w-full">
                    <FormLabel>Descripción</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (isEditing && enableBatchNameEdit) {
                          const selectedBatch = batchesOptions?.find(
                            (b) => b.id.toString() === value
                          );
                          if (selectedBatch) {
                            form.setValue("batch_name", selectedBatch.name, {
                              shouldValidate: true,
                            });
                          }
                        }
                      }}
                      value={field.value}
                      disabled={isBatchesLoading || busy}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isBatchesLoading
                                ? "Cargando..."
                                : "Seleccione descripción..."
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {searchResults && searchResults.length > 0 && (
                          <>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                              Coincidencias encontradas
                            </div>
                            {searchResults.map((b) => (
                              <SelectItem
                                key={`search-${b.id}`}
                                value={b.id.toString()}
                                className="font-semibold text-primary"
                              >
                                {b.name}
                              </SelectItem>
                            ))}
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                              Otras descripciones
                            </div>
                          </>
                        )}
                        {sortedBatches
                          ?.filter(
                            (b) => !searchResults?.some((sr) => sr.id === b.id)
                          )
                          .map((b) => (
                            <SelectItem key={b.id} value={b.id.toString()}>
                              {b.name}
                            </SelectItem>
                          ))}
                        {(!batchesOptions || batchesOptions.length === 0) &&
                          !isBatchesLoading &&
                          !isBatchesError && (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              No se han encontrado descripciones.
                            </div>
                          )}
                        {isBatchesError && (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            Error al cargar descripciones.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>Clasificación interna.</FormDescription>
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

        {/* Clasificación y estado */}
        <SectionCard title="Clasificación y estado">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isManufacturerLoading || busy}
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
                      {manufacturers?.map((m) => (
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
                  <FormDescription>Marca del fabricante.</FormDescription>
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
                      placeholder="Ej: Taller, Estantería B"
                      {...field}
                      disabled={busy}
                    />
                  </FormControl>
                  <FormDescription>
                    Zona física en almacén/taller.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </SectionCard>

        {/* Calibración */}
        <SectionCard title="Calibración">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="needs_calibration"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>¿Requiere calibración?</FormLabel>
                    <FormDescription>
                      Activa los campos de calibración si aplica.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {isCalibrated && (
              <>
                <FormField
                  control={form.control}
                  name="calibration_date"
                  render={({ field }) => (
                    <DatePickerField
                      label="Última calibración"
                      value={field.value}
                      onSelect={(d) =>
                        form.setValue("calibration_date", d, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      description="Fecha de la última calibración realizada."
                      busy={busy}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="next_calibration"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Días hasta la próxima calibración</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          placeholder="Ej: 180"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                          disabled={busy}
                        />
                      </FormControl>
                      <FormDescription>
                        Número de días para programar la próxima calibración.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </SectionCard>

        {/* Detalles y documentos */}
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
                      placeholder="Ej: Herramienta de calibración..."
                      {...field}
                      disabled={busy}
                    />
                  </FormControl>
                  <FormDescription>
                    Observaciones sobre la herramienta.
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
                label="Imagen"
                accept="image/*"
                description="Imagen descriptiva de la herramienta."
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
              !form.getValues("batch_id") ||
              !form.getValues("manufacturer_id")
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
                {isEditing ? "Confirmar ingreso" : "Crear herramienta"}
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
  );
}
