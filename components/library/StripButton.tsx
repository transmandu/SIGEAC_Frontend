"use client";

import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { cn } from "@/lib/utils";

interface StripButtonProps extends Omit<
  ComponentProps<typeof ActionTriggerButton>,
  "ref"
> {
  icon: LucideIcon;
  /** Lo destructivo (vaciar, eliminar) se tiñe de rojo al apuntarlo. */
  danger?: boolean;
}

/**
 * Botón de las franjas y barras de la biblioteca (volver, mover, copiar,
 * vaciar la papelera…): el `ActionTriggerButton` del sistema en tamaño de
 * barra (32 px; 40 en móvil). Un `Button` suelto aquí se veía de otra familia.
 *
 * El icono lleva su separación propia: `ActionTriggerButton` envuelve el
 * contenido en un flex sin `gap`, y sin ella el icono toca el texto.
 */
export function StripButton({
  icon: Icon,
  danger = false,
  className,
  children,
  ...props
}: StripButtonProps) {
  return (
    <ActionTriggerButton
      type="button"
      size="sm"
      className={cn(
        "h-8 px-3 text-xs max-sm:h-10 max-sm:text-sm",
        danger &&
          "text-red-600 hover:border-red-500/40 hover:text-red-600 dark:text-red-400",
        className,
      )}
      {...props}
    >
      <Icon className="mr-2 size-4" />
      {children}
    </ActionTriggerButton>
  );
}
