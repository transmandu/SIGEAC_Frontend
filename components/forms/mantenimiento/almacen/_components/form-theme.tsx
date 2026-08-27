"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/**
 * Lenguaje visual compartido por los formularios de almacén, extraído del
 * formulario de artículos generales para que las 12 variantes de artículo por
 * lote dejen de definir cada una su propio aspecto.
 */

/**
 * Un campo bloqueado tiene que verse bloqueado ANTES de que el usuario intente
 * usarlo: se apaga y muestra el cursor de "no permitido".
 *
 * `readOnly` necesita su propia regla porque no dispara la variante `disabled:`
 * de Tailwind: un campo de solo lectura se veía idéntico a uno editable, y el
 * usuario solo descubría que no podía escribir al intentarlo. Los campos que
 * conservan su valor a la vista (el número de orden que viene del sistema) son
 * justo los que más se prestan a esa confusión.
 *
 * Esa regla se acota a `input` y `textarea` a propósito: en CSS `:read-only`
 * acierta en TODO lo que no sea editable, y un `<button>` —que es lo que hay
 * detrás de cada combobox— nunca lo es. Sin el acotado, los selectores
 * perfectamente utilizables salían apagados y con el cursor de bloqueo.
 */
const lockedFieldClass = cn(
    "disabled:cursor-not-allowed disabled:opacity-60",
    "disabled:hover:border-slate-400/60 disabled:hover:shadow-sm dark:disabled:hover:border-slate-600/60",
    "[&:is(input,textarea):read-only]:cursor-not-allowed",
    "[&:is(input,textarea):read-only]:opacity-60",
    "[&:is(input,textarea):read-only]:bg-muted/40",
    "[&:is(input,textarea):read-only]:hover:border-slate-400/60",
    "[&:is(input,textarea):read-only]:hover:shadow-sm",
    "dark:[&:is(input,textarea):read-only]:hover:border-slate-600/60",
);

export const fieldClass = cn(
    "h-11 rounded-lg text-[15px]",
    "bg-gradient-to-br from-background/70 to-background/40",
    "backdrop-blur-md",
    "border border-slate-400/60 dark:border-slate-600/60",
    "shadow-sm",
    "hover:border-blue-400/30",
    "hover:shadow-md hover:shadow-blue-500/10",
    "transition-all duration-200",
    lockedFieldClass,
);

export const numericFieldClass = cn(fieldClass, "tabular-nums");

export const selectTriggerClass = cn(fieldClass, "hover:shadow-none");

/** Los combobox y date pickers son botones: el texto se alinea a la izquierda. */
export const triggerButtonClass = cn(
    selectTriggerClass,
    "w-full justify-between px-3 font-normal",
    // El `Button` de shadcn se deshabilita con `pointer-events-none`, y con eso
    // el navegador resuelve el cursor del elemento de abajo: el usuario ve la
    // flecha normal sobre un campo que no puede tocar. Se devuelven los eventos
    // solo para poder mostrar el cursor correcto; el `disabled` del botón sigue
    // impidiendo el clic y el foco.
    "disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-60",
    "disabled:hover:border-slate-400/60 disabled:hover:shadow-none dark:disabled:hover:border-slate-600/60",
);

/** El textarea crece con las filas, así que no puede heredar la altura fija. */
export const textareaClass = cn(fieldClass, "h-auto resize-none py-2");

export const labelClass = "text-sm font-medium text-foreground/85";

/** Texto de apoyo bajo un campo: un escalón por debajo del rótulo. */
export const hintClass = "text-[13px] text-muted-foreground";

export const sectionClass = cn(
    "rounded-xl p-4",
    "bg-gradient-to-br from-background/70 to-background/40",
    "backdrop-blur-md",
    "border border-slate-400/50 dark:border-slate-600/50",
    "shadow-sm",
);

export const SectionTitle = ({
    icon: Icon,
    title,
    hint,
    action,
}: {
    /** Sin icono, la viñeta queda como un punto neutro del mismo tamaño. */
    icon?: LucideIcon;
    title: string;
    hint?: string;
    action?: React.ReactNode;
}) => (
    <div className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {Icon ? (
                <Icon className="h-4 w-4" />
            ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
            )}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-base font-semibold leading-none">{title}</h3>
            {hint && <p className={hintClass}>{hint}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
    </div>
);

/** Sección con el cristal y el encabezado ya montados. */
export const FormSection = ({
    icon,
    title,
    hint,
    action,
    className,
    children,
}: {
    icon?: LucideIcon;
    title: string;
    hint?: string;
    action?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}) => (
    <section className={cn(sectionClass, className)}>
        <SectionTitle icon={icon} title={title} hint={hint} action={action} />
        {children}
    </section>
);

/**
 * Deja solo dígitos y un punto decimal.
 *
 * Se usa con inputs de texto y no con `type="number"`: ese incrementa el valor
 * con la rueda del ratón cuando tiene el foco, y el usuario cambia cantidades
 * sin darse cuenta al desplazar el formulario.
 */
export const onlyNumeric = (raw: string) => {
    const cleaned = raw.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");

    return parts.length <= 1 ? cleaned : `${parts[0]}.${parts.slice(1).join("")}`;
};

/** Igual que `onlyNumeric` pero para campos que no admiten decimales. */
export const onlyInteger = (raw: string) => raw.replace(/\D/g, "");
