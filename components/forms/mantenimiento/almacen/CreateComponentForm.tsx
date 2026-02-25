"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

import { useCompanyStore } from "@/stores/CompanyStore";

import { cn } from "@/lib/utils";
import loadingGif from "@/public/loading2.gif";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MultiInputField } from "../../../misc/MultiInputField";
import { Textarea } from "../../../ui/textarea";
import { EditingArticle } from "./RegisterArticleForm";
import { CreateManufacturerDialog } from "@/components/dialogs/general/CreateManufacturerDialog";

/* ------------------------------- Schema ------------------------------- */

const fileMaxBytes = 10_000_000; // 10 MB

const formSchema = z
  .object({
    serial: z
      .string()
      .min(2, { message: "El serial debe contener al menos 2 caracteres." })
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
    zone: z
      .string({ message: "Debe ingresar la ubicación del artículo." })
      .min(1, "Campo requerido"),
    expiration_date: z.string().optional(),
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
  })
  .superRefine((vals, ctx) => {
    // Relaciones de fechas si existen
    if (vals.fabrication_date && vals.expiration_date) {
      if (vals.fabrication_date > vals.expiration_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "La fecha de fabricación no puede ser posterior a la fecha de caducidad.",
          path: ["fabrication_date"],
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

/* ----------------------------- Componente ----------------------------- */

const CreateComponentForm = ({
  initialData,
  isEditing,
}: {
  initialData?: EditingArticle;
  isEditing?: boolean;
}) => {
  const router = useRouter();
  const handleDownload = async (url: string) => {
    if (!url) return;
    try {
      const response = await axiosInstance.get(`/warehouse/download-certificate/${url}`, {
        responseType: 'blob',
      });

      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', url.split('/').pop() || 'certificate');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Certificado descargado correctamente");
    } catch (error) {
      console.error('Error descargando el archivo:', error);
      toast.error("Error al descargar el certificado");
    }
  };

  const [fabricationDate, setFabricationDate] = useState<Date | undefined>(
    initialData?.part_component?.fabrication_date
      ? new Date(initialData.part_component.fabrication_date)
      : undefined
  );
  const [caducateDate, setCaducateDate] = useState<Date | undefined>(
    initialData?.part_component?.expiration_date
      ? new Date(initialData.part_component.expiration_date)
      : undefined
  );
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(
    initialData?.part_component?.calendary_date
      ? new Date(initialData.part_component.calendary_date)
      : undefined
  );
  const { selectedCompany } = useCompanyStore();

  const {
    data: batches,
    isPending: isBatchesLoading,
    isError: isBatchesError,
  } = useGetBatchesByCategory("COMPONENT");

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

  const { createArticle } = useCreateArticle();

  const { updateArticle } = useUpdateArticle();

  const { confirmIncoming } = useConfirmIncomingArticle();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      part_number: initialData?.part_number || "",
      serial: initialData?.serial || "",
      alternative_part_number: initialData?.alternative_part_number || [],
      batch_id: initialData?.batches?.id?.toString() || "",
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
      expiration_date: initialData?.part_component?.expiration_date
        ? initialData?.part_component?.expiration_date
        : undefined,
      fabrication_date: initialData?.part_component?.fabrication_date
        ? initialData?.part_component?.fabrication_date
        : undefined,
    },
  });

  // Reset si cambia initialData
  useEffect(() => {
    if (!initialData) return;
    form.reset({
      part_number: initialData.part_number ?? "",
      serial: initialData.serial ?? "",
      alternative_part_number: initialData.alternative_part_number ?? [],
      batch_id: initialData.batches?.id?.toString() ?? "",
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
      expiration_date: initialData.part_component?.expiration_date
        ? initialData.part_component?.expiration_date
        : undefined,
      fabrication_date: initialData.part_component?.fabrication_date
        ? initialData.part_component?.fabrication_date
        : undefined,
    });
  }, [initialData, form]);
  const busy =
    isBatchesLoading ||
    isManufacturerLoading ||
    isConditionsLoading ||
    createArticle.isPending ||
    confirmIncoming.isPending;

  const normalizeUpper = (s?: string) => s?.trim().toUpperCase() ?? "";

  const onSubmit = async (values: FormValues) => {
    if (!selectedCompany?.slug) return;

    const formattedValues: FormValues & {
      expiration_date?: string;
      fabrication_date?: string;
      calendar_date?: string;
      part_number: string;
      article_type: string;
      alternative_part_number?: string[];
    } = {
      ...values,
      article_type: "componente",
      part_number: normalizeUpper(values.part_number),
      alternative_part_number:
        values.alternative_part_number?.map((v) => normalizeUpper(v)) ?? [],
      expiration_date: caducateDate
        ? format(caducateDate, "yyyy-MM-dd")
        : undefined,
      fabrication_date: fabricationDate
        ? format(fabricationDate, "yyyy-MM-dd")
        : undefined,
      calendar_date:
        values.calendar_date && format(values.calendar_date, "yyyy-MM-dd"),
    };

    if (isEditing && initialData) {
      await updateArticle.mutateAsync({
        data: {
          ...formattedValues,
          batch_id: formattedValues.batch_id,
          article_type: "componente",
        },
        company: selectedCompany.slug,
        id: initialData.id,
      });
      router.push(`/${selectedCompany.slug}/almacen/inventario_articulos`);
    } else {
      await createArticle.mutateAsync({
        company: selectedCompany.slug,
        data: formattedValues,
      });
      form.reset();
    }
  };
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 max-w-7xl mx-auto"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Encabezado */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Registrar componente</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="part_number"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Nro. de parte</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 234ABAC" {...field} />
                  </FormControl>
                  <FormDescription>
                    Identificador principal del artículo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alternative_part_number"
              render={({ field }) => (
                <FormItem className="w-full xl:col-span-2">
                  <FormControl>
                    <MultiInputField
                      values={field.value || []}
                      onChange={field.onChange}
                      placeholder="Ej: 234ABAC"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Identificación y estado */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Identificación y estado</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="serial"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Serial</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 05458E1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Serial del componente si aplica.
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
                    disabled={isConditionsLoading}
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
                  <FormDescription>
                    Estado físico/operativo del artículo.
                  </FormDescription>
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
                                manufacturers
                                  ?.filter((m) => m.type === "PART")
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
                              ?.filter((m) => m.type === "PART")
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
                                  <p>{manufacturer.name}</p>
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
                    <Input placeholder="Ej: Pasillo 4, Estante B" {...field} />
                  </FormControl>
                  <FormDescription>Zona física en almacén.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="batch_id"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-3 mt-1.5 w-full">
                  <FormLabel>Descripción de Componente</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={isBatchesLoading || isBatchesError}
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
                            <p>
                              {
                                batches?.find((b) => `${b.id}` === field.value)
                                  ?.name
                              }
                            </p>
                          ) : (
                            "Elegir descripción..."
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput placeholder="Busque una aeronave..." />
                        <CommandList>
                          <CommandEmpty className="text-xs p-2 text-center">
                            No se ha encontrado ninguna aeronave.
                          </CommandEmpty>
                          <CommandGroup>
                            {batches?.map((batch) => (
                              <CommandItem
                                value={`${batch.name}`}
                                key={batch.id}
                                onSelect={() => {
                                  form.setValue(
                                    "batch_id",
                                    batch.id.toString(),
                                    { shouldValidate: true }
                                  );
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
                    Descripción del componente a registrar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Fechas y límites */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Ciclo de vida</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fabrication_date"
              render={({ field }) => (
                <FormItem className="flex flex-col p-0 mt-2.5 w-full">
                  <FormLabel>Fecha de Fabricacion</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !fabricationDate && "text-muted-foreground"
                          )}
                        >
                          {fabricationDate ? (
                            format(fabricationDate, "PPP", { locale: es })
                          ) : (
                            <span>Seleccione una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Select
                        onValueChange={(value) =>
                          setFabricationDate(
                            subYears(new Date(), parseInt(value))
                          )
                        }
                      >
                        <SelectTrigger className="p-3">
                          <SelectValue placeholder="Seleccione una opcion..." />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="0">Actual</SelectItem>{" "}
                          <SelectItem value="5">Ir 5 años atrás</SelectItem>
                          <SelectItem value="10">Ir 10 años atrás</SelectItem>
                          <SelectItem value="15">Ir 15 años atrás</SelectItem>
                        </SelectContent>
                      </Select>
                      <Calendar
                        locale={es}
                        mode="single"
                        selected={fabricationDate}
                        onSelect={setFabricationDate}
                        initialFocus
                        month={fabricationDate}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Fecha de creación del articulo.
                  </FormDescription>{" "}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiration_date"
              render={({ field }) => (
                <FormItem className="flex flex-col p-0 mt-2.5 w-full">
                  <FormLabel>Fecha de Shell-Life</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !caducateDate && "text-muted-foreground"
                          )}
                        >
                          {caducateDate ? (
                            format(caducateDate, "PPP", { locale: es })
                          ) : (
                            <span>Seleccione una fecha...</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Select
                        onValueChange={(value) =>
                          setCaducateDate(addYears(new Date(), parseInt(value)))
                        }
                      >
                        <SelectTrigger className="p-3">
                          <SelectValue placeholder="Seleccione una opcion..." />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="0">Actual</SelectItem>{" "}
                          <SelectItem value="5">5 años</SelectItem>
                          <SelectItem value="10">10 años</SelectItem>{" "}
                          <SelectItem value="15">15 años</SelectItem>
                        </SelectContent>
                      </Select>
                      <Calendar
                        locale={es}
                        mode="single"
                        selected={caducateDate}
                        onSelect={setCaducateDate}
                        initialFocus
                        month={caducateDate}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Fecha límite del articulo.</FormDescription>{" "}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Descripción y archivos */}
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
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Ej: Motor V8 de..."
                      {...field}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Imagen del artículo</FormLabel>
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
                    <FormDescription>Imagen descriptiva.</FormDescription>
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
                      <FormLabel>
                        Certificado{" "}
                        <span className="text-primary font-semibold">8130</span>
                      </FormLabel>
                      {isEditing && initialData?.certificate_8130 && (
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded mb-2">
                          <span className="font-medium">Archivo actual:</span>{" "}
                          <button
                            type="button"
                            onClick={() => handleDownload(initialData.certificate_8130!)}
                            className="text-primary hover:underline cursor-pointer underline"
                          >
                            {initialData.certificate_8130.split('/').pop()}
                          </button>
                        </div>
                      )}
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
                        {isEditing && initialData?.certificate_8130
                          ? "Subir nuevo archivo para reemplazar el actual"
                          : "PDF o imagen. Máx. 10 MB."}
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
                      <FormLabel>
                        Certificado del{" "}
                        <span className="text-primary">fabricante</span>
                      </FormLabel>
                      {isEditing && initialData?.certificate_fabricant && (
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded mb-2">
                          <span className="font-medium">Archivo actual:</span>{" "}
                          <button
                            type="button"
                            onClick={() => handleDownload(initialData.certificate_fabricant!)}
                            className="text-primary hover:underline cursor-pointer underline"
                          >
                            {initialData.certificate_fabricant.split('/').pop()}
                          </button>
                        </div>
                      )}
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
                        {isEditing && initialData?.certificate_fabricant
                          ? "Subir nuevo archivo para reemplazar el actual"
                          : "PDF o imagen. Máx. 10 MB."}
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
                      <FormLabel>
                        Certificado del{" "}
                        <span className="text-primary">vendedor</span>
                      </FormLabel>
                      {isEditing && initialData?.certificate_vendor && (
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded mb-2">
                          <span className="font-medium">Archivo actual:</span>{" "}
                          <button
                            type="button"
                            onClick={() => handleDownload(initialData.certificate_vendor!)}
                            className="text-primary hover:underline cursor-pointer underline"
                          >
                            {initialData.certificate_vendor.split('/').pop()}
                          </button>
                        </div>
                      )}
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
                        {isEditing && initialData?.certificate_vendor
                          ? "Subir nuevo archivo para reemplazar el actual"
                          : "PDF o imagen. Máx. 10 MB."}
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
              createArticle.isPending ||
              updateArticle.isPending
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
    </Form>
  );
};

export default CreateComponentForm;
