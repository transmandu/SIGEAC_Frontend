"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CalendarIcon, Check, ChevronsUpDown, FileUpIcon, Loader2, Plus, Wrench } from "lucide-react";

import {
  useConfirmIncomingArticle,
  useCreateArticle,
  useUpdateArticle,
} from "@/actions/mantenimiento/almacen/inventario/articulos/actions";

import { MultiInputField } from "@/components/misc/MultiInputField";
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
import { Textarea } from "@/components/ui/textarea";

import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";
import { useGetBatchesByCategory } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByCategory";

import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Batch } from "@/types";

import loadingGif from "@/public/loading2.gif";
import { EditingArticle } from "./RegisterArticleForm";
import { CreateManufacturerDialog } from "@/components/dialogs/general/CreateManufacturerDialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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
    zone: z.string().min(1, "Campo requerido"),
    manufacturer_id: z.string().min(1, "Seleccione un fabricante"),
    batch_id: z.string().min(1, "Seleccione una descripción"),

    // Calibración
    needs_calibration: z.boolean().optional(),
    calibration_date: z.date().optional(),
    next_calibration: z
      .union([z.coerce.number().int().positive(), z.nan()])
      .optional(), // ingresado solo si needs_calibration

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
      if (
        vals.next_calibration === undefined ||
        vals.next_calibration === null ||
        Number.isNaN(vals.next_calibration) ||
        (typeof vals.next_calibration === "number" &&
          vals.next_calibration <= 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese días para la próxima calibración (número > 0).",
          path: ["next_calibration"],
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

/* ----------------------------- Componente ----------------------------- */

export default function CreateToolForm({
  initialData,
  isEditing,
}: {
  initialData?: EditingArticle;
  isEditing?: boolean;
}) {
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();

  const {
    data: batches,
    isPending: isBatchesLoading,
    isError: isBatchesError,
  } = useGetBatchesByCategory("herramienta");
  
  const {
    data: manufacturers,
    isLoading: isManufacturerLoading,
    isError: isManufacturerError,
  } = useGetManufacturers(selectedCompany?.slug);


  const { createArticle } = useCreateArticle();
  const { updateArticle } = useUpdateArticle();
  const { confirmIncoming } = useConfirmIncomingArticle();

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
      needs_calibration: initialData?.tool?.needs_calibration ?? false,
      calibration_date: initialData?.tool?.calibration_date
        ? new Date(initialData.tool.calibration_date)
        : undefined,
      next_calibration: undefined,
    },
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
      needs_calibration: initialData.tool?.needs_calibration ?? false,
      calibration_date: initialData.tool?.calibration_date
        ? new Date(initialData.tool.calibration_date)
        : undefined,
      next_calibration: undefined,
    });
  }, [initialData, form]);

  const busy =
    isBatchesLoading ||
    isManufacturerLoading ||
    createArticle.isPending ||
    confirmIncoming.isPending || 
    updateArticle.isPending;

  const batchesOptions = useMemo<Batch[] | undefined>(() => batches, [batches]);

  const normalizeUpper = (s?: string) => s?.trim().toUpperCase() ?? "";

  const onSubmit = async (values: FormValues) => {
    if (!selectedCompany?.slug) return;

    const payload: any = {
      ...values,
      part_number: normalizeUpper(values.part_number),
      alternative_part_number:
        values.alternative_part_number?.map((v) => normalizeUpper(v)) ?? [],
      calibration_date: values.calibration_date
        ? format(values.calibration_date, "yyyy-MM-dd")
        : undefined,
      // `next_calibration` se envía tal cual como número
    };

    if (isEditing) {
      await updateArticle.mutateAsync({
        data: { ...payload },
        id: (initialData as any)?.id,
        company: selectedCompany.slug,
      });
      router.push(`/${selectedCompany.slug}/almacen/inventario_articulos`);
    } else {
      await createArticle.mutateAsync({
        company: selectedCompany.slug,
        data: payload,
      });
    }
  };

  const isCalibrated = form.watch("needs_calibration");

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 max-w-7xl mx-auto"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Header */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wrench className="h-5 w-5" />
              Registrar herramienta
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="part_number"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Nro. de parte</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: TW-500" {...field} />
                  </FormControl>
                  <FormDescription>Identificador principal.</FormDescription>
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
                    <Input placeholder="Ej: S-000123" {...field} />
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
                      onChange={field.onChange}
                      placeholder={`Ej: P/N-ALT-01, PN-ALT-02`}
                      label=""
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Clasificación y estado */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Clasificación y estado</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                          form.setValue("manufacturer_id", manufacturer.id.toString(), {
                            shouldValidate: true,
                          });
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
                          disabled={isManufacturerLoading || isManufacturerError}
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
                                manufacturers?.find((m) => `${m.id}` === field.value)
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
                            {manufacturers?.map((manufacturer) => (
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
                                <p>{manufacturer.name}</p>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Marca del fabricante.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="batch_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Descripción</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isBatchesLoading}
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
                      {batchesOptions?.map((b) => (
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
            <FormField
              control={form.control}
              name="zone"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Ubicación interna</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Taller, Estantería B" {...field} />
                  </FormControl>
                  <FormDescription>
                    Zona física en almacén/taller.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Calibración */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Calibración</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                    <FormItem className="flex flex-col w-full mt-1.5 space-y-3">
                      <FormLabel>Última calibración</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Seleccione una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            locale={es}
                            mode="single"
                            selected={field.value}
                            onSelect={(d) =>
                              form.setValue("calibration_date", d, {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                            initialFocus
                            month={field.value}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Fecha de la última calibración realizada.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
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
                          value={field.value as any}
                          onChange={(e) => field.onChange(e.target.value)}
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
          </CardContent>
        </Card>

        {/* Detalles y documentos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Detalles y documentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Ej: Torquímetro 1/2'' rango 20–200 Nm..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Breve descripción técnica.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Imagen</FormLabel>
                    <FormControl>
                      <div className="relative h-10 w-full">
                        <FileUpIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f)
                              form.setValue("image", f, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                          }}
                          className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6E23DD] focus:border-transparent cursor-pointer"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Imagen descriptiva de la herramienta.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="certificate_8130"
                  render={() => (
                    <FormItem>
                      <FormLabel>Certificado 8130</FormLabel>
                      <FormControl>
                        <div className="relative h-10 w-full">
                          <FileUpIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                          <Input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f)
                                form.setValue("certificate_8130", f, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                            }}
                            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6E23DD] focus:border-transparent cursor-pointer"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        PDF o imagen. Máx. 10 MB.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certificate_fabricant"
                  render={() => (
                    <FormItem>
                      <FormLabel>Certificado del fabricante</FormLabel>
                      <FormControl>
                        <div className="relative h-10 w-full">
                          <FileUpIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                          <Input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f)
                                form.setValue("certificate_fabricant", f, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                            }}
                            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6E23DD] focus:border-transparent cursor-pointer"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        PDF o imagen. Máx. 10 MB.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certificate_vendor"
                  render={() => (
                    <FormItem>
                      <FormLabel>Certificado del vendedor</FormLabel>
                      <FormControl>
                        <div className="relative h-10 w-full">
                          <FileUpIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                          <Input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f)
                                form.setValue("certificate_vendor", f, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                            }}
                            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6E23DD] focus:border-transparent cursor-pointer"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        PDF o imagen. Máx. 10 MB.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

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
