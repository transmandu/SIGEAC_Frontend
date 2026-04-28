"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
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
import { useCreateGeneralArticle, useUpdateGeneralArticle } from "@/actions/mantenimiento/almacen/inventario/articulos_generales/actions";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { useAddQuantityGeneralArticle } from "@/hooks/mantenimiento/almacen/almacen_general/useAddQuantityGeneralArticle";
import { useGetGeneralArticles } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles";
import { GeneralArticle } from "@/types";

const formSchema = z.discriminatedUnion("mode", [
    z.object({
        mode: z.literal("create"),
        description: z.string().min(2, "Debe ingresar una descripción."),
        brand_model: z.string().optional(),
        variant_type: z.string().optional(),
        primary_unit_id: z.string().min(1, "Seleccione unidad"),
        warehouse_id: z.string().min(1),
        quantity: z.coerce.number().min(0, "Mínimo 0"),
    }),
    z.object({
        mode: z.literal("edit"),
        description: z.string().min(2, "Debe ingresar una descripción."),
        brand_model: z.string().optional(),
        variant_type: z.string().optional(),
        primary_unit_id: z.string().min(1, "Seleccione unidad"),
        warehouse_id: z.string().optional(),
        quantity: z.coerce.number().optional(),
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
]);

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
            warehouse_id: initialData?.warehouse?.id?.toString() ?? "2",
        },
    });

    const currentMode = form.watch("mode");

    const busy = createGeneralArticle?.isPending || addQuantityGeneralArticle?.isPending || updateGeneralArticle?.isPending;

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
                    articleData: {
                        description: values.description?.trim() || "",
                        brand_model: values.brand_model?.trim() || "N/A",
                        variant_type: values.variant_type?.trim() || "N/A",
                        primary_unit_id: values.primary_unit_id || "",
                    },
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
                    },
                });
            }
            if (onClose) onClose();
            else form.reset();
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

                <div className="grid grid-cols-2 gap-4">
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
                </div>

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
