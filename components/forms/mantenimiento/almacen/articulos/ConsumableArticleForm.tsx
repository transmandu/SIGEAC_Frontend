"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { CalendarDays, Package, Ruler, Scale } from "lucide-react";

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
import { DatePickerField } from "@/components/ui/DatePickerField";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { useGetConditions } from "@/hooks/administracion/useGetConditions";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Unit } from "@/types";

import {
    ArticleDetailsSection,
    savedImageUrl,
} from "@/components/forms/mantenimiento/almacen/_components/ArticleDetailsSection";
import {
    ConsumableConversionsField,
    type ConsumableConversionInput,
} from "@/components/forms/mantenimiento/almacen/ConsumableConversionsField";
import {
    DimensionFields,
    EMPTY_DIMENSION,
    dimensionPayload,
    type DimensionDraft,
} from "@/components/forms/mantenimiento/almacen/_components/DimensionFields";
import {
    FormSection,
    hintClass,
    labelClass,
    numericFieldClass,
    onlyNumeric,
    fieldClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";

import { ArticleFormShell } from "./ArticleFormShell";
import {
    ArticlePreviewDialog,
    previewDate,
    previewList,
    type PreviewGroup,
} from "./ArticlePreviewDialog";
import {
    IdentificationSection,
    SearchableSelect,
} from "./sections/IdentificationSection";
import { DestinationChecks } from "./sections/DestinationChecks";
import { WarehouseDetailsSection } from "./sections/WarehouseDetailsSection";
import type { ArticleFormProps } from "./types";
import { useArticleForm, useReportFormState } from "./useArticleForm";

const formSchema = z.object({
    part_number: z
        .string({ message: "Debe ingresar un número de parte." })
        .min(2, "El número de parte debe contener al menos 2 caracteres."),
    lot_number: z.string().optional(),
    alternative_part_number: z.array(z.string().min(2)).optional(),
    description: z.string().optional(),
    zone: z.string().optional(),
    manufacturer_id: z.string().optional(),
    condition_id: z.string().optional(),
    batch_id: z.string().min(1, "Seleccione una descripción"),
    quantity: z.coerce
        .number({ message: "Debe ingresar una cantidad." })
        .min(0, "No puede ser negativo."),
    min_quantity: z.coerce.number().min(0, "No puede ser negativo.").optional(),
    primary_unit_id: z.number().optional(),
    image: z.instanceof(File).optional(),
    has_documentation: z.boolean().optional(),
    destination_unknown: z.boolean().optional(),
    goes_to_inventory: z.boolean().optional(),
    purchase_order_number: z.string().optional(),

    sender: z.string().optional(),
    origin: z.string().optional(),
    destination: z.string().optional(),
    justification: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/** El almacén marca "no aplica" con esta fecha centinela. */
const NOT_APPLICABLE = "1900-01-01";

const isNotApplicable = (date?: Date | null) =>
    !!date &&
    date.getFullYear() === 1900 &&
    date.getMonth() === 0 &&
    date.getDate() === 1;

const apiDate = (date?: Date | null) => {
    if (!date) return undefined;
    return isNotApplicable(date) ? NOT_APPLICABLE : format(date, "yyyy-MM-dd");
};

/**
 * Registro de consumibles, para cualquier destino.
 *
 * Reemplaza a DirectRegisterConsumableForm, ReceptionRegisterConsumableForm y
 * CreateConsumableForm.
 */
export default function ConsumableArticleForm({
    initialData,
    isEditing,
    onEditSuccess,
    submitLabel,
    onStateChange,
}: ArticleFormProps) {
    const { selectedCompany } = useCompanyStore();
    const { data: units, isLoading: unitsLoading } = useGetUnits(selectedCompany?.slug);
    const { data: conditions, isLoading: conditionsLoading } = useGetConditions();

    const [fabricationDate, setFabricationDate] = useState<Date | null | undefined>(
        initialData?.consumable?.fabrication_date
            ? parseISO(initialData.consumable.fabrication_date)
            : null,
    );
    const [expirationDate, setExpirationDate] = useState<Date | null | undefined>(
        initialData?.consumable?.expiration_date
            ? parseISO(initialData.consumable.expiration_date)
            : null,
    );
    const [shelfLifeDate, setShelfLifeDate] = useState<Date | null | undefined>(
        initialData?.consumable?.shelf_life
            ? parseISO(initialData.consumable.shelf_life)
            : null,
    );
    const [receptionDate, setReceptionDate] = useState<Date | null | undefined>(
        initialData?.reception_date ? parseISO(initialData.reception_date) : null,
    );

    // Conversiones y dimensiones son listas, no campos: viajan junto al payload.
    const [conversions, setConversions] = useState<ConsumableConversionInput[]>([]);
    const [dimension, setDimension] = useState<DimensionDraft>(EMPTY_DIMENSION);
    const [baseUnit, setBaseUnit] = useState<Unit | null>(null);

    const [preview, setPreview] = useState<FormValues | null>(null);

    const currentBatch = useMemo(
        () => initialData?.batch ?? initialData?.batches,
        [initialData],
    );

    const defaults = useMemo<FormValues>(
        () => ({
            part_number: initialData?.part_number ?? "",
            lot_number: initialData?.consumable?.lot_number ?? "",
            alternative_part_number: initialData?.alternative_part_number ?? [],
            description: initialData?.description ?? "",
            zone: initialData?.zone ?? "",
            manufacturer_id: initialData?.manufacturer?.id?.toString() ?? "",
            condition_id: initialData?.condition?.id?.toString() ?? "",
            batch_id: currentBatch?.id?.toString() ?? "",
            quantity: initialData?.consumable?.quantity ?? 0,
            min_quantity: initialData?.consumable?.min_quantity
                ? Number(initialData.consumable.min_quantity)
                : undefined,
            primary_unit_id: initialData?.consumable?.primary_unit_id
                ? Number(initialData.consumable.primary_unit_id)
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

    // Al editar, la unidad base ya está fijada por el consumible existente.
    useEffect(() => {
        const unitId = initialData?.consumable?.primary_unit_id;
        if (!unitId || !units) return;

        setBaseUnit(units.find((unit) => `${unit.id}` === `${unitId}`) ?? null);
    }, [initialData, units]);

    const initialDatesRef = useMemo(
        () => ({
            fabrication: initialData?.consumable?.fabrication_date
                ? parseISO(initialData.consumable.fabrication_date).getTime()
                : null,
            expiration: initialData?.consumable?.expiration_date
                ? parseISO(initialData.consumable.expiration_date).getTime()
                : null,
            shelfLife: initialData?.consumable?.shelf_life
                ? parseISO(initialData.consumable.shelf_life).getTime()
                : null,
            reception: initialData?.reception_date
                ? parseISO(initialData.reception_date).getTime()
                : null,
        }),
        [initialData],
    );

    const datesDirty =
        (fabricationDate?.getTime() ?? null) !== initialDatesRef.fabrication ||
        (expirationDate?.getTime() ?? null) !== initialDatesRef.expiration ||
        (shelfLifeDate?.getTime() ?? null) !== initialDatesRef.shelfLife ||
        (receptionDate?.getTime() ?? null) !== initialDatesRef.reception;

    const {
        batches,
        batchesLoading,
        refetchBatches,
        manufacturers,
        manufacturersLoading,
        documents,
        setDocuments,
        reloadDocuments,
        busy: baseBusy,
        submit,
        canSaveWith,
        reportState,
        router,
    } = useArticleForm({
        category: "CONSUMABLE",
        articleType: "consumable",
        initialData,
        isEditing,
        onEditSuccess,
        onStateChange,
        extraDirty: datesDirty,
    });

    const busy = baseBusy || unitsLoading || conditionsLoading;

    useEffect(() => {
        if (!initialData) return;
        form.reset(defaults);
        reloadDocuments(initialData);
    }, [defaults, form, initialData, reloadDocuments]);

    const hasDocumentation = form.watch("has_documentation");
    const quantity = form.watch("quantity");

    const canSave = canSaveWith(
        form.formState.isDirty,
        !!form.watch("part_number") && !!form.watch("batch_id"),
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
                fabrication_date: apiDate(fabricationDate),
                expiration_date: apiDate(expirationDate),
                shelf_life: apiDate(shelfLifeDate),
                reception_date: apiDate(receptionDate),
                primary_unit_id: baseUnit?.id,
                conversions,
                // Solo activa el modo dimensional; un consumible ya dimensionado
                // conserva sus medidas y el backend ignora el reenvío.
                dimension:
                    dimensionPayload(dimension, !!initialData?.consumable?.dimension) ??
                    undefined,
            },
            afterCreate: () => {
                form.reset();
                setConversions([]);
                setDimension(EMPTY_DIMENSION);
                setFabricationDate(null);
                setExpirationDate(null);
                setShelfLifeDate(null);
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
        const conditionName = conditions?.find(
            (c) => `${c.id}` === values.condition_id,
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
                    { label: "Nro. de lote", value: values.lot_number },
                    { label: "Condición", value: conditionName },
                    { label: "Fabricante", value: manufacturerName },
                    { label: "Ubicación interna", value: values.zone },
                    { label: "Nro. de orden de compra", value: values.purchase_order_number },
                ],
            },
            {
                title: "Cantidad y unidades",
                fields: [
                    {
                        label: "Cantidad",
                        value: baseUnit
                            ? `${values.quantity} ${baseUnit.label}`
                            : values.quantity,
                    },
                    { label: "Cantidad mínima", value: values.min_quantity },
                    { label: "Unidad base", value: baseUnit?.label },
                    { label: "Equivalencias declaradas", value: conversions.length },
                ],
            },
            {
                title: "Fechas",
                fields: [
                    { label: "Fabricación", value: previewDate(fabricationDate) },
                    { label: "Caducidad", value: previewDate(expirationDate) },
                    { label: "Shelf Life", value: previewDate(shelfLifeDate) },
                ],
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
    }, [
        baseUnit,
        batches,
        conditions,
        conversions.length,
        documents.length,
        expirationDate,
        fabricationDate,
        manufacturers,
        shelfLifeDate,
        preview,
        receptionDate,
    ]);

    return (
        <Form {...form}>
            <ArticleFormShell
                isEditing={isEditing}
                busy={busy}
                canSave={canSave}
                submitLabel={submitLabel}
                hideActions={!!onStateChange}
                onCancel={() => router.back()}
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
                    batchLabel="Descripción de consumible"
                    batchCategory="CONSUMABLE"
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
                >
                    <FormField
                        control={form.control}
                        name="lot_number"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel className={labelClass}>Nro. de lote</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ej: LOTE123"
                                        {...field}
                                        value={field.value ?? ""}
                                        disabled={busy}
                                        className={fieldClass}
                                    />
                                </FormControl>
                                <FormDescription className={hintClass}>
                                    Lote del consumible.
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
                                <FormLabel className={labelClass}>Condición</FormLabel>
                                <SearchableSelect
                                    options={conditions}
                                    value={field.value}
                                    loading={conditionsLoading}
                                    disabled={busy}
                                    placeholder="Seleccione condición..."
                                    searchPlaceholder="Buscar condición..."
                                    emptyLabel="No se encontró la condición."
                                    onSelect={(condition) =>
                                        form.setValue("condition_id", condition.id.toString(), {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        })
                                    }
                                />
                                <FormDescription className={hintClass}>
                                    Estado del artículo.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </IdentificationSection>

                <FormSection
                    icon={Package}
                    title="Cantidad y unidad base"
                    hint="En qué se cuenta el consumible y cuánto ingresa."
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <FormItem className="w-full">
                            <FormLabel className={labelClass}>Unidad base</FormLabel>
                            <SearchableSelect
                                options={units?.map((unit) => ({ ...unit, name: unit.label }))}
                                value={baseUnit ? `${baseUnit.id}` : undefined}
                                loading={unitsLoading}
                                // La unidad base define las equivalencias ya
                                // declaradas: cambiarla después las invalidaría.
                                disabled={busy || isEditing}
                                placeholder="Seleccione unidad..."
                                searchPlaceholder="Buscar unidad..."
                                emptyLabel="No hay unidades disponibles."
                                onSelect={(unit) => {
                                    setBaseUnit(unit as unknown as Unit);
                                    form.setValue("primary_unit_id", Number(unit.id), {
                                        shouldDirty: true,
                                    });
                                }}
                            />
                            <FormDescription className={hintClass}>
                                En qué se cuenta: LITROS, GALONES, UNIDADES…
                            </FormDescription>
                        </FormItem>

                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel className={labelClass}>Cantidad</FormLabel>
                                    <FormControl>
                                        <Input
                                            inputMode="decimal"
                                            placeholder="Ej: 15.7"
                                            value={field.value ?? ""}
                                            disabled={busy}
                                            className={numericFieldClass}
                                            onChange={(e) =>
                                                field.onChange(onlyNumeric(e.target.value))
                                            }
                                        />
                                    </FormControl>
                                    <FormDescription className={hintClass}>
                                        Cantidad que ingresa, en la unidad base.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="min_quantity"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel className={labelClass}>Cantidad mínima</FormLabel>
                                    <FormControl>
                                        <Input
                                            inputMode="decimal"
                                            placeholder="Ej: 5"
                                            value={field.value ?? ""}
                                            disabled={busy}
                                            className={numericFieldClass}
                                            onChange={(e) => {
                                                const cleaned = onlyNumeric(e.target.value);
                                                field.onChange(
                                                    cleaned === "" ? undefined : parseFloat(cleaned),
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription className={hintClass}>
                                        Al bajar de este nivel se alerta el stock.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </FormSection>

                {/* items-start: sin él las dos celdas comparten altura y, al
                    desplegarse dimensiones, equivalencias queda estirada. */}
                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                    <FormSection
                        icon={Scale}
                        title="Equivalencias de unidad"
                        hint="Opcional. Cuántas unidades base hay en otra presentación."
                    >
                        <ConsumableConversionsField
                            units={units ?? []}
                            baseUnitId={baseUnit?.id ? Number(baseUnit.id) : undefined}
                            value={conversions}
                            onChange={setConversions}
                            disabled={busy}
                        />
                    </FormSection>

                    <FormSection
                        icon={Ruler}
                        title="Medición por dimensiones"
                        hint="Opcional. Para material que se corta a la medida."
                    >
                        <DimensionFields
                            value={dimension}
                            onChange={setDimension}
                            quantity={quantity}
                            existingProfile={initialData?.consumable?.dimension}
                            disabled={busy}
                        />
                    </FormSection>
                </div>

                <FormSection
                    icon={CalendarDays}
                    title="Fechas del consumible"
                    hint="Fabricación y caducidad, si aplican."
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <DatePickerField
                            label="Fecha de fabricación"
                            value={fabricationDate}
                            setValue={setFabricationDate}
                            description="Fecha de fabricación del consumible."
                            busy={busy}
                            shortcuts="back"
                            maxYear={new Date().getFullYear()}
                            showNotApplicable
                            notApplicableInLabel
                        />

                        <DatePickerField
                            label="Fecha de caducidad"
                            value={expirationDate}
                            setValue={setExpirationDate}
                            description="Fecha límite de uso del consumible."
                            busy={busy}
                            shortcuts="forward"
                            showNotApplicable
                            notApplicableInLabel
                        />

                        <DatePickerField
                            label="Shelf Life"
                            value={shelfLifeDate}
                            setValue={setShelfLifeDate}
                            description="Hasta cuándo puede permanecer almacenado."
                            busy={busy}
                            shortcuts="forward"
                            showNotApplicable
                            notApplicableInLabel
                        />
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
                    descriptionLabel="Detalles / Observaciones"
                    descriptionPlaceholder="Ej: Fluido hidráulico MIL-PRF-83282..."
                    descriptionHint="Observaciones sobre el artículo."
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
                title="Vista previa del consumible"
                groups={previewGroups}
                busy={busy}
            />
        </Form>
    );
}
