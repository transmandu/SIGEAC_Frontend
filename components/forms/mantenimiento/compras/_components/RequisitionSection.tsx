"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import {
  fieldClass,
  selectTriggerClass,
  triggerButtonClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { cn } from "@/lib/utils";

import { PanelFieldLabel, PanelSection } from "@/components/forms/PanelSection";

/**
 * Secciones de los formularios de solicitud: el panel con franja de
 * encabezado del resto de formularios de compras, con campos de 40 px (36 en
 * las filas de artículo) porque aquí conviven muchos campos por pantalla.
 */
export function RequisitionSection({
  icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <PanelSection icon={icon} title={title} hint={description} compact>
      {children}
    </PanelSection>
  );
}

/**
 * Rótulo de un campo dentro de un `FormItem`. Con `preventClick` no enfoca el
 * control al pulsarlo (ver `PanelFieldLabel`).
 */
export function FieldLabel({
  children,
  preventClick = false,
}: {
  children: ReactNode;
  preventClick?: boolean;
}) {
  return (
    <PanelFieldLabel preventClick={preventClick}>{children}</PanelFieldLabel>
  );
}

/** Disparador de combobox de los datos de la solicitud. */
export const requisitionTriggerClass = cn(
  triggerButtonClass,
  "h-10 min-w-0 text-sm max-sm:text-base",
);

/** Campos de las filas de artículo: un escalón más compactos (36 px; 40 en móvil). */
export const rowFieldClass = cn(
  fieldClass,
  "h-9 text-sm max-sm:h-10 max-sm:text-base",
);

/** Disparador de combobox dentro de una fila de artículo. */
export const rowTriggerClass = cn(
  triggerButtonClass,
  "h-9 min-w-0 px-2.5 text-sm max-sm:h-10 max-sm:text-base",
);

/** Botón de icono junto a un combobox (crear renglón, artículo no registrado): mismo molde que el campo. */
export const requisitionIconButtonClass = cn(
  selectTriggerClass,
  "size-10 shrink-0 justify-center p-0 text-muted-foreground hover:text-foreground",
);
