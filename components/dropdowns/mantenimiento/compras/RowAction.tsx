"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const rowActionIconClass =
  "size-4.5 transition-all duration-200 ease-out group-hover:scale-110";

export const rowActionItemClass = `
  group
  relative
  flex
  items-center
  justify-center
  size-9
  rounded-xl
  transition-all
  duration-200
  ease-out
  hover:bg-muted
  hover:shadow-xs
  active:scale-95
  max-md:h-11
  max-md:w-full
  max-md:justify-start
  max-md:gap-3
  max-md:px-3
  max-md:active:bg-muted
  motion-safe:max-md:animate-item-in
`;

/** Entrada escalonada de la lista móvil: cada acción llega 35 ms después de la anterior. */
const MOBILE_STAGGER = [
  "max-md:[&>*:nth-child(1)]:[animation-delay:60ms]",
  "max-md:[&>*:nth-child(2)]:[animation-delay:95ms]",
  "max-md:[&>*:nth-child(3)]:[animation-delay:130ms]",
  "max-md:[&>*:nth-child(4)]:[animation-delay:165ms]",
  "max-md:[&>*:nth-child(5)]:[animation-delay:200ms]",
  "max-md:[&>*:nth-child(6)]:[animation-delay:235ms]",
  "max-md:[&>*:nth-child(7)]:[animation-delay:270ms]",
];

/**
 * Contenedor del menú flotante de la fila: iconos en hilera con tooltip en
 * escritorio; lista vertical con el nombre de cada acción en móvil, donde no
 * hay hover que explique el icono.
 */
export const rowActionMenuClass = cn(
  "flex items-center justify-center gap-1.5 overflow-visible rounded-2xl border border-border/50 bg-background p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-200 md:bg-background/90 md:backdrop-blur-xl max-md:min-w-48 max-md:origin-(--radix-dropdown-menu-content-transform-origin) max-md:flex-col max-md:items-stretch max-md:gap-0.5 max-md:zoom-in-100",
  ...MOBILE_STAGGER,
);

/** Nombre de la acción: solo se ve en la lista móvil. */
export const RowActionLabel = ({ children }: { children: ReactNode }) => (
  <span className="text-sm font-medium md:hidden">{children}</span>
);

export const rowActionBarItemClass =
  "group flex h-7 flex-1 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-background active:scale-95 disabled:opacity-40";

interface RowActionProps {
  /** Tooltip del icono. */
  title: string;
  /** Aclaración larga; si existe reemplaza a `title`. */
  hint?: string;
  icon: LucideIcon;
  tone: string;
  inBar: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

/**
 * Una misma acción de fila en sus dos presentaciones: icono dentro del menú
 * flotante de la tabla o dentro de la barra del panel lateral. Las condiciones
 * y los manejadores viven una sola vez, en el componente que la usa.
 */
export const RowAction = ({
  title,
  hint,
  icon: Icon,
  tone,
  inBar,
  onSelect,
  disabled,
}: RowActionProps) => {
  const button = inBar ? (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-label={hint ?? title}
      className={cn(rowActionBarItemClass, tone)}
    >
      <Icon className="size-4 transition-transform duration-200 group-hover:scale-110" />
    </button>
  ) : (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-label={hint ?? title}
      className={cn(rowActionItemClass, tone)}
    >
      <Icon className={cn(rowActionIconClass, "shrink-0")} />
      <RowActionLabel>{title}</RowActionLabel>
    </button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {inBar ? (
          <span className="flex flex-1">{button}</span>
        ) : (
          <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
            {button}
          </DropdownMenuItem>
        )}
      </TooltipTrigger>
      <TooltipContent className="max-w-70 max-md:hidden">
        {hint ?? title}
      </TooltipContent>
    </Tooltip>
  );
};

/** Barra delgada de una sola línea con las acciones de la fila (panel lateral). */
export const RowActionsBar = ({ children }: { children: ReactNode }) => (
  <div className="flex w-full max-w-xs items-center gap-0.5 rounded-xl border border-border/40 bg-muted/30 p-0.5">
    {children}
  </div>
);
