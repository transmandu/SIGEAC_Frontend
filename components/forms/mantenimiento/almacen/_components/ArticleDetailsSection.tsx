"use client";

import { FileText } from "lucide-react";
import type { Control } from "react-hook-form";

import ArticleDocumentsSelector from "@/components/misc/ArticleDocumentsSelector";
import type { ArticleDocumentSelection } from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { ArticleDocumentRequirementSummary } from "@/types";

import { ArticleImageField } from "./ArticleImageField";
import { CheckboxCard } from "./CheckboxCard";
import { FormSection, hintClass, labelClass, textareaClass } from "./form-theme";

/** `Article.image` es `File | string`: al editar solo interesa la URL guardada. */
export const savedImageUrl = (image?: File | string | null) =>
    typeof image === "string" ? image : null;

/**
 * "Detalles y documentos": una sola implementación para los 12 formularios de
 * artículo por lote (componente, parte, consumible, herramienta × registro
 * directo, recepción administrativa e ingreso administrativo).
 *
 * La imagen es del artículo y no de su documentación, así que se muestra
 * siempre: antes quedaba escondida tras la casilla de documentación en varios
 * de los formularios, y el selector saltaba de fila al marcarla porque el grid
 * de dos columnas recibía tres hijos condicionales.
 */
export const ArticleDetailsSection = ({
    control,
    descriptionName = "description",
    descriptionLabel = "Observaciones",
    descriptionPlaceholder,
    descriptionHint = "Notas sobre el artículo y su ingreso.",
    imageFile,
    onImageChange,
    currentImageUrl,
    imageLabel,
    hasDocumentation,
    onHasDocumentationChange,
    documents,
    onDocumentsChange,
    consignedRequirements,
    disabled,
    /** Casillas propias del flujo, p. ej. destino indeterminado. */
    extraChecks,
}: {
    control: Control<any>;
    descriptionName?: string;
    descriptionLabel?: string;
    descriptionPlaceholder?: string;
    descriptionHint?: string;
    imageFile?: File;
    onImageChange: (file?: File) => void;
    currentImageUrl?: string | null;
    imageLabel?: string;
    hasDocumentation?: boolean;
    onHasDocumentationChange: (checked: boolean) => void;
    documents: ArticleDocumentSelection[];
    onDocumentsChange: (documents: ArticleDocumentSelection[]) => void;
    consignedRequirements?: ArticleDocumentRequirementSummary[];
    disabled?: boolean;
    extraChecks?: React.ReactNode;
}) => (
    <FormSection
        icon={FileText}
        title="Detalles y documentos"
        hint="Observaciones, imagen y documentación que acompaña al artículo."
    >
        {/* Dos columnas parejas: a la izquierda lo que describe al artículo, a
            la derecha lo que lo documenta. items-start evita que la columna
            corta se estire cuando la otra despliega el selector. */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            <div className="space-y-4">
                <FormField
                    control={control}
                    name={descriptionName}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={labelClass}>{descriptionLabel}</FormLabel>
                            <FormControl>
                                <Textarea
                                    rows={5}
                                    placeholder={descriptionPlaceholder}
                                    {...field}
                                    value={field.value ?? ""}
                                    disabled={disabled}
                                    className={textareaClass}
                                />
                            </FormControl>
                            <FormDescription className={hintClass}>
                                {descriptionHint}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <ArticleImageField
                    value={imageFile}
                    onChange={onImageChange}
                    currentImageUrl={currentImageUrl}
                    disabled={disabled}
                    label={imageLabel}
                />
            </div>

            <div className="space-y-3">
                {extraChecks}

                <CheckboxCard
                    id="has-documentation"
                    checked={hasDocumentation}
                    onCheckedChange={onHasDocumentationChange}
                    label="¿El artículo tiene documentación?"
                    description="Seleccione los documentos que se esperan del artículo para consignarlos."
                    disabled={disabled}
                />

                {hasDocumentation && (
                    <ArticleDocumentsSelector
                        value={documents}
                        onChange={onDocumentsChange}
                        disabled={disabled}
                        consignedRequirements={consignedRequirements}
                    />
                )}
            </div>
        </div>
    </FormSection>
);
