"use client";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
    useCreateDangerIdentification,
    useUpdateDangerIdentification,
} from "@/actions/sms/peligros_identificados/actions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { DangerIdentification } from "@/types";
import { Separator } from "@radix-ui/react-select";
import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const FormSchema = z.object({
    root_cause_analysis: z
        .string()
        .min(3, {
            message: "El analisis causa raiz debe tener al menos 3 caracteres",
        })
        .max(900, {
            message: "El analisis causa raiz no debe exceder los 900 caracteres",
        }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
    id: number | string;
    initialData?: DangerIdentification;
    isEditing?: boolean;
    reportType: string;
    onClose?: () => void;
}

export default function CreateWhyAnalysisForm({
    onClose,
    id,
    isEditing,
    initialData,
    reportType,
}: FormProps) {
    const { selectedCompany } = useCompanyStore();
    const { createDangerIdentification } = useCreateDangerIdentification();
    const { updateDangerIdentification } = useUpdateDangerIdentification();
    const router = useRouter();

    // Inicializamos con un string vacío para que siempre haya al menos un input
    const [analyses, setAnalyses] = useState<string[]>([""]);

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            root_cause_analysis: initialData?.root_cause_analysis || "",
        },
    });

    useEffect(() => {
        if (initialData?.root_cause_analysis) {
            const splitAndFilter = (str: string) =>
                str
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);

            const loadedAnalyses = splitAndFilter(initialData.root_cause_analysis);
            // Si hay data, la cargamos; si no, dejamos al menos un input vacío
            setAnalyses(loadedAnalyses.length > 0 ? loadedAnalyses : [""]);
        }
    }, [initialData]);

    // --- MANEJO DEL ARREGLO DE ANÁLISIS ---
    const handleAnalysisChange = (index: number, value: string) => {
        const updated = [...analyses];
        updated[index] = value;
        setAnalyses(updated);

        // Unimos los análisis con comas
        const concatenatedString = updated.filter(Boolean).join(", ");

        // IMPORTANTE: Agregamos shouldValidate para que Zod revise el cambio
        form.setValue("root_cause_analysis", concatenatedString, {
            shouldValidate: true,
            shouldDirty: true
        });
    };
    console.log("Errores del form:", form.formState.errors);
    const addAnalysisInput = () => {
        setAnalyses([...analyses, ""]);
    };

    const removeAnalysisInput = (index: number) => {
        const updated = analyses.filter((_, i) => i !== index);
        // Si borramos todos, dejamos uno vacío por defecto
        if (updated.length === 0) {
            setAnalyses([""]);
            form.setValue("root_cause_analysis", "");
        } else {
            setAnalyses(updated);
            form.setValue("root_cause_analysis", updated.filter(Boolean).join(","));
        }
    };

    // --- ENVÍO ---
    const onSubmit = async (data: FormSchemaType) => {
        // try {
        //     if (initialData && isEditing) {
        //         // Actualización
        //         await updateDangerIdentification.mutateAsync({
        //             company: selectedCompany!.slug,
        //             id: initialData.id.toString(),
        //             data,
        //         });
        //         onClose?.();
        //     } else {
        //         // Creación
        //         const response = await createDangerIdentification.mutateAsync({
        //             company: selectedCompany!.slug,
        //             id, // id del reporte padre
        //             reportType,
        //             data,
        //         });
        //     }
        // } catch (error) {
        //     console.error(error);
        // }
        onClose?.();
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col space-y-4"
            >
                <FormLabel className="text-lg text-center m-2 font-semibold">
                    Análisis Causa Raíz
                </FormLabel>

                {/* --- ANALISIS CAUSA RAÍZ --- */}
                <FormItem>
                    <FormLabel>Análisis de los 5 ¿POR QUÉ?</FormLabel>
                    <div className="space-y-3 pt-2">
                        {analyses.map((analysis, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {/* Placeholder inamovible y enumerado */}
                                <span className="text-sm font-semibold whitespace-nowrap w-24 text-muted-foreground flex-shrink-0">
                                    {index + 1}. ¿Por qué?
                                </span>
                                <Input
                                    value={analysis}
                                    onChange={(e) => handleAnalysisChange(index, e.target.value)}
                                    placeholder="Escriba la causa..."
                                    className="flex-1"
                                />
                                {/* Botón para eliminar la fila actual (opcional, oculto si solo hay 1) */}
                                {analyses.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 flex-shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => removeAnalysisInput(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addAnalysisInput}
                            className="mt-2"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Añadir otro ¿Por qué?
                        </Button>
                    </div>
                </FormItem>

                {/* Campo oculto para que react-hook-form mantenga el string y lo valide */}
                <FormField
                    control={form.control}
                    name="root_cause_analysis"
                    render={({ field }) => (
                        <FormItem className="hidden">
                            <FormControl>
                                <Input type="hidden" {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* --- FOOTER --- */}
                <div className="flex justify-between items-center gap-x-4 pt-4">
                    <Separator className="flex-1" />
                    <p className="text-muted-foreground text-sm">SIGEAC</p>
                    <Separator className="flex-1" />
                </div>
                {/* Debajo del botón "Añadir otro ¿Por qué?" */}
                {form.formState.errors.root_cause_analysis && (
                    <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.root_cause_analysis.message}
                    </p>
                )}
                {/* --- BOTÓN ENVIAR --- */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        size="sm" // Hace el botón más pequeño
                        className="w-fit" // Evita que ocupe todo el ancho si el contenedor es flex-col
                        disabled={createDangerIdentification.isPending || updateDangerIdentification.isPending}
                    >
                        {createDangerIdentification.isPending || updateDangerIdentification.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isEditing ? "Actualizar" : "Enviar"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
