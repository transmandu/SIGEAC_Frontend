"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { CalendarDays, Timer } from "lucide-react";

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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { useGetConditions } from "@/hooks/administracion/useGetConditions";
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useAuth } from "@/contexts/AuthContext";
import { getConditionLabel } from "@/lib/conditions";

import {
    ArticleDetailsSection,
    savedImageUrl,
} from "@/components/forms/mantenimiento/almacen/_components/ArticleDetailsSection";
import {
    FormSection,
    fieldClass,
    hintClass,
    labelClass,
    selectTriggerClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { NumericTextInput } from "@/components/forms/mantenimiento/almacen/_components/NumericInput";

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
import { LifeLimitRow } from "./sections/LifeLimitRow";
import { MultiSerialInput } from "./sections/MultiSerialInput";
import { WarehouseDetailsSection } from "./sections/WarehouseDetailsSection";
import type { ArticleFormProps } from "./types";
import { useArticleForm, useReportFormState } from "./useArticleForm";

const numeric = z.coerce
    .number({ invalid_type_error: "Debe ingresar una cantidad numérica" })
    .min(0, "No puede ser negativo.")
    .optional()
    .or(z.literal("").transform(() => undefined));

const formSchema = z.object({
    part_number: z
        .string({ message: "Debe ingresar un número de parte." })
        .min(2, "El número de parte debe contener al menos 2 caracteres."),
    alternative_part_number: z.array(z.string().min(2)).optional(),
    serial: z.array(z.string().min(1)).optional(),
    description: z.string().optional(),
    zone: z.string().optional(),
    manufacturer_id: z.string().optional(),
    condition_id: z.string().optional(),
    batch_id: z.string().min(1, "Seleccione una descripción"),
    aircraft_id: z.string().optional(),
    ata_code: z.string().optional(),

    life_limit_part_hours: numeric,
    life_limit_part_cycles: numeric,
    hard_time_hours: numeric,
    hard_time_cycles: numeric,
    shelf_life: numeric,
    shelf_life_unit: z.string().optional(),

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

const apiDate = (date?: Date | null) =>
    date instanceof Date && !Number.isNaN(date.getTime())
        ? format(date, "yyyy-MM-dd")
        : undefined;

/**
 * Registro de partes y componentes, para cualquier destino.
 *
 * Ambas categorías comparten exactamente los mismos campos y el backend las
 * trata por la misma rama (`deletedPartComponent`); solo cambia la categoría
 * del lote. Reemplaza a las seis variantes que existían entre las dos.
 */
export default function PartComponentArticleForm({
    category,
    initialData,
    isEditing,
    onEditSuccess,
    submitLabel,
    onStateChange,
    showPreview,
}: ArticleFormProps & { category: "COMPONENT" | "PART" }) {
    const isComponent = category === "COMPONENT";
    const categoryLabel = isComponent ? "Componente" : "Parte";

    const { user } = useAuth();
    const isEngineering = (user?.roles ?? []).some((role) =>
        ["ENGINEERING", "SUPERUSER"].includes(role.name),
    );

    const { selectedCompany } = useCompanyStore();
    const { data: conditions, isLoading: conditionsLoading } = useGetConditions();
    const { data: aircrafts, isLoading: aircraftsLoading } = useGetMaintenanceAircrafts(
        selectedCompany?.slug,
    );

    const [fabricationDate, setFabricationDate] = useState<Date | null | undefined>(
        initialData?.partComponent?.fabrication_date
            ? parseISO(initialData.partComponent.fabrication_date)
            : null,
    );
    const [expirationDate, setExpirationDate] = useState<Date | null | undefined>(
        initialData?.partComponent?.expiration_date
            ? parseISO(initialData.partComponent.expiration_date)
            : null,
    );
    const [lifeLimitCalendar, setLifeLimitCalendar] = useState<Date | null | undefined>(
        initialData?.partComponent?.life_limit_part_calendar
            ? parseISO(initialData.partComponent.life_limit_part_calendar)
            : null,
    );
    const [hardTimeCalendar, setHardTimeCalendar] = useState<Date | null | undefined>(
        initialData?.partComponent?.hard_time_calendar
            ? parseISO(initialData.partComponent.hard_time_calendar)
            : null,
    );
    const [receptionDate, setReceptionDate] = useState<Date | null | undefined>(
        initialData?.reception_date ? parseISO(initialData.reception_date) : null,
    );

    const [preview, setPreview] = useState<FormValues | null>(null);

    const currentBatch = useMemo(
        () => initialData?.batch ?? initialData?.batches,
        [initialData],
    );

    const defaults = useMemo<FormValues>(
        () => ({
            part_number: initialData?.part_number ?? "",
            alternative_part_number: initialData?.alternative_part_number ?? [],
            serial: initialData?.serial
                ? Array.isArray(initialData.serial)
                    ? initialData.serial
                    : [initialData.serial]
                : [],
            description: initialData?.description ?? "",
            zone: initialData?.zone ?? "",
            manufacturer_id: initialData?.manufacturer?.id?.toString() ?? "",
            condition_id: initialData?.condition?.id?.toString() ?? "",
            batch_id: currentBatch?.id?.toString() ?? "",
            aircraft_id: initialData?.partComponent?.aircraft_id?.toString() ?? "",
            ata_code: initialData?.ata_code ?? "",
            life_limit_part_hours: initialData?.partComponent?.life_limit_part_hours
                ? Number(initialData.partComponent.life_limit_part_hours)
                : undefined,
            life_limit_part_cycles: initialData?.partComponent?.life_limit_part_cycles
                ? Number(initialData.partComponent.life_limit_part_cycles)
                : undefined,
            hard_time_hours: initialData?.partComponent?.hard_time_hours
                ? Number(initialData.partComponent.hard_time_hours)
                : undefined,
            hard_time_cycles: initialData?.partComponent?.hard_time_cycles
                ? Number(initialData.partComponent.hard_time_cycles)
                : undefined,
            shelf_life: initialData?.partComponent?.shelf_life
                ? Number(initialData.partComponent.shelf_life)
                : undefined,
            shelf_life_unit: initialData?.partComponent?.shelf_life_unit ?? "",
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

    const initialDatesRef = useMemo(
        () => ({
            fabrication: initialData?.partComponent?.fabrication_date
                ? parseISO(initialData.partComponent.fabrication_date).getTime()
                : null,
            expiration: initialData?.partComponent?.expiration_date
                ? parseISO(initialData.partComponent.expiration_date).getTime()
                : null,
            lifeLimit: initialData?.partComponent?.life_limit_part_calendar
                ? parseISO(initialData.partComponent.life_limit_part_calendar).getTime()
                : null,
            hardTime: initialData?.partComponent?.hard_time_calendar
                ? parseISO(initialData.partComponent.hard_time_calendar).getTime()
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
        (lifeLimitCalendar?.getTime() ?? null) !== initialDatesRef.lifeLimit ||
        (hardTimeCalendar?.getTime() ?? null) !== initialDatesRef.hardTime ||
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
        category,
        articleType: isComponent ? "component" : "part",
        initialData,
        isEditing,
        onEditSuccess,
        onStateChange,
        extraDirty: datesDirty,
    });

    const busy = baseBusy || conditionsLoading;

    // Atado al id y no al objeto: `initialData` llega de una query, así que un
    // refetch devuelve otro objeto con los mismos datos y volvía a resetear el
    // formulario encima de lo que el usuario estaba escribiendo.
    const articleId = initialData?.id;

    useEffect(() => {
        if (!initialData) return;
        form.reset(defaults);
        reloadDocuments(initialData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [articleId]);

    const hasDocumentation = form.watch("has_documentation");
    const conditionId = form.watch("condition_id");

    // Solo estas condiciones traen el artículo desde una aeronave concreta.
    const selectedCondition = conditions?.find((c) => `${c.id}` === conditionId);
    const needsAircraft = ["SAFEKEEPING", "AS REMOVED"].includes(
        selectedCondition?.name?.toUpperCase() ?? "",
    );

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
                // El backend crea un artículo por serial recibido; con uno solo
                // espera el valor plano, no una lista de un elemento.
                serial:
                    values.serial && values.serial.length > 0
                        ? values.serial.length === 1
                            ? values.serial[0]
                            : values.serial
                        : undefined,
                // Sin la condición que lo justifica, la aeronave no viaja.
                aircraft_id: needsAircraft ? values.aircraft_id : undefined,
                fabrication_date: apiDate(fabricationDate),
                expiration_date: apiDate(expirationDate),
                life_limit_part_calendar: apiDate(lifeLimitCalendar),
                hard_time_calendar: apiDate(hardTimeCalendar),
                reception_date: apiDate(receptionDate),
            },
            afterCreate: () => {
                form.reset();
                setFabricationDate(null);
                setExpirationDate(null);
                setLifeLimitCalendar(null);
                setHardTimeCalendar(null);
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
        const aircraftName = aircrafts?.find(
            (a) => `${a.id}` === values.aircraft_id,
        )?.acronym;

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
                    { label: "Seriales", value: previewList(values.serial) },
                    { label: "Condición", value: conditionName },
                    { label: "Fabricante", value: manufacturerName },
                    { label: "Código ATA", value: values.ata_code },
                    { label: "Ubicación interna", value: values.zone },
                    { label: "Nro. de orden de compra", value: values.purchase_order_number },
                    ...(needsAircraft
                        ? [{ label: "Aeronave de origen", value: aircraftName }]
                        : []),
                ],
            },
            {
                title: "Fechas",
                fields: [
                    { label: "Fabricación", value: previewDate(fabricationDate) },
                    { label: "Próximo vencimiento", value: previewDate(expirationDate) },
                ],
            },
            {
                title: "Límites de vida",
                fields: [
                    { label: "Life Limit — horas", value: values.life_limit_part_hours },
                    { label: "Life Limit — ciclos", value: values.life_limit_part_cycles },
                    { label: "Life Limit — calendario", value: previewDate(lifeLimitCalendar) },
                    {
                        label: "Shelf Life",
                        value: values.shelf_life
                            ? `${values.shelf_life} ${values.shelf_life_unit ?? ""}`.trim()
                            : undefined,
                    },
                    ...(isEngineering
                        ? [
                              { label: "Hard Time — horas", value: values.hard_time_hours },
                              { label: "Hard Time — ciclos", value: values.hard_time_cycles },
                              {
                                  label: "Hard Time — calendario",
                                  value: previewDate(hardTimeCalendar),
                              },
                          ]
                        : []),
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
        aircrafts,
        batches,
        conditions,
        documents.length,
        expirationDate,
        fabricationDate,
        hardTimeCalendar,
        isEngineering,
        lifeLimitCalendar,
        manufacturers,
        needsAircraft,
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
                opensPreview={showPreview}
                onCancel={() => router.back()}
                // La vista previa la pide quien monta el formulario: solo el
                // alta y la edición formales del artículo la usan. Al crear se
                // confirma lo que va a nacer; al editar, cómo queda.
                onSubmit={form.handleSubmit((values) =>
                    showPreview ? setPreview(values) : save(values),
                )}
            >
                <IdentificationSection
                    form={form}
                    batches={batches}
                    batchesLoading={batchesLoading}
                    manufacturers={manufacturers}
                    manufacturersLoading={manufacturersLoading}
                    batchLabel={`Descripción de ${categoryLabel.toLowerCase()}`}
                    batchCategory={category}
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
                                    <FormLabel className={labelClass}>
                                        {isEditing ? "Serial" : "Seriales a registrar"}
                                    </FormLabel>
                                    <FormControl>
                                        <MultiSerialInput
                                            values={field.value ?? []}
                                            onChange={field.onChange}
                                            disabled={busy}
                                            single={isEditing}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    }
                >
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
                                    renderLabel={(condition) => (
                                        <span className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {getConditionLabel(condition.name.toUpperCase())}
                                            </span>
                                            <span className="text-[9px] italic text-muted-foreground">
                                                ({condition.name})
                                            </span>
                                        </span>
                                    )}
                                    onSelect={(condition) =>
                                        form.setValue("condition_id", condition.id.toString(), {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        })
                                    }
                                />
                                <FormDescription className={hintClass}>
                                    Estado físico/operativo del artículo.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="ata_code"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel className={labelClass}>Código ATA</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ej: 32-41-00"
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

                    {/* La aeronave solo tiene sentido si el artículo se extrajo
                        de una: aparece con la condición que lo justifica. */}
                    {needsAircraft && (
                        <FormField
                            control={form.control}
                            name="aircraft_id"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel className={labelClass}>Aeronave de origen</FormLabel>
                                    <SearchableSelect
                                        options={aircrafts?.map((aircraft) => ({
                                            ...aircraft,
                                            name: aircraft.acronym,
                                        }))}
                                        value={field.value}
                                        loading={aircraftsLoading}
                                        disabled={busy}
                                        placeholder="Seleccione aeronave..."
                                        searchPlaceholder="Buscar aeronave..."
                                        emptyLabel="No se encontró la aeronave."
                                        onSelect={(aircraft) =>
                                            form.setValue("aircraft_id", aircraft.id.toString(), {
                                                shouldValidate: true,
                                                shouldDirty: true,
                                            })
                                        }
                                    />
                                    <FormDescription className={hintClass}>
                                        Aeronave de la que se extrajo el artículo.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </IdentificationSection>

                <FormSection
                    icon={CalendarDays}
                    title={`Fechas del ${categoryLabel.toLowerCase()}`}
                    hint="Fabricación y próximo vencimiento."
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <DatePickerField
                            label="Fecha de fabricación"
                            value={fabricationDate}
                            setValue={setFabricationDate}
                            description={`Fecha de fabricación del ${categoryLabel.toLowerCase()}.`}
                            busy={busy}
                            shortcuts="back"
                            maxYear={new Date().getFullYear()}
                            showNotApplicable
                            notApplicableInLabel
                        />

                        <DatePickerField
                            label="Próximo vencimiento"
                            value={expirationDate}
                            setValue={setExpirationDate}
                            description={`Fecha de vencimiento del ${categoryLabel.toLowerCase()}.`}
                            busy={busy}
                            shortcuts="forward"
                            showNotApplicable
                            notApplicableInLabel
                        />
                    </div>
                </FormSection>

                <FormSection
                    icon={Timer}
                    title="Límites de vida"
                    hint="Cuánto puede usarse el artículo antes de retirarlo o revisarlo."
                >
                    <div className="space-y-5">
                        <LifeLimitRow
                            control={form.control}
                            title="Life Limit"
                            hint="Vida total del artículo: al alcanzarla se retira definitivamente."
                            hoursName="life_limit_part_hours"
                            cyclesName="life_limit_part_cycles"
                            calendarValue={lifeLimitCalendar}
                            onCalendarChange={setLifeLimitCalendar}
                            disabled={busy}
                        />

                        {isEngineering && (
                            <LifeLimitRow
                                control={form.control}
                                title="Hard Time"
                                hint="Intervalo entre overhauls; al cumplirse, el artículo va a mantenimiento."
                                hoursName="hard_time_hours"
                                cyclesName="hard_time_cycles"
                                calendarValue={hardTimeCalendar}
                                onCalendarChange={setHardTimeCalendar}
                                disabled={busy}
                            />
                        )}

                        <div className="space-y-2">
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-semibold text-foreground/90">
                                    Shelf Life
                                </h4>
                                <p className={hintClass}>
                                    Cuánto puede permanecer almacenado sin usarse.
                                </p>
                            </div>

                            {/* Cantidad y unidad son un solo dato partido en dos
                                campos: van juntos y más estrechos que el resto. */}
                            <div className="grid grid-cols-2 gap-4 sm:max-w-md">
                                <FormField
                                    control={form.control}
                                    name="shelf_life"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel className={labelClass}>Duración</FormLabel>
                                            <FormControl>
                                                <NumericTextInput
                                                    inputMode="numeric"
                                                    placeholder="Ej: 10"
                                                    {...field}
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    disabled={busy}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="shelf_life_unit"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel className={labelClass}>Unidad</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || ""}
                                                disabled={busy}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className={selectTriggerClass}>
                                                        <SelectValue placeholder="Seleccione" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="DAYS">Días</SelectItem>
                                                    <SelectItem value="MONTHS">Meses</SelectItem>
                                                    <SelectItem value="YEARS">Años</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
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
                    descriptionPlaceholder="Ej: Motor V8 de..."
                    descriptionHint="Breve descripción del artículo."
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
                title={isEditing
                    ? `Confirmar cambios del ${categoryLabel.toLowerCase()}`
                    : `Vista previa del ${categoryLabel.toLowerCase()}`}
                description={isEditing
                    ? `Así quedará el ${categoryLabel.toLowerCase()} con los cambios aplicados.`
                    : undefined}
                confirmLabel={isEditing ? "Guardar cambios" : "Registrar"}
                groups={previewGroups}
                busy={busy}
            />
        </Form>
    );
}
