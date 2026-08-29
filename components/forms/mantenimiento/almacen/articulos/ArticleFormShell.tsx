"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Marco común de los formularios de artículo: cuerpo y acciones.
 *
 * Sin encabezado a propósito: el título lo pone la página o el diálogo que
 * monta el formulario, que es quien sabe en qué flujo está el usuario.
 */
export const ArticleFormShell = ({
    busy,
    canSave,
    isEditing,
    submitLabel,
    onCancel,
    /** Presente cuando el contexto monta el botón en el pie de un diálogo. */
    hideActions,
    /** El botón abre una vista previa en vez de guardar: el rótulo lo anuncia. */
    opensPreview,
    onSubmit,
    formRef,
    children,
}: {
    busy?: boolean;
    canSave?: boolean;
    isEditing?: boolean;
    submitLabel?: string;
    onCancel?: () => void;
    hideActions?: boolean;
    opensPreview?: boolean;
    onSubmit: React.FormEventHandler<HTMLFormElement>;
    formRef?: React.Ref<HTMLFormElement>;
    children: React.ReactNode;
}) => (
    <form ref={formRef} className="flex flex-col gap-5" onSubmit={onSubmit}>
        {children}

        {!hideActions && (
            <div className="flex justify-end gap-3 border-t pt-4">
                {onCancel && (
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
                        Cancelar
                    </Button>
                )}
                <Button type="submit" disabled={busy || !canSave} className="min-w-[170px]">
                    {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        (submitLabel ??
                            (opensPreview
                                ? (isEditing ? "Revisar cambios" : "Revisar y registrar")
                                : (isEditing ? "Guardar cambios" : "Registrar")))
                    )}
                </Button>
            </div>
        )}
    </form>
);
