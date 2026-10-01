"use client";

import { Info } from "lucide-react";

import { RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Opción de un grupo excluyente, con rótulo y una explicación opcional.
 *
 * Hermana de [CheckboxCard]: mismo alto, mismo borde y mismo realce al quedar
 * elegida, para que un grupo de opciones y un grupo de casillas se vean como la
 * misma familia dentro de una grilla.
 *
 * La explicación va en un tooltip y no bajo el rótulo: así la tarjeta mide lo
 * mismo que un campo y puede compartir fila con uno sin descuadrarla.
 */
export const RadioCard = ({
  id,
  value,
  checked,
  label,
  hint,
  disabled,
  className,
}: {
  id: string;
  value: string;
  /** Solo decide el realce; quién está elegido lo lleva el `RadioGroup`. */
  checked?: boolean;
  label: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}) => (
  <label
    htmlFor={id}
    className={cn(
      "flex min-h-11 items-center gap-3 rounded-lg px-3.5 py-3",
      "border border-slate-400/60 bg-background/40 dark:border-slate-600/60",
      "transition-colors duration-200",
      disabled
        ? "cursor-not-allowed opacity-50"
        : "cursor-pointer hover:border-blue-400/40 hover:bg-primary/3",
      checked && !disabled && "border-primary/50 bg-primary/6",
      className,
    )}
  >
    {/* El punto del indicador lo fija el componente base en 10px, pensado
            para un radio de 16px; aquí se agranda con el control. */}
    <RadioGroupItem
      id={id}
      value={value}
      disabled={disabled}
      className="h-4.5 w-4.5 shrink-0 [&_svg]:h-3 [&_svg]:w-3"
    />
    <span className="min-w-0 flex-1 text-sm font-medium leading-tight">
      {label}
    </span>
    {hint && (
      <Tooltip>
        {/* `asChild` no: el disparador va dentro de un <label>, y un
                    botón ahí robaría el clic que marca la opción. */}
        <TooltipTrigger
          tabIndex={-1}
          onClick={(event) => event.preventDefault()}
          className="shrink-0 text-muted-foreground/70 transition-colors hover:text-muted-foreground"
        >
          <Info className="size-4" />
        </TooltipTrigger>
        <TooltipContent className="max-w-56">{hint}</TooltipContent>
      </Tooltip>
    )}
  </label>
);
