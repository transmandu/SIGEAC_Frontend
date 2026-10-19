"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  "disabled:hover:border-slate-400/60 disabled:hover:shadow-xs dark:disabled:hover:border-slate-600/60",
  "[&:is(input,textarea):read-only]:cursor-not-allowed",
  "[&:is(input,textarea):read-only]:opacity-60",
  "[&:is(input,textarea):read-only]:bg-muted/40",
  "[&:is(input,textarea):read-only]:hover:border-slate-400/60",
  "[&:is(input,textarea):read-only]:hover:shadow-xs",
  "dark:[&:is(input,textarea):read-only]:hover:border-slate-600/60",
);

/**
 * `FormControl` marca `aria-invalid` en el control que envuelve, así que basta
 * este estilo para que cualquier campo con error se vea con error: sin él solo
 * se teñía el rótulo y el mensaje, y el campo en sí quedaba idéntico a uno sano.
 *
 * Los `hover:` van repetidos con `aria-invalid:` porque el realce azul del
 * campo sano tiene la misma especificidad y, al pasar el cursor, devolvería el
 * borde normal justo sobre el campo que hay que corregir.
 */
export const invalidFieldClass = cn(
  "aria-invalid:border-destructive/70 dark:aria-invalid:border-destructive/70",
  "aria-invalid:hover:border-destructive aria-invalid:hover:shadow-destructive/10",
  "aria-invalid:focus-visible:ring-destructive/30",
);

export const fieldClass = cn(
  "h-11 rounded-lg text-[15px]",
  "bg-linear-to-br from-background/70 to-background/40",
  "backdrop-blur-md",
  "border border-slate-400/60 dark:border-slate-600/60",
  "shadow-xs",
  "hover:border-blue-400/30",
  "hover:shadow-md hover:shadow-blue-500/10",
  "transition-all duration-200",
  invalidFieldClass,
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

/**
 * Fila del rótulo de un campo, a la altura del elemento más alto que puede
 * acompañarlo: el botón de acción de algunos campos ("crear renglón", "crear
 * fabricante"), que mide 24px frente a los 20 del texto.
 *
 * Las grillas ponen dos o tres campos por fila y solo algunos llevan ese botón.
 * Cuando la altura la fijaba el wrapper de esos, sus inputs arrancaban 4px más
 * abajo que los de sus vecinos, así que la envuelven TODOS los rótulos de una
 * misma grilla, lleven acción o no.
 *
 * No se mete en `labelClass` porque hay una segunda altura legítima: las filas
 * que comparten con un `DatePickerField` se igualan a 16px —su rótulo lleva la
 * casilla "No aplica" con `leading-none`— y ahí 24px descuadraría la fila.
 */
export const FieldLabelRow = ({
  action,
  children,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="flex min-h-6 items-center justify-between gap-2">
    {children}
    {action}
  </div>
);

/** Texto de apoyo bajo un campo: un escalón por debajo del rótulo. */
export const hintClass = "text-[13px] text-muted-foreground";

export const sectionClass = cn(
  "rounded-xl p-4",
  "bg-linear-to-br from-background/70 to-background/40",
  "backdrop-blur-md",
  "border border-slate-400/50 dark:border-slate-600/50",
  "shadow-xs",
);

export const SectionTitle = ({
  icon: Icon,
  title,
  hint,
  action,
  compact,
  flush,
}: {
  /** Sin icono, la viñeta queda como un punto neutro del mismo tamaño. */
  icon?: LucideIcon;
  title: React.ReactNode;
  hint?: string;
  action?: React.ReactNode;
  /** Menos aire bajo el encabezado, para formularios cortos en un diálogo. */
  compact?: boolean;
  /** Sin margen inferior: lo pone quien envuelve el encabezado (sección plegable). */
  flush?: boolean;
}) => (
  // Con hint el bloque de texto tiene dos líneas: el icono se ancla arriba
  // (con un pequeño empuje) para que quede a la altura del título, no del
  // bloque entero. Sin hint es una sola línea, así que centrarlos es lo que
  // los deja alineados de verdad — "items-start" ahí dejaba el título
  // flotando por encima del icono.
  <div
    className={cn(
      "flex gap-3",
      !flush && (compact ? "mb-3" : "mb-5"),
      hint ? "items-start" : "items-center",
    )}
  >
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
        hint && "mt-0.5",
      )}
    >
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

/** Evento con el que SectionNav pide abrir la sección `detail` antes de saltar a ella. */
export const SECTION_JUMP_EVENT = "section:jump";

/**
 * Abierto/plegado de una sección, recordado por navegador bajo `storageKey`:
 * quien pliega "Información general" no debe tener que replegarla en cada
 * visita. Arranca en `defaultOpen` y lee lo guardado al montar (no en el
 * primer render, para no desajustar la hidratación). Sin `storageKey` no
 * recuerda nada; el almacenamiento puede no estar disponible (modo privado).
 */
const useRememberedOpen = (
  storageKey: string | undefined,
  defaultOpen: boolean,
) => {
  const [open, setOpen] = useState(defaultOpen);
  const fullKey = storageKey ? `section-open:${storageKey}` : undefined;

  useEffect(() => {
    if (!fullKey) return;
    try {
      const saved = window.localStorage.getItem(fullKey);
      if (saved !== null) setOpen(saved === "1");
    } catch {
      // Sin almacenamiento: queda el valor por defecto.
    }
  }, [fullKey]);

  const update = (next: boolean) => {
    setOpen(next);
    if (!fullKey) return;
    try {
      window.localStorage.setItem(fullKey, next ? "1" : "0");
    } catch {
      // Se pliega igual, solo que sin recordarlo.
    }
  };

  return [open, update, setOpen] as const;
};

/** Sección con el cristal y el encabezado ya montados. */
export const FormSection = ({
  icon,
  title,
  hint,
  action,
  compact,
  className,
  id,
  collapsible,
  defaultOpen = true,
  storageKey,
  children,
}: {
  icon?: LucideIcon;
  title: React.ReactNode;
  hint?: string;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
  /** El encabezado pliega y despliega el contenido; `action` sigue activo aparte. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  /** Ancla de la sección: destino de los saltos del índice (SectionNav). */
  id?: string;
  /** Identifica la sección para recordar si el usuario la dejó plegada. */
  storageKey?: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen, showOpen] = useRememberedOpen(storageKey, defaultOpen);

  // Un salto desde el índice de la página (SectionNav) a una sección plegada
  // la despliega para que se vea a dónde llegó, sin cambiar lo que el usuario
  // tenía recordado.
  useEffect(() => {
    if (!id) return;
    const onJump = (event: Event) => {
      if ((event as CustomEvent<string>).detail === id) showOpen(true);
    };
    window.addEventListener(SECTION_JUMP_EVENT, onJump);
    return () => window.removeEventListener(SECTION_JUMP_EVENT, onJump);
  }, [id, showOpen]);

  if (!collapsible) {
    return (
      <section
        id={id}
        className={cn(
          sectionClass,
          "scroll-mt-20",
          compact && "p-3.5",
          className,
        )}
      >
        <SectionTitle
          icon={icon}
          title={title}
          hint={hint}
          action={action}
          compact={compact}
        />
        {children}
      </section>
    );
  }

  return (
    <section
      id={id}
      className={cn(
        sectionClass,
        "scroll-mt-20",
        compact && "p-3.5",
        className,
      )}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-start gap-3">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              aria-label={open ? "Plegar sección" : "Desplegar sección"}
              className="group min-w-0 flex-1 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <SectionTitle icon={icon} title={title} hint={hint} flush />
            </button>
          </CollapsibleTrigger>
          {action && <div className="shrink-0">{action}</div>}
          {/* Siempre lo último del encabezado. Muestra a dónde lleva el clic:
              abajo si está plegada (se despliega), arriba si está abierta. */}
          <CollapsibleTrigger asChild>
            <button
              type="button"
              aria-label={open ? "Plegar sección" : "Desplegar sección"}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {open ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className={compact ? "pt-3" : "pt-5"}>
          {children}
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
};

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
