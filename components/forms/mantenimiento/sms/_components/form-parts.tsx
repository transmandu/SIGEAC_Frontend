"use client";

import type { ChangeEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { Loader2, Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Piezas compartidas por los formularios de gestión de riesgos.
 *
 * La regla visual es una sola caja por pantalla: el panel. Dentro del
 * formulario las secciones se separan con una línea, no con más bordes.
 */
export function FormSection({
  title,
  hint,
  children,
  className,
}: {
  title?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "space-y-4 border-t pt-5 first:border-t-0 first:pt-0",
        className,
      )}
    >
      {title || hint ? (
        <div className="space-y-0.5">
          {title ? <h3 className="text-sm font-semibold">{title}</h3> : null}
          {hint ? (
            <p className="text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function FormActions({
  onCancel,
  submitLabel,
  isPending,
  cancelLabel = "Cancelar",
}: {
  onCancel?: () => void;
  submitLabel: string;
  isPending?: boolean;
  cancelLabel?: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
      {onCancel ? (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          {cancelLabel}
        </Button>
      ) : null}

      <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {submitLabel}
      </Button>
    </div>
  );
}

export function FileInput({
  id,
  accept,
  fileName,
  placeholder,
  onChange,
  icon: Icon = Paperclip,
}: {
  id: string;
  accept?: string;
  fileName?: string;
  placeholder: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  icon?: LucideIcon;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2.5 rounded-md border border-dashed px-3 py-2.5 text-sm transition-colors hover:border-primary/40 hover:bg-accent/30 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
    >
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          fileName ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {fileName || placeholder}
      </span>
      <span className="shrink-0 text-xs font-medium text-primary">Elegir</span>
      <input
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={onChange}
      />
    </label>
  );
}
