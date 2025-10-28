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

import { useGetConditions } from "@/hooks/administracion/useGetConditions";
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";
import { useGetBatchesByCategory } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByCategory";

import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Batch } from "@/types";

import loadingGif from "@/public/loading2.gif";
import { EditingArticle } from "./RegisterArticleForm";
import { CreateManufacturerDialog } from "@/components/dialogs/general/CreateManufacturerDialog";

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
    condition_id: z.string().min(1, "Seleccione una condición"),
    batch_id: z.string().min(1, "Seleccione una categoría"),

    // Calibración
    needs_calibration: z.boolean().optional(),
    last_calibration_date: z.date().optional(),
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
      if (!vals.last_calibration_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese la última fecha de calibración.",
          path: ["last_calibration_date"],
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
}: {
  label: string;
  value?: Date;
  onSelect: (d?: Date) => void;
  description?: string;
  busy?: boolean;
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
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar locale={es} mode="single" selected={value} onSelect={onSelect} initialFocus month={value} />
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
  const { selectedCompany } = useCompanyStore();

  const { data: batches, isPending: isBatchesLoading, isError: isBatchesError } = useGetBatchesByCategory("herramienta");
  const { data: manufacturers, isLoading: isManufacturerLoading, isError: isManufacturerError } = useGetManufacturers(selectedCompany?.slug);
  const { data: conditions, isLoading: isConditionsLoading, error: isConditionsError } = useGetConditions();

  const { createArticle } = useCreateArticle();
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
      condition_id: initialData?.condition?.id?.toString() || "",
      batch_id: initialData?.batches?.id?.toString() || "",
      needs_calibration: initialData?.tool?.needs_calibration ?? false,
      last_calibration_date: initialData?.tool?.last_calibration_date ? new Date(initialData.tool.last_calibration_date) : undefined,
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
      condition_id: initialData.condition?.id?.toString() || "",
      batch_id: initialData.batches?.id?.toString() || "",
      needs_calibration: initialData.tool?.needs_calibration ?? false,
      last_calibration_date: initialData.tool?.last_calibration_date ? new Date(initialData.tool.last_calibration_date) : undefined,
      next_calibration: undefined,
    });
  }, [initialData, form]);

  const busy = isBatchesLoading || isManufacturerLoading || isConditionsLoading || createArticle.isPending || confirmIncoming.isPending;

  const batchesOptions = useMemo<Batch[] | undefined>(() => batches, [batches]);

  const normalizeUpper = (s?: string) => s?.trim().toUpperCase() ?? "";

  async function onSubmit(values: FormValues) {
    if (!selectedCompany?.slug) return;

    const payload: any = {
      ...values,
      status: "CHECKING",
      part_number: normalizeUpper(values.part_number),
      alternative_part_number: values.alternative_part_number?.map((v) => normalizeUpper(v)) ?? [],
      last_calibration_date: values.last_calibration_date ? format(values.last_calibration_date, "yyyy-MM-dd") : undefined,
      // next_calibration se envía como número si existe
    };

    if (isEditing) {
      await confirmIncoming.mutateAsync({ values: { ...payload, id: (initialData as any)?.id, status: "Stored" }, company: selectedCompany.slug });
      router.push(`/${selectedCompany.slug}/almacen/ingreso/en_recepcion`);
    } else {
      await createArticle.mutateAsync({ company: selectedCompany.slug, data: payload });
      form.reset();
    }
  }

  const isCalibrated = form.watch("needs_calibration");

  return (
    <Form {...form}>
      <form className="flex flex-col gap-6 max-w-7xl mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
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
                      disabled={busy}
                      onBlur={(e) => field.onChange(normalizeUpper(e.target.value))}
                    />
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
                    <Input placeholder="Ej: S-000123" {...field} disabled={busy} />
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
                      onChange={(vals) => field.onChange(vals.map((v: string) => normalizeUpper(v)))}
                      placeholder={`Ej: P/N-ALT-01, PN-ALT-02`}
                      label=""
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

                        <FormField
              control={form.control}
              name="batch_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isBatchesLoading || busy}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isBatchesLoading ? "Cargando..." : "Seleccione categoría..."} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {batchesOptions?.map((b) => (
                        <SelectItem key={b.id} value={b.id.toString()}>
                          {b.name}
                        </SelectItem>
                      ))}
                      {(!batchesOptions || batchesOptions.length === 0) && !isBatchesLoading && !isBatchesError && (
                        <div className="p-2 text-sm text-muted-foreground text-center">No se han encontrado categorías.</div>
                      )}
                      {isBatchesError && <div className="p-2 text-sm text-muted-foreground text-center">Error al cargar categorías.</div>}
                    </SelectContent>
                  </Select>
                  <FormDescription>Clasificación interna.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={isManufacturerLoading || busy}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isManufacturerLoading ? "Cargando..." : "Seleccione..."} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {manufacturers?.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          {m.name}
                        </SelectItem>
                      ))}
                      {isManufacturerError && <div className="p-2 text-sm text-muted-foreground">Error al cargar fabricantes.</div>}
                    </SelectContent>
                  </Select>
                  <FormDescription>Marca del fabricante.</FormDescription>
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
                      {isConditionsError && <div className="p-2 text-sm text-muted-foreground">Error al cargar condiciones.</div>}
                    </SelectContent>
                  </Select>
                  <FormDescription>Estado físico/operativo.</FormDescription>
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
                    <Input placeholder="Ej: Taller, Estantería B" {...field} disabled={busy} />
                  </FormControl>
                  <FormDescription>Zona física en almacén/taller.</FormDescription>
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
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>¿Requiere calibración?</FormLabel>
                    <FormDescription>Activa los campos de calibración si aplica.</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {isCalibrated && (
              <>
                <FormField
                  control={form.control}
                  name="last_calibration_date"
                  render={({ field }) => (
                    <DatePickerField
                      label="Última calibración"
                      value={field.value}
                      onSelect={(d) => form.setValue("last_calibration_date", d, { shouldDirty: true, shouldValidate: true })}
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
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          disabled={busy}
                        />
                      </FormControl>
                      <FormDescription>Número de días para programar la próxima calibración.</FormDescription>
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
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="Ej: Torquímetro 1/2'' rango 20–200 Nm..." {...field} disabled={busy} />
                  </FormControl>
                  <FormDescription>Breve descripción técnica.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileField form={form} name="image" label="Imagen" accept="image/*" description="Imagen descriptiva de la herramienta." busy={busy} />

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
            disabled={busy || !selectedCompany || !form.getValues("part_number") || !form.getValues("batch_id") || !form.getValues("manufacturer_id") || !form.getValues("condition_id")}
            type="submit"
          >
            {busy ? <Image className="text-black" src={loadingGif} width={170} height={170} alt="Cargando..." /> : <span>{isEditing ? "Confirmar ingreso" : "Crear herramienta"}</span>}
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
