"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * Sección de formulario de compras: panel con franja de encabezado (título y
 * descripción) sobre el cuerpo. Es el lenguaje de las cotizaciones, y desde
 * ahí se extendió al resto de formularios del bloque.
 *
 * Solo decide el contenedor: la altura de los campos la fija cada formulario
 * según su densidad (40 px en los de pocos campos, 36 en filas repetidas y 32
 * en las filas de artículo de una cotización).
 */
export function PanelSection({
  icon: Icon,
  title,
  hint,
  action,
  compact,
  flush,
  className,
  id,
  children,
}: {
  icon?: LucideIcon;
  title: ReactNode;
  hint?: ReactNode;
  /** Control a la derecha del encabezado (contador, "marcar todos"…). */
  action?: ReactNode;
  /** Cuerpo más ajustado (12 px de margen en lugar de 16). */
  compact?: boolean;
  /** Cuerpo sin margen: para listas con filas a borde, que ponen el suyo. */
  flush?: boolean;
  className?: string;
  id?: string;
  /** Sin cuerpo, la sección es solo su franja (un interruptor, por ejemplo). */
  children?: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-xl border border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900/60",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-3 bg-muted/30 px-4 py-2",
          children ? "rounded-t-xl border-b" : "rounded-xl",
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon && (
            <Icon
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
          )}
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-tight text-foreground/80">
              {title}
            </p>
            {hint && (
              <p className="text-xs leading-snug text-muted-foreground">
                {hint}
              </p>
            )}
          </div>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {children && (
        <div className={flush ? "" : compact ? "p-3" : "p-4"}>{children}</div>
      )}
    </section>
  );
}

/**
 * Una opción de sí/no con su explicación: el texto a la izquierda y el
 * interruptor a la derecha. Reemplaza a la casilla en tarjeta (`CheckboxCard`)
 * dentro de un panel: el panel ya es el recuadro, y un segundo recuadro por
 * opción pesaba más que la opción.
 */
export function SwitchRow({
  id,
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  className,
}: {
  id: string;
  checked?: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start justify-between gap-4",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className,
      )}
    >
      <span className="min-w-0 space-y-0.5">
        <span className="block text-sm font-medium leading-tight">{label}</span>
        {description && (
          <span className="block text-[13px] leading-snug text-muted-foreground">
            {description}
          </span>
        )}
      </span>

      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="mt-0.5"
      />
    </label>
  );
}

/** Rótulo con su línea para un dato que no es un campo del formulario. */
export function PanelStaticLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-4 items-center gap-2 pb-1.5", className)}>
      <span className="select-none text-[13px] font-medium text-muted-foreground">
        {children}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  );
}

/**
 * Rótulo de un campo dentro de un `FormItem`, con la línea que lo prolonga
 * hasta el borde. Con `preventClick` no enfoca el control al pulsarlo: los
 * combobox son botones que abren un popover, y el clic en el rótulo lo abría
 * sin que el usuario lo pidiera.
 */
export function PanelFieldLabel({
  children,
  preventClick = false,
  action,
  className,
}: {
  children: ReactNode;
  preventClick?: boolean;
  /** Dato a la derecha del rótulo (contador de caracteres, "opcional"…). */
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-4 items-center gap-2 pb-1.5", className)}>
      <FormLabel
        className="m-0 select-none text-[13px] font-medium text-muted-foreground"
        onClick={preventClick ? (event) => event.preventDefault() : undefined}
      >
        {children}
      </FormLabel>
      <div className="h-px flex-1 bg-border/60" />
      {action}
    </div>
  );
}
