"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2, Image as ImageIcon, X } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB, el mismo tope que valida el backend.
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.discriminatedUnion("mode", [
    z.object({
        mode: z.literal("create"),
        description: z.string().min(2, "Debe ingresar una descripción."),
        brand_model: z.string().optional(),
        variant_type: z.string().optional(),
        primary_unit_id: z.string().min(1, "Seleccione unidad"),
        warehouse_id: z.string().min(1),
        quantity: z.coerce.number().min(0, "Mínimo 0"),
        minimum_quantity: z.coerce.number().min(0, "Mínimo 0").optional(),
        maximum_quantity: z.coerce.number().min(0, "Mínimo 0").optional(),
    }),
    z.object({
        mode: z.literal("edit"),
        description: z.string().min(2, "Debe ingresar una descripción."),
        brand_model: z.string().optional(),
        variant_type: z.string().optional(),
        primary_unit_id: z.string().min(1, "Seleccione unidad"),
        warehouse_id: z.string().optional(),
        quantity: z.coerce.number().optional(),
        minimum_quantity: z.coerce.number().min(0, "Mínimo 0").optional(),
        maximum_quantity: z.coerce.number().min(0, "Mínimo 0").optional(),
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
    onClose
}: {
    initialData?: Partial<GeneralArticle>;
    isEditing?: boolean;
    onlyDescription?: boolean;
    onClose?: () => void;
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
            minimum_quantity: isEditing ? (initialData?.minimum_quantity ?? 0) : 0,
            maximum_quantity: isEditing ? (initialData?.maximum_quantity ?? 0) : 0,
            warehouse_id: initialData?.warehouse?.id?.toString() ?? "2",
        },
    });

    const currentMode = form.watch("mode");
    const watchedUnitId = form.watch("primary_unit_id");

    // Equivalencias del artículo. Viven fuera de RHF porque son una lista y no
    // un campo: se envían junto al resto del payload al guardar.
    const [conversions, setConversions] = useState<ConsumableConversionInput[]>([]);

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
                className="flex flex-col gap-4"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold">
                        {isEditing ? "Editar Artículo General" : "Registrar Artículo General"}
                    </h2>
                </div>

                {!isEditing && (
                    <div className="p-3 border rounded-lg bg-muted/40 space-y-3">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={useExisting}
                                onChange={(e) => {
                                    setUseExisting(e.target.checked);
                                    if (!e.target.checked) setSelectedArticle(null);
                                }}
                                className="h-4 w-4 accent-primary"
                            />
                            <span className="text-sm font-medium">¿Sumar stock a un artículo existente?</span>
                        </div>

                        {useExisting && (
                            <Select
                                onValueChange={(val) => {
                                    const art = generalArticles?.find(a => a.id.toString() === val);
                                    if (art) setSelectedArticle(art);
                                }}
                            >
                                <SelectTrigger className="w-full">
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

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Textarea {...field} disabled={currentMode === "add"} placeholder="Escriba aquí..." rows={2} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="brand_model"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Marca / Modelo</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={currentMode === "add"} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="variant_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Presentación</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={currentMode === "add"} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Cantidad y unidad describen el stock; los niveles de alerta y la
                    imagen van aparte para que las ayudas no desalineen la fila. */}
                <div className={currentMode === "add" ? "grid grid-cols-2 gap-4" : "grid grid-cols-2 md:grid-cols-3 gap-4 items-start"}>
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{currentMode === "add" ? "Sumar Cantidad" : "Cantidad"}</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} disabled={isEditing && onlyDescription} />
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
                                <FormLabel>Unidad</FormLabel>
                                <Select
                                    disabled={currentMode === "add"}
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {currentMode !== "add" && (
                        <FormItem>
                            <FormLabel>Imagen</FormLabel>
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
                                    // Mismas clases base que el componente Input para
                                    // que la celda no se sienta ajena al formulario.
                                    "flex h-10 w-full cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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

                {currentMode !== "add" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                        <FormField
                            control={form.control}
                            name="minimum_quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cantidad Mínima</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Al bajar de este nivel se alerta el stock.
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
                                    <FormLabel>Cantidad Máxima</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Nivel de stock a reponer, no un tope de existencia.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* En la misma retícula que los niveles de stock: es un
                            campo más del artículo, no un bloque aparte. */}
                        <FormItem className="sm:col-span-2">
                            <FormLabel>Conversiones de unidades</FormLabel>
                            <ConsumableConversionsField
                                units={units ?? []}
                                baseUnitId={watchedUnitId ? Number(watchedUnitId) : undefined}
                                value={conversions}
                                onChange={setConversions}
                                disabled={busy}
                            />
                            <FormDescription className="text-xs">
                                Opcional. Permite recibir y despachar en otras unidades.
                            </FormDescription>
                        </FormItem>
                    </div>
                )}

                <Separator className="my-2" />

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => (onClose ? onClose() : router.back())} disabled={busy}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={busy || (currentMode === "add" && !selectedArticle)} className="min-w-[120px]">
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> :
                            (isEditing ? "Guardar Cambios" : useExisting ? "Sumar Stock" : "Crear Artículo")}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default CreateGeneralArticleForm;
