// /components/forms/componentes/CreateComponentForm/CreateComponentForm.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { useCreateArticle, useUpdateArticle } from "@/actions/mantenimiento/almacen/inventario/articulos/actions";

import { useGetConditions } from "@/hooks/administracion/useGetConditions";
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";
import { useGetBatchesByCategory } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByCategory";

import { useCompanyStore } from "@/stores/CompanyStore";
import axiosInstance from "@/lib/axios";
import { cn } from "@/lib/utils";
import loadingGif from "@/public/loading2.gif";
import { toast } from "sonner";

import { CreateManufacturerDialog } from "@/components/dialogs/general/CreateManufacturerDialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

import { EditingArticle } from "./RegisterArticleForm";

import { z } from "zod";
import { FileField } from "@/app/[company]/almacen/ingresar_inventario/_components/FileField";
import { MultiInputField } from "@/components/misc/MultiInputField";
import { Textarea } from "@/components/ui/textarea";

const fileMaxBytes = 10_000_000; // 10 MB

export const formSchema = z.object({
  serial: z
    .string()
    .min(2, { message: "El serial debe contener al menos 2 caracteres." })
    .optional(),

  part_number: z
    .string({ message: "Debe seleccionar un número de parte." })
    .min(2, { message: "El número de parte debe contener al menos 2 caracteres." }),

  alternative_part_number: z
    .array(
      z.string().min(2, {
        message: "Cada número de parte alterno debe contener al menos 2 caracteres.",
      })
    )
    .optional(),

  description: z.string().optional(),

  manufacturer_id: z.string().optional(),

  condition_id: z.string().min(1, "Debe ingresar la condición del artículo."),

  batch_id: z.string({ message: "Debe ingresar un lote." }).min(1, "Seleccione un lote"),

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
});

export type FormValues = z.infer<typeof formSchema>;


type Props = {
  initialData?: EditingArticle;
  isEditing?: boolean;
};

export default function CreateComponentForm({ initialData, isEditing }: Props) {
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();

  const { data: batches, isPending: isBatchesLoading, isError: isBatchesError } =
    useGetBatchesByCategory("COMPONENT");

  const { data: manufacturers, isLoading: isManufacturerLoading, isError: isManufacturerError } =
    useGetManufacturers(selectedCompany?.slug);

  const { data: conditions, isLoading: isConditionsLoading, error: isConditionsError } =
    useGetConditions();

  const { createArticle } = useCreateArticle();
  const { updateArticle } = useUpdateArticle();

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
    },
  });

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
    });
  }, [initialData, form]);

  const busy =
    isBatchesLoading ||
    isManufacturerLoading ||
    isConditionsLoading ||
    createArticle.isPending ||
    updateArticle.isPending;

  const handleDownload = async (url: string) => {
    if (!url) return;
    try {
      const response = await axiosInstance.get(`/warehouse/download-certificate/${url}`, {
        responseType: "blob",
      });

      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", url.split("/").pop() || "certificate");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Certificado descargado correctamente");
    } catch (error) {
      console.error("Error descargando el archivo:", error);
      toast.error("Error al descargar el certificado");
    }
  };

  const normalizeUpper = (s?: string) => s?.trim().toUpperCase() ?? "";

  const onSubmit = async (values: FormValues) => {
    if (!selectedCompany?.slug) return;

    const payload = {
      part_number: normalizeUpper(values.part_number),
      article_type: "componente",
      batch_id: values.batch_id,
      condition_id: values.condition_id,
      manufacturer_id: values.manufacturer_id,
      serial: values.serial,
      alternative_part_number: values.alternative_part_number?.map(normalizeUpper) ?? [],
      description: values.description,
      certificate_8130: values.certificate_8130,
      certificate_fabricant: values.certificate_fabricant,
      certificate_vendor: values.certificate_vendor,
      image: values.image,
      status: "INCOMING",
    }

    if (isEditing && initialData) {
      await updateArticle.mutateAsync({
        company: selectedCompany.slug,
        id: initialData.id,
        data: payload,
      });

      router.push(`/${selectedCompany.slug}/almacen/inventario_articulos`);
      return;
    }

    await createArticle.mutateAsync({
      company: selectedCompany.slug,
      data: payload,
    });

    form.reset({
      part_number: "",
      serial: "",
      alternative_part_number: [],
      batch_id: "",
      manufacturer_id: "",
      condition_id: "",
      description: "",
    });
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-6 max-w-7xl mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Encabezado */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Ingreso administrativo</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="part_number"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Nro. de parte</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 234ABAC" {...field} />
                  </FormControl>
                  <FormDescription>Identificador principal del artículo.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alternative_part_number"
              render={({ field }) => (
                <FormItem className="w-full">
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

            <FormField
              control={form.control}
              name="serial"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Serial</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 05458E1" {...field} />
                  </FormControl>
                  <FormDescription>Si aplica, serial del componente.</FormDescription>
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={isConditionsLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={isConditionsLoading ? "Cargando..." : "Seleccione..."}
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
                          form.setValue("manufacturer_id", manufacturer.id.toString(), {
                            shouldValidate: true,
                          });
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
                          disabled={isManufacturerLoading || isManufacturerError}
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                        >
                          {isManufacturerLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                          {field.value ? (
                            <p>
                              {manufacturers
                                ?.filter((m) => m.type === "PART")
                                .find((m) => `${m.id}` === field.value)?.name}
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
                                    form.setValue("manufacturer_id", manufacturer.id.toString(), {
                                      shouldValidate: true,
                                    });
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      `${manufacturer.id}` === field.value ? "opacity-100" : "opacity-0"
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
              name="batch_id"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-3 mt-1.5 w-full">
                  <FormLabel>Descripción de componente</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={isBatchesLoading || isBatchesError}
                          variant="outline"
                          role="combobox"
                          className={cn("justify-between", !field.value && "text-muted-foreground")}
                        >
                          {isBatchesLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                          {field.value ? (
                            <p>{batches?.find((b) => `${b.id}` === field.value)?.name}</p>
                          ) : (
                            "Elegir descripción..."
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput placeholder="Buscar..." />
                        <CommandList>
                          <CommandEmpty className="text-xs p-2 text-center">
                            No se encontró ningún resultado.
                          </CommandEmpty>
                          <CommandGroup>
                            {batches?.map((batch) => (
                              <CommandItem
                                value={`${batch.name}`}
                                key={batch.id}
                                onSelect={() => {
                                  form.setValue("batch_id", batch.id.toString(), {
                                    shouldValidate: true,
                                  });
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    `${batch.id}` === field.value ? "opacity-100" : "opacity-0"
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
                  <FormDescription>Descripción del componente a registrar.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="Ej: Observación relevante..." {...field} />
                  </FormControl>
                  <FormDescription>Notas del ingreso administrativo.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileField
                control={form.control}
                setValue={form.setValue}
                name="image"
                label="Imagen del artículo"
                accept="image/*"
                description="Imagen descriptiva."
              />

                <FileField
                  control={form.control}
                  setValue={form.setValue}
                  name="certificate_8130"
                  label={
                    <>
                      Certificado <span className="text-primary font-semibold">8130 / 21-004 / EASA 1</span>
                    </>
                  }
                  accept=".pdf,image/*"
                  currentFileLabel={isEditing && initialData?.certificate_8130 ? initialData.certificate_8130.split("/").pop() : undefined}
                  onDownload={
                    isEditing && initialData?.certificate_8130
                      ? () => handleDownload(initialData.certificate_8130!)
                      : undefined
                  }
                />

                <FileField
                  control={form.control}
                  setValue={form.setValue}
                  name="certificate_fabricant"
                  label={
                    <>
                      Certificado del <span className="text-primary">fabricante</span>
                    </>
                  }
                  accept=".pdf,image/*"
                  currentFileLabel={isEditing && initialData?.certificate_fabricant ? initialData.certificate_fabricant.split("/").pop() : undefined}
                  onDownload={
                    isEditing && initialData?.certificate_fabricant
                      ? () => handleDownload(initialData.certificate_fabricant!)
                      : undefined
                  }
                />

                <FileField
                  control={form.control}
                  setValue={form.setValue}
                  name="certificate_vendor"
                  label={
                    <>
                      Certificado del <span className="text-primary">vendedor</span>
                    </>
                  }
                  accept=".pdf,image/*"
                  currentFileLabel={isEditing && initialData?.certificate_vendor ? initialData.certificate_vendor.split("/").pop() : undefined}
                  onDownload={
                    isEditing && initialData?.certificate_vendor
                      ? () => handleDownload(initialData.certificate_vendor!)
                      : undefined
                  }
                />
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
              !form.getValues("batch_id")
            }
            type="submit"
          >
            {busy ? (
              <Image className="text-black" src={loadingGif} width={170} height={170} alt="Cargando..." />
            ) : (
              <span>{isEditing ? "Confirmar ingreso" : "Registrar ingreso"}</span>
            )}
          </Button>

          {busy && (
            <div className="inline-flex items-center text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Procesando…
            </div>
          )}
        </div>

        {/* Indicador interno de status (opcional, por si quieres dejarlo visible en UI) */}
        <p className="text-xs text-muted-foreground">
          Estado al registrar: <span className="font-medium">INCOMING</span>
        </p>
      </form>
    </Form>
  );
}
