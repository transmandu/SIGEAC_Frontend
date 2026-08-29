"use client";

import { format, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Un dato del artículo; `full` lo hace ocupar la fila completa. */
export interface PreviewField {
    label: string;
    value?: string | number | null;
    full?: boolean;
}

export interface PreviewGroup {
    title: string;
    fields: PreviewField[];
}

const EMPTY = "—";

/** Fechas del formulario: llegan como Date, ISO, o nada. */
export const previewDate = (value?: string | Date | null) => {
    if (!value) return "No aplica";

    if (typeof value === "string") {
        if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return "No aplica";
        const parsed = parseISO(value);
        return isNaN(parsed.getTime()) ? "No aplica" : format(parsed, "yyyy-MM-dd");
    }

    return isNaN(value.getTime()) ? "No aplica" : format(value, "yyyy-MM-dd");
};

export const previewList = (values?: string[]) =>
    values && values.length ? values.join(", ") : EMPTY;

/**
 * Vista previa del artículo antes de guardarlo.
 *
 * Sirve a las cuatro categorías: cada formulario arma sus grupos y este
 * diálogo solo los presenta. Antes existía uno por categoría, con paleta fija
 * que no respetaba el tema y sin varios campos que el formulario sí captura.
 */
export const ArticlePreviewDialog = ({
    open,
    onClose,
    onConfirm,
    title,
    groups,
    busy,
    confirmLabel = "Registrar",
    description,
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    groups: PreviewGroup[];
    busy?: boolean;
    confirmLabel?: string;
    /** Al editar no se "registra" nada: el texto por defecto no encaja. */
    description?: string;
}) => (
    <Dialog open={open} onOpenChange={onClose}>
        {/* El cuerpo scrollea, no el DialogContent: así el pie queda fijo. */}
        <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col gap-0 p-0">
            <DialogHeader className="shrink-0 space-y-1 border-b px-6 py-4">
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>
                    {description ?? "Verifique que la información sea correcta antes de registrar."}
                </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
                {groups
                    .filter((group) => group.fields.length > 0)
                    .map((group) => (
                        <section
                            key={group.title}
                            className={cn(
                                "rounded-xl p-4",
                                "bg-gradient-to-br from-background/70 to-background/40",
                                "border border-slate-400/50 dark:border-slate-600/50",
                                "shadow-sm",
                            )}
                        >
                            <h3 className="mb-3 text-sm font-semibold leading-none">
                                {group.title}
                            </h3>
                            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {group.fields.map((field) => (
                                    <div
                                        key={field.label}
                                        className={cn("min-w-0 space-y-0.5", field.full && "sm:col-span-2")}
                                    >
                                        <dt className="text-xs text-muted-foreground">{field.label}</dt>
                                        <dd
                                            className={cn(
                                                "text-sm font-medium",
                                                field.full && "whitespace-pre-wrap",
                                            )}
                                        >
                                            {field.value === undefined ||
                                            field.value === null ||
                                            field.value === ""
                                                ? EMPTY
                                                : field.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    ))}
            </div>

            <DialogFooter className="shrink-0 gap-3 border-t bg-background px-6 py-4">
                <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
                    Volver y corregir
                </Button>
                <Button
                    type="button"
                    onClick={onConfirm}
                    disabled={busy}
                    className="min-w-[140px]"
                >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);
