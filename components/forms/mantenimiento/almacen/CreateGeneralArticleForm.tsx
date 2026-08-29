"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2, Image as ImageIcon, Package, Ruler, Scale, Tag, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useCompanyStore } from "@/stores/CompanyStore";
import { useAddQuantityGeneralArticle, useCreateGeneralArticle, useUpdateGeneralArticle } from "@/actions/mantenimiento/almacen/inventario/articulos_generales/actions";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { useGetGeneralArticles } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles";
import { GeneralArticle } from "@/types";
import {
    ConsumableConversionsField,
    type ConsumableConversionInput,
} from "@/components/forms/mantenimiento/almacen/ConsumableConversionsField";
import { useGetConversionByGeneralArticle } from "@/hooks/mantenimiento/almacen/articulos/useGetConvertionsByGeneralArticleId";
import {
    DimensionFields,
    EMPTY_DIMENSION,
    dimensionPayload,
    type DimensionDraft,
} from "./_components/DimensionFields";
import { NumericInput } from "./_components/NumericInput";

// Mismo lenguaje visual que el LoginForm: cristal suave con borde slate y
// realce azul al pasar el cursor.
const fieldClass = cn(
    "h-10 rounded-lg text-sm",
    "bg-gradient-to-br from-background/70 to-background/40",
    "backdrop-blur-md",
    "border border-slate-400/60 dark:border-slate-600/60",
    "shadow-sm",
    "hover:border-blue-400/30",
    "hover:shadow-md hover:shadow-blue-500/10",
    "transition-all duration-200",
    // Un campo bloqueado tiene que verse bloqueado antes de que el usuario
    // intente usarlo. La regla de `readOnly` se acota a input/textarea: en CSS
    // `:read-only` acierta en todo lo que no sea editable, y un `<button>` —lo
    // que hay detrás de cada combobox— nunca lo es, así que los selectores
    // utilizables salían apagados y con cursor de bloqueo.
    "disabled:cursor-not-allowed disabled:opacity-60",
    "disabled:hover:border-slate-400/60 disabled:hover:shadow-sm dark:disabled:hover:border-slate-600/60",
    "[&:is(input,textarea):read-only]:cursor-not-allowed",
    "[&:is(input,textarea):read-only]:opacity-60",
    "[&:is(input,textarea):read-only]:bg-muted/40",
    "[&:is(input,textarea):read-only]:hover:border-slate-400/60",
    "[&:is(input,textarea):read-only]:hover:shadow-sm",
);

const numericFieldClass = cn(fieldClass, "tabular-nums");

const selectTriggerClass = cn(fieldClass, "hover:shadow-none");

const labelClass = "text-[13px] font-medium text-foreground/80";

/**
 * Deja solo dígitos y un punto decimal.
 *
 * Se usa con inputs de texto y no con `type="number"`: ese incrementa el valor
 * con la rueda del ratón cuando tiene el foco, y el usuario cambia cantidades
 * sin darse cuenta al desplazar el formulario.
 */
const onlyNumeric = (raw: string) => {
    const cleaned = raw.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");

    return parts.length <= 1 ? cleaned : `${parts[0]}.${parts.slice(1).join("")}`;
};

/** Tarjeta de sección: el mismo cristal de los campos, un escalón más tenue. */
const sectionClass = cn(
    "rounded-xl p-4",
    "bg-gradient-to-br from-background/70 to-background/40",
    "backdrop-blur-md",
    "border border-slate-400/50 dark:border-slate-600/50",
    "shadow-sm",
);

const SectionTitle = ({
    icon: Icon,
    title,
    hint,
}: {
    icon: typeof Package;
    title: string;
    hint?: string;
}) => (
    <div className="mb-4 flex items-start gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 space-y-0.5">
            <h3 className="text-sm font-semibold leading-none">{title}</h3>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    </div>
);

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB, el mismo tope que valida el backend.
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Nivel de stock opcional.
 *
 * El vacío se normaliza a `undefined` antes de validar: `z.coerce` lo
 * convertiría en 0, y "sin nivel" no es lo mismo que "nivel cero" — un mínimo
 * en 0 nunca alerta, así que borrarlo y dejarlo en cero no significan igual.
 */
const optionalStockLevel = z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().min(0, "Mínimo 0").optional(),
);

const formSchema = z.discriminatedUnion("mode", [
    z.object({
        mode: z.literal("create"),
        description: z.string().min(2, "Debe ingresar una descripción."),
        brand_model: z.string().optional(),
        variant_type: z.string().optional(),
        primary_unit_id: z.string().min(1, "Seleccione unidad"),
        warehouse_id: z.string().min(1),
        quantity: z.coerce.number().min(0, "Mínimo 0"),
        minimum_quantity: optionalStockLevel,
        maximum_quantity: optionalStockLevel,
    }),
    z.object({
        mode: z.literal("edit"),
        description: z.string().min(2, "Debe ingresar una descripción."),
        brand_model: z.string().optional(),
        variant_type: z.string().optional(),
        primary_unit_id: z.string().min(1, "Seleccione unidad"),
        warehouse_id: z.string().optional(),
        quantity: z.coerce.number().optional(),
        minimum_quantity: optionalStockLevel,
        maximum_quantity: optionalStockLevel,
    }),
    z.object({
        mode: z.literal("add"),
        quantity: z.coerce.number().gt(0, "Debe ser mayor a 0"),
        description: z.string().optional(),
        brand_model: z.string().optional(),
        variant_type: z.string().optional(),
        primary_unit_id: z.string().optional(),
        warehouse_id: z.string().optional(),
    }),
])
    // Un máximo por debajo del mínimo haría que la requisición pida ≤ 0.
    .refine(
        (values) =>
            values.mode === "add" ||
            values.maximum_quantity === undefined ||
            values.minimum_quantity === undefined ||
            values.maximum_quantity >= values.minimum_quantity,
        {
            message: "La cantidad máxima no puede ser menor que la mínima.",
            path: ["maximum_quantity"],
        },
    );

type FormValues = z.infer<typeof formSchema>;

const CreateGeneralArticleForm = ({
    initialData,
    isEditing,
    onlyDescription,
    onClose,
    inDialog,
}: {
    initialData?: Partial<GeneralArticle>;
    isEditing?: boolean;
    onlyDescription?: boolean;
    onClose?: () => void;
    /**
     * El formulario vive en un diálogo de altura acotada: el cuerpo scrollea y
     * las acciones quedan fijas al pie. Suelto en una página no aplica, porque
     * sin altura que repartir el cuerpo colapsaría.
     */
    inDialog?: boolean;
}) => {
    const router = useRouter();
    const [useExisting, setUseExisting] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<GeneralArticle | null>(null);
    const [query, setQuery] = useState("");
    // La imagen vive fuera de react-hook-form: el form usa 'values', que se
    // reevalúa en cada render y descartaría el File recién seleccionado.
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [isDraggingImage, setIsDraggingImage] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const { selectedCompany } = useCompanyStore();
    const { data: generalArticles } = useGetGeneralArticles();
    const { data: units, isLoading: isUnitsLoading } = useGetUnits(selectedCompany?.slug);

    const { createGeneralArticle } = useCreateGeneralArticle();
    const { updateGeneralArticle } = useUpdateGeneralArticle();
    const { addQuantityGeneralArticle } = useAddQuantityGeneralArticle();

    // 1. FORMULARIO CON VALORES POR DEFECTO DINÁMICOS
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        values: { // Usar 'values' en lugar de 'defaultValues' para que reaccione a props
            mode: isEditing ? "edit" : (useExisting ? "add" : "create"),
            description: isEditing ? (initialData?.description ?? "") : (selectedArticle?.description ?? ""),
            brand_model: isEditing ? (initialData?.brand_model ?? "") : (selectedArticle?.brand_model ?? ""),
            variant_type: isEditing ? (initialData?.variant_type ?? "") : (selectedArticle?.variant_type ?? ""),
            primary_unit_id: isEditing
                ? (initialData?.general_primary_unit?.id?.toString() ?? "")
                : (selectedArticle?.general_primary_unit?.id?.toString() ?? ""),
            quantity: isEditing ? (initialData?.quantity ?? 0) : 0,
            // `undefined` y no 0: son opcionales, y un mínimo en 0 nunca alerta.
            // Con `?? 0` el campo nacía en "0" y no había forma de dejarlo vacío
            // — al borrarlo volvía a aparecer el valor anterior.
            minimum_quantity: isEditing ? (initialData?.minimum_quantity ?? undefined) : undefined,
            maximum_quantity: isEditing ? (initialData?.maximum_quantity ?? undefined) : undefined,
            warehouse_id: initialData?.warehouse?.id?.toString() ?? "2",
        },
    });

    const currentMode = form.watch("mode");
    const watchedUnitId = form.watch("primary_unit_id");

    // Equivalencias del artículo. Viven fuera de RHF porque son una lista y no
    // un campo: se envían junto al resto del payload al guardar.
    const [conversions, setConversions] = useState<ConsumableConversionInput[]>([]);

    // Igual que las conversiones: no es un campo del formulario sino una
    // decisión que acompaña al payload.
    const [dimension, setDimension] = useState<DimensionDraft>(EMPTY_DIMENSION);

    const { data: existingConversions } = useGetConversionByGeneralArticle(
        isEditing ? (initialData?.id ?? null) : null,
        selectedCompany?.slug,
    );

    useEffect(() => {
        if (!existingConversions) return;

        setConversions(
            existingConversions.map((row) => ({
                unit_id: Number(row.unit.id),
                direction: "base_per_unit" as const,
                value: row.base_per_unit,
            })),
        );
    }, [existingConversions]);

    const busy = createGeneralArticle?.isPending || addQuantityGeneralArticle?.isPending || updateGeneralArticle?.isPending;

    // Preview del archivo nuevo. El URL se crea y se revoca dentro del mismo
    // efecto: con useMemo, el doble montaje de StrictMode revocaba el blob de
    // la primera pasada y la miniatura quedaba rota.
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (!imageFile) {
            setImagePreview(null);
            return;
        }

        const url = URL.createObjectURL(imageFile);
        setImagePreview(url);

        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    // El archivo recién elegido tiene prioridad sobre la imagen ya guardada.
    const currentImage = imagePreview ?? initialData?.image ?? null;

    const handleImageChange = (file?: File) => {
        if (!file) {
            setImageFile(null);
            setImageError(null);
            if (imageInputRef.current) imageInputRef.current.value = "";
            return;
        }

        // Se limpia el input al rechazar: si no, reelegir el mismo archivo
        // corregido no dispararía onChange.
        const reject = (message: string) => {
            setImageFile(null);
            setImageError(message);
            if (imageInputRef.current) imageInputRef.current.value = "";
        };

        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            reject("Formato no válido. Use JPG, PNG o WEBP.");
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            reject("La imagen no debe superar los 5MB.");
            return;
        }

        setImageError(null);
        setImageFile(file);
    };

    const filteredArticles = useMemo(() => {
        if (!generalArticles) return [];
        return generalArticles.filter((a) =>
            a.description.toLowerCase().includes(query.toLowerCase())
        );
    }, [generalArticles, query]);

    const onSubmit = async (values: FormValues) => {
        if (!selectedCompany?.slug) return;
        try {
            if (values.mode === "add") {
                if (!selectedArticle) return;
                await addQuantityGeneralArticle.mutateAsync({
                    id: selectedArticle.id,
                    quantity: parseFloat(values.quantity.toFixed(2)),
                });
            } else if (values.mode === "edit") {
                await updateGeneralArticle.mutateAsync({
                    id: initialData?.id!,
                    image: imageFile,
                    articleData: {
                        description: values.description?.trim() || "",
                        brand_model: values.brand_model?.trim() || "N/A",
                        variant_type: values.variant_type?.trim() || "N/A",
                        primary_unit_id: values.primary_unit_id || "",
                        minimum_quantity: values.minimum_quantity !== undefined ? parseFloat(values.minimum_quantity.toFixed(2)) : undefined,
                        maximum_quantity: values.maximum_quantity !== undefined ? parseFloat(values.maximum_quantity.toFixed(2)) : undefined,
                    },
                    conversions,
                    // Con perfil ya creado solo viajan las escalas de medida:
                    // las medidas de la pieza no se pueden cambiar.
                    dimension:
                        dimensionPayload(dimension, !!initialData?.dimension) ??
                        undefined,
                });
            } else {
                await createGeneralArticle.mutateAsync({
                    company: selectedCompany.slug,
                    data: {
                        description: values.description?.trim() || "",
                        brand_model: values.brand_model?.trim() || "N/A",
                        variant_type: values.variant_type?.trim() || "N/A",
                        primary_unit_id: values.primary_unit_id!,
                        warehouse_id: values.warehouse_id!,
                        quantity: parseFloat(values.quantity!.toFixed(2)),
                        minimum_quantity: values.minimum_quantity !== undefined ? parseFloat(values.minimum_quantity.toFixed(2)) : undefined,
                        maximum_quantity: values.maximum_quantity !== undefined ? parseFloat(values.maximum_quantity.toFixed(2)) : undefined,
                        image: imageFile,
                        conversions,
                        dimension: dimensionPayload(dimension) ?? undefined,
                    },
                });
            }
            if (onClose) onClose();
            else {
                form.reset();
                setImageFile(null);
                setImageError(null);
                // El input nativo conserva el archivo aunque se limpie el estado.
                if (imageInputRef.current) imageInputRef.current.value = "";
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <Form {...form}>
            {/* LA CLAVE: El key hace que el formulario se RESETEE por completo al cambiar de artículo */}
            <form
                key={isEditing ? `edit-${initialData?.id}` : (selectedArticle ? `add-${selectedArticle.id}` : 'create')}
                className={cn(
                    "flex min-h-0 flex-col",
                    // En diálogo: tres franjas con el cuerpo desplazable, para
                    // que el pie no se vaya con el contenido ni deje pasar los
                    // campos por detrás. Suelto en una página, el formulario
                    // fluye con el scroll del documento.
                    inDialog && "flex-1",
                )}
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <div
                    className={cn(
                        "shrink-0 space-y-1",
                        inDialog && "border-b px-6 py-4",
                    )}
                >
                    <h2 className="text-xl font-semibold tracking-tight">
                        {isEditing ? "Editar Artículo General" : "Registrar Artículo General"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {isEditing
                            ? "Actualice los datos del artículo. La cantidad se ajusta desde las entradas y salidas."
                            : "Registre un artículo de ferretería o consumo general para el inventario."}
                    </p>
                </div>

                <div
                    className={cn(
                        "flex min-h-0 flex-col gap-5",
                        inDialog ? "flex-1 overflow-y-auto px-6 py-5" : "py-4",
                    )}
                >

                {!isEditing && (
                    <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useExisting}
                                onChange={(e) => {
                                    setUseExisting(e.target.checked);
                                    if (!e.target.checked) setSelectedArticle(null);
                                }}
                                className="mt-0.5 h-4 w-4 accent-primary"
                            />
                            <span className="space-y-0.5">
                                <span className="block text-sm font-medium">
                                    Sumar stock a un artículo existente
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                    En vez de crear uno nuevo, incrementa la cantidad de uno ya registrado.
                                </span>
                            </span>
                        </label>

                        {useExisting && (
                            <Select
                                onValueChange={(val) => {
                                    const art = generalArticles?.find(a => a.id.toString() === val);
                                    if (art) setSelectedArticle(art);
                                }}
                            >
                                <SelectTrigger className={cn(selectTriggerClass, "w-full")}>
                                    <SelectValue placeholder="Seleccione artículo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-2">
                                        <Input
                                            placeholder="Buscar..."
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                        {filteredArticles.map((a) => (
                                            <SelectItem key={a.id} value={a.id.toString()}>
                                                {a.description}
                                            </SelectItem>
                                        ))}
                                    </div>
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                )}

                {/* 3/5 y 2/5: con dos tercios, identificación sobraba ancho y
                    existencia apretaba sus dos columnas de campos. Sin
                    items-start: las dos tarjetas se alinean a la misma altura. */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <section className={cn(sectionClass, "lg:col-span-3")}>
                    <SectionTitle
                        icon={Tag}
                        title="Identificación"
                        hint="Cómo se reconoce el artículo en el inventario."
                    />
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            disabled={currentMode === "add"}
                                            placeholder="Ej: Lámina de aluminio, Tornillo hexagonal 1/4..."
                                            rows={2}
                                            className={cn(fieldClass, "h-auto resize-none py-2")}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="brand_model"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>Marca / Modelo</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ej: ROYAL" className={fieldClass} disabled={currentMode === "add"} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="variant_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>Presentación</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ej: Caja de 50, 3/4 pulgada" className={fieldClass} disabled={currentMode === "add"} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                    {currentMode !== "add" && (
                        <FormItem className="sm:col-span-2">
                            <FormLabel className={labelClass}>Imagen</FormLabel>
                            {/* Input nativo oculto: en una celda estrecha el control
                                por defecto desborda con el nombre del archivo. */}
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/jpeg, image/png, image/webp"
                                onChange={(e) => handleImageChange(e.target.files?.[0])}
                                className="hidden"
                            />
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => imageInputRef.current?.click()}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        imageInputRef.current?.click();
                                    }
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDraggingImage(true);
                                }}
                                onDragLeave={() => setIsDraggingImage(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDraggingImage(false);
                                    handleImageChange(e.dataTransfer.files?.[0]);
                                }}
                                className={cn(
                                    fieldClass,
                                    "flex w-full cursor-pointer items-center gap-2 px-3",
                                    "focus-visible:outline-none focus-visible:border-blue-400/60",
                                    isDraggingImage && "border-primary bg-primary/5",
                                    imageError && "border-destructive",
                                )}
                            >
                                {currentImage ? (
                                    // Miniatura de 24px que suele ser un blob: local
                                    // del archivo recién elegido; next/image no puede
                                    // optimizar blobs, así que aquí <img> es lo correcto.
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={currentImage}
                                        alt="Imagen del artículo"
                                        className="h-6 w-6 shrink-0 rounded-sm object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                )}
                                <span
                                    className={cn(
                                        "truncate",
                                        imageFile ? "text-foreground" : "text-muted-foreground",
                                    )}
                                >
                                    {imageFile
                                        ? imageFile.name
                                        : currentImage
                                            ? "Cambiar imagen"
                                            : "Subir imagen"}
                                </span>

                                {/* Quitar solo aplica al archivo nuevo: la imagen ya
                                    guardada se reemplaza, no se borra desde aquí. */}
                                {imageFile && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleImageChange(undefined);
                                        }}
                                        className="ml-auto shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                        aria-label="Quitar imagen"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                            <FormDescription className="text-xs">
                                Opcional. Máx. 5MB.
                            </FormDescription>
                            {/* Mismo estilo que FormMessage, que aquí no aplica:
                                el archivo no es un campo de react-hook-form. */}
                            {imageError && (
                                <p className="text-sm font-medium text-destructive">{imageError}</p>
                            )}
                        </FormItem>
                    )}
                    </div>
                </section>

                <section className={cn(sectionClass, "lg:col-span-2")}>
                    <SectionTitle
                        icon={Package}
                        title="Existencia"
                        hint="Cuánto hay y en qué se cuenta."
                    />
                {/* 2fr para la unidad y 1fr para la cantidad: el select muestra
                    nombres largos (CUARTOS DE GALON) y el número no. */}
                <div className="grid grid-cols-[1fr_1.6fr] gap-3 items-start">
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className={labelClass}>{currentMode === "add" ? "Sumar cantidad" : "Cantidad"}</FormLabel>
                                <FormControl>
                                    <NumericInput
                                        {...field}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        className={numericFieldClass}
                                        disabled={isEditing && onlyDescription}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="primary_unit_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className={labelClass}>Unidad base</FormLabel>
                                {currentMode === "add" ? (
                                    /* Al sumar stock la unidad no se elige: es la
                                       del artículo. Se muestra como texto porque
                                       un Select sólo sabe pintar la etiqueta si
                                       encuentra su opción cargada, y aquí quedaba
                                       en "Seleccione" sobre un artículo que sí
                                       tiene unidad. */
                                    <div
                                        className={cn(
                                            selectTriggerClass,
                                            "flex items-center px-3 text-muted-foreground",
                                        )}
                                    >
                                        {selectedArticle?.general_primary_unit?.label ?? "—"}
                                    </div>
                                ) : (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value || undefined}
                                    >
                                        <FormControl>
                                            <SelectTrigger className={selectTriggerClass}>
                                                <SelectValue placeholder={isUnitsLoading ? "Cargando..." : "Seleccione"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {units?.map((u) => (
                                                <SelectItem key={u.id} value={u.id.toString()}>
                                                    {u.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                {/* La confusión que costó rehacer un artículo: la base
                                    cuenta unidades, no las mide. */}
                                <FormDescription className="text-xs">
                                    {currentMode === "add"
                                        ? "Unidad en la que se cuenta este artículo."
                                        : "En qué se cuenta: UNIDADES, LÁMINA, CAJA…"}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>

                {currentMode !== "add" && (
                    <div className="mt-4 grid grid-cols-2 gap-3 items-start border-t border-slate-400/30 pt-4 dark:border-slate-600/30">
                        <FormField
                            control={form.control}
                            name="minimum_quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>Cantidad mínima</FormLabel>
                                    <FormControl>
                                        <NumericInput
                                            {...field}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            className={numericFieldClass}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Opcional. Al bajar de este nivel se alerta el stock.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="maximum_quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>Cantidad máxima</FormLabel>
                                    <FormControl>
                                        <NumericInput
                                            {...field}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            className={numericFieldClass}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Opcional. Nivel de stock a reponer, no un tope de existencia.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
                </section>
                </div>

                {/* Los dos ejes de medición, uno al lado del otro: cuántas hay
                    (equivalencias) y cuánto mide cada una (dimensiones). */}
                {/* items-start: sin él las celdas de una fila comparten altura,
                    y al desplegarse dimensiones dejaba a conversiones estirada
                    con un hueco vacío del mismo alto. */}
                {currentMode !== "add" && (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 items-start">
                        <section className={sectionClass}>
                            <SectionTitle
                                icon={Scale}
                                title="Equivalencias de unidad"
                                hint="Opcional. Cuántas unidades base hay en otra presentación: 1 CAJA = 50 UNIDADES."
                            />
                            <ConsumableConversionsField
                                units={units ?? []}
                                baseUnitId={watchedUnitId ? Number(watchedUnitId) : undefined}
                                value={conversions}
                                onChange={setConversions}
                                disabled={busy}
                            />
                        </section>

                        <section className={sectionClass}>
                            <SectionTitle
                                icon={Ruler}
                                title="Medición por dimensiones"
                                hint="Opcional. Para material que se corta a la medida y se despacha en trazos."
                            />
                            <DimensionFields
                                value={dimension}
                                onChange={setDimension}
                                quantity={form.watch("quantity")}
                                existingProfile={initialData?.dimension}
                                disabled={busy}
                            />
                        </section>
                    </div>
                )}

                </div>

                {/* Fuera del contenedor con scroll: opaco y siempre visible. */}
                <div
                    className={cn(
                        "shrink-0 flex justify-end gap-3 border-t bg-background",
                        inDialog ? "px-6 py-4" : "pt-4",
                    )}
                >
                    <Button type="button" variant="ghost" onClick={() => (onClose ? onClose() : router.back())} disabled={busy}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={busy || (currentMode === "add" && !selectedArticle)} className="min-w-[140px]">
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> :
                            (isEditing ? "Guardar cambios" : useExisting ? "Sumar stock" : "Crear artículo")}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default CreateGeneralArticleForm;
