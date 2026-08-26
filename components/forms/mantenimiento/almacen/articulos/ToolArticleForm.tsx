"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { Gauge, Wrench } from "lucide-react";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { cn } from "@/lib/utils";

import {
    ArticleDetailsSection,
    savedImageUrl,
} from "@/components/forms/mantenimiento/almacen/_components/ArticleDetailsSection";
import { CheckboxCard } from "@/components/forms/mantenimiento/almacen/_components/CheckboxCard";
import {
    FormSection,
    fieldClass,
    hintClass,
    labelClass,
    selectTriggerClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";

import { ArticleFormShell } from "./ArticleFormShell";
import {
    ArticlePreviewDialog,
    previewDate,
    previewList,
    type PreviewGroup,
} from "./ArticlePreviewDialog";
import { IdentificationSection } from "./sections/IdentificationSection";
import { DestinationChecks } from "./sections/DestinationChecks";
import { WarehouseDetailsSection } from "./sections/WarehouseDetailsSection";
import type { ArticleFormProps } from "./types";
import { useArticleForm, useReportFormState } from "./useArticleForm";

const formSchema = z
    .object({
        part_number: z.string().min(2, "El número de parte debe tener al menos 2 caracteres."),
        alternative_part_number: z.array(z.string().min(2)).optional(),
        serial: z.string().optional(),
        model: z.string().optional(),
        description: z.string().optional(),
        zone: z.string().optional(),
        manufacturer_id: z.string().min(1, "Seleccione un fabricante"),
        batch_id: z.string().min(1, "Seleccione una descripción"),

        needs_calibration: z.boolean().optional(),
        calibration_date: z.date().optional(),
        next_calibration: z.coerce.number().int().positive().optional(),

        image: z.instanceof(File).optional(),
        has_documentation: z.boolean().optional(),
        destination_unknown: z.boolean().optional(),
        goes_to_inventory: z.boolean().optional(),
        purchase_order_number: z.string().optional(),

        sender: z.string().optional(),
        origin: z.string().optional(),
        destination: z.string().optional(),
        justification: z.string().optional(),
    })
    .superRefine((values, ctx) => {
        if (!values.needs_calibration) return;

        if (!values.calibration_date) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Ingrese la última fecha de calibración.",
                path: ["calibration_date"],
            });
        }
        if (!values.next_calibration || values.next_calibration <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Indique el periodo de calibración.",
                path: ["next_calibration"],
            });
        }
    });

type FormValues = z.infer<typeof formSchema>;

const apiDate = (value?: Date | null) =>
    value instanceof Date && !Number.isNaN(value.getTime())
        ? format(value, "yyyy-MM-dd")
        : undefined;

/**
 * Registro de herramientas, para cualquier destino.
 *
 * Reemplaza a DirectRegisterToolForm, ReceptionRegisterToolForm y
 * CreateToolForm, que eran el mismo formulario con distinto `status`.
 */
export default function ToolArticleForm({
    initialData,
    isEditing,
    onEditSuccess,
    submitLabel,
    onStateChange,
}: ArticleFormProps) {
    const [receptionDate, setReceptionDate] = useState<Date | null | undefined>(
        initialData?.reception_date ? parseISO(initialData.reception_date) : null,
    );
    const [preview, setPreview] = useState<FormValues | null>(null);

    // El artículo llega como `batch` (endpoint show) o `batches` según el origen.
    const currentBatch = useMemo(
        () => initialData?.batch ?? initialData?.batches,
        [initialData],
    );

    const defaults = useMemo<FormValues>(
        () => ({
            part_number: initialData?.part_number ?? "",
            alternative_part_number: initialData?.alternative_part_number ?? [],
            serial: initialData?.serial ?? "",
            model: initialData?.tool?.model ?? "",
            description: initialData?.description ?? "",
            zone: initialData?.zone ?? "",
            manufacturer_id: initialData?.manufacturer?.id?.toString() ?? "",
            batch_id: currentBatch?.id?.toString() ?? "",
            needs_calibration: initialData?.tool?.needs_calibration ?? false,
            calibration_date: initialData?.tool?.calibration_date
                ? parseISO(initialData.tool.calibration_date)
                : undefined,
            next_calibration: initialData?.tool?.next_calibration
                ? Number(initialData.tool.next_calibration)
                : undefined,
            has_documentation:
                (initialData?.has_documentation ?? false) ||
                (initialData?.document_requirements?.length ?? 0) > 0,
            destination_unknown: false,
            goes_to_inventory: false,
            purchase_order_number: initialData?.purchase_order_number ?? "",
            sender: (initialData as any)?.article_detail?.sender ?? "",
            origin: (initialData as any)?.article_detail?.origin ?? "",
            destination: (initialData as any)?.article_detail?.destination ?? "",
            justification: (initialData as any)?.article_detail?.justification ?? "",
        }),
        [currentBatch, initialData],
    );

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaults,
        mode: "onBlur",
    });

    const initialReceptionRef = useMemo(
        () => (initialData?.reception_date ? parseISO(initialData.reception_date).getTime() : null),
        [initialData],
    );
    const datesDirty = (receptionDate?.getTime() ?? null) !== initialReceptionRef;

    const {
        batches,
        batchesLoading,
        refetchBatches,
        manufacturers,
        manufacturersLoading,
        documents,
        setDocuments,
        reloadDocuments,
        busy,
        submit,
        canSaveWith,
        reportState,
        router,
    } = useArticleForm({
        category: "TOOL",
        articleType: "tool",
        initialData,
        isEditing,
        onEditSuccess,
        onStateChange,
        extraDirty: datesDirty,
    });

    useEffect(() => {
        if (!initialData) return;
        form.reset(defaults);
        reloadDocuments(initialData);
    }, [defaults, form, initialData, reloadDocuments]);

    const needsCalibration = form.watch("needs_calibration");
    const hasDocumentation = form.watch("has_documentation");

    const canSave = canSaveWith(
        form.formState.isDirty,
        !!form.watch("part_number") && !!form.watch("batch_id") && !!form.watch("manufacturer_id"),
    );
    useReportFormState(reportState, canSave);

    const save = async (values: FormValues) => {
        const { destination_unknown, goes_to_inventory, purchase_order_number, ...rest } =
            values;

        // El número lo define la orden del sistema: no se reenvía para que no
        // pueda pisar el de la orden por otra vía que no sea el formulario.
        const manualOrderNumber = initialData?.purchase_order_id
            ? {}
            : { purchase_order_number: purchase_order_number?.trim() || undefined };

        await submit({
            hasDocumentation: values.has_documentation,
            destination: { destination_unknown, goes_to_inventory },
            payload: {
                ...rest,
                ...manualOrderNumber,
                calibration_date: apiDate(values.calibration_date),
                reception_date: apiDate(receptionDate),
            },
            afterCreate: () => {
                form.reset();
                setReceptionDate(null);
            },
        });

        setPreview(null);
    };

    const previewGroups: PreviewGroup[] = useMemo(() => {
        const values = preview;
        if (!values) return [];

        const batchName = batches?.find((b) => `${b.id}` === values.batch_id)?.name;
        const manufacturerName = manufacturers?.find(
            (m) => `${m.id}` === values.manufacturer_id,
        )?.name;

        return [
            {
                title: "Identificación",
                fields: [
                    { label: "Nro. de parte", value: values.part_number },
                    {
                        label: "Nros. alternos",
                        value: previewList(values.alternative_part_number),
                    },
                    { label: "Descripción", value: batchName },
                    { label: "Serial", value: values.serial },
                    { label: "Modelo", value: values.model },
                    { label: "Fabricante", value: manufacturerName },
                    { label: "Ubicación interna", value: values.zone },
                    { label: "Nro. de orden de compra", value: values.purchase_order_number },
                ],
            },
            {
                title: "Calibración",
                fields: values.needs_calibration
                    ? [
                          { label: "Última calibración", value: previewDate(values.calibration_date) },
                          {
                              label: "Periodo",
                              value: values.next_calibration
                                  ? `${values.next_calibration} días`
                                  : undefined,
                          },
                      ]
                    : [{ label: "¿Requiere calibración?", value: "No" }],
            },
            {
                title: "Detalles de almacén",
                fields: [
                    { label: "Remitente", value: values.sender },
                    { label: "Origen", value: values.origin },
                    { label: "Destino", value: values.destination },
                    { label: "Fecha de recepción", value: previewDate(receptionDate) },
                    { label: "Justificación", value: values.justification, full: true },
                ],
            },
            {
                title: "Detalles y documentos",
                fields: [
                    { label: "¿Tiene documentación?", value: values.has_documentation ? "Sí" : "No" },
                    {
                        label: "Documentos seleccionados",
                        value: values.has_documentation ? documents.length : undefined,
                    },
                    { label: "Imagen", value: values.image?.name ?? "Ninguna" },
                    {
                        label: "Destino indeterminado",
                        value: values.destination_unknown ? "Sí" : "No",
                    },
                    { label: "Observaciones", value: values.description, full: true },
                ],
            },
        ];
    }, [batches, documents.length, manufacturers, preview, receptionDate]);

    return (
        <Form {...form}>
            <ArticleFormShell
                isEditing={isEditing}
                busy={busy}
                canSave={canSave}
                submitLabel={submitLabel}
                hideActions={!!onStateChange}
                onCancel={() => router.back()}
                // Al crear se revisa antes de confirmar; al editar el usuario
                // ya conoce el artículo y el paso extra solo estorba.
                onSubmit={form.handleSubmit((values) =>
                    isEditing ? save(values) : setPreview(values),
                )}
            >
                <IdentificationSection
                    form={form}
                    batches={batches}
                    batchesLoading={batchesLoading}
                    manufacturers={manufacturers}
                    manufacturersLoading={manufacturersLoading}
                    batchLabel="Descripción de herramienta"
                    batchCategory="TOOL"
                    purchaseOrderLocked={!!initialData?.purchase_order_id}
                    disabled={busy}
                    onBatchCreated={async (batchName) => {
                        const { data: updated } = await refetchBatches();
                        const created = updated?.find((batch) => batch.name === batchName);
                        if (created) {
                            form.setValue("batch_id", created.id.toString(), {
                                shouldValidate: true,
                                shouldDirty: true,
                            });
                        }
                    }}
                    identifiers={
                        <FormField
                            control={form.control}
                            name="serial"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel className={labelClass}>Serial</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: S-000123"
                                            {...field}
                                            value={field.value ?? ""}
                                            disabled={busy}
                                            className={fieldClass}
                                        />
                                    </FormControl>
                                    <FormDescription className={hintClass}>
                                        Serial de la herramienta.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    }
                >
                    <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel className={labelClass}>Modelo</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ej: TW-500-A"
                                        {...field}
                                        value={field.value ?? ""}
                                        disabled={busy}
                                        className={fieldClass}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </IdentificationSection>

                <FormSection
                    icon={Gauge}
                    title="Calibración"
                    hint="Solo si la herramienta requiere un ciclo de calibración."
                >
                    <div className="space-y-4">
                        <CheckboxCard
                            id="needs-calibration"
                            checked={needsCalibration}
                            onCheckedChange={(checked) =>
                                form.setValue("needs_calibration", checked, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                })
                            }
                            label="¿Requiere calibración?"
                            description="Activa los campos del ciclo de calibración."
                            disabled={busy}
                        />

                        {/* Sub-grid propio: si estos campos fueran hijos directos
                            del grid de la sección, aparecer y desaparecer
                            reordenaría el resto de las celdas. */}
                        {needsCalibration && (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="calibration_date"
                                    render={({ field }) => (
                                        // `space-y-0`: el campo ya trae su propia
                                        // separación entre rótulo e input.
                                        <FormItem className="w-full space-y-0">
                                            <DatePickerField
                                                label="Última calibración"
                                                value={field.value}
                                                setValue={(date) =>
                                                    form.setValue(
                                                        "calibration_date",
                                                        date ?? undefined,
                                                        { shouldDirty: true, shouldValidate: true },
                                                    )
                                                }
                                                description="Fecha de la última calibración realizada."
                                                busy={busy}
                                                shortcuts="back"
                                                maxYear={new Date().getFullYear()}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="next_calibration"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            {/* `h-4`: iguala la altura del rótulo
                                                del campo de fecha, que reserva
                                                sitio para su casilla. */}
                                            <FormLabel
                                                className={cn(labelClass, "flex h-4 items-center")}
                                            >
                                                Periodo de calibración
                                            </FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value ? String(field.value) : undefined}
                                                disabled={busy}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className={selectTriggerClass}>
                                                        <SelectValue placeholder="Seleccione un periodo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="365">Anual (365 días)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription className={hintClass}>
                                                Periodo para programar la próxima calibración.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </div>
                </FormSection>

                <WarehouseDetailsSection
                    control={form.control}
                    receptionDate={receptionDate}
                    onReceptionDateChange={setReceptionDate}
                    disabled={busy}
                />

                <ArticleDetailsSection
                    control={form.control}
                    descriptionPlaceholder="Ej: Torquímetro 1/2'' rango 20–200 Nm..."
                    descriptionHint="Observaciones sobre la herramienta."
                    imageLabel="Imagen de la herramienta"
                    imageFile={form.watch("image")}
                    onImageChange={(file) =>
                        form.setValue("image", file, { shouldDirty: true, shouldValidate: true })
                    }
                    currentImageUrl={savedImageUrl(initialData?.image)}
                    hasDocumentation={hasDocumentation}
                    onHasDocumentationChange={(checked) =>
                        form.setValue("has_documentation", checked, { shouldDirty: true })
                    }
                    documents={documents}
                    onDocumentsChange={setDocuments}
                    consignedRequirements={initialData?.document_requirements}
                    disabled={busy}
                />

                {!isEditing && <DestinationChecks form={form} disabled={busy} />}
            </ArticleFormShell>

            <ArticlePreviewDialog
                open={!!preview}
                onClose={() => setPreview(null)}
                onConfirm={() => preview && save(preview)}
                title="Vista previa de la herramienta"
                groups={previewGroups}
                busy={busy}
            />
        </Form>
    );
}
