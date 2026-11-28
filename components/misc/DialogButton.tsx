"use client";

import * as React from "react";
import {
  Check,
  ClipboardCheck,
  Copy,
  Download,
  FolderInput,
  KeyRound,
  Loader2,
  Lock,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Send,
  Share2,
  Trash2,
  Upload,
  UserMinus,
  UserPlus,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
/** `secondary` = acción que no cierra ni descarta (p. ej. guardar borrador). */
export type DialogButtonTone =
  | "cancel"
  | "secondary"
  | "primary"
  | "danger"
  | "warning";

/**
 * Misma familia visual que `ActionTriggerButton` (alto 40 px, `rounded-md`,
 * borde, `shadow-xs`, `font-medium`), pero para las acciones que CIERRAN un
 * diálogo: Cancelar, Guardar, Eliminar, Confirmar.
 *
 * Sin brillo que siga al cursor ni levantamiento al apuntar: esos efectos
 * invitan a abrir algo, y aquí el usuario ya decidió. El hover es solo un
 * cambio de tono del propio fondo; Cancelar y Eliminar lo hacen hacia el rojo.
 */
const TONES: Record<DialogButtonTone, string> = {
  cancel: [
    "border-border bg-background text-foreground/80",
    "hover:border-red-500/45 hover:bg-red-500/6 hover:text-red-700",
    "dark:hover:border-red-400/45 dark:hover:bg-red-400/10 dark:hover:text-red-300",
    "focus-visible:ring-red-500/20",
  ].join(" "),
  secondary:
    "border-border bg-background text-foreground/80 hover:bg-muted/70 hover:text-foreground",
  primary:
    "border-primary bg-primary text-primary-foreground shadow-[inset_0_1px_0_0_rgb(255_255_255/0.14)] hover:bg-primary/90",
  danger: [
    "border-red-800/40 bg-red-700 text-white shadow-[inset_0_1px_0_0_rgb(255_255_255/0.12)]",
    "hover:bg-red-800",
    "dark:border-red-500/40 dark:bg-red-600 dark:hover:bg-red-700",
    "focus-visible:ring-red-500/25",
  ].join(" "),
  warning:
    "border-amber-700/40 bg-amber-600 text-white shadow-[inset_0_1px_0_0_rgb(255_255_255/0.14)] hover:bg-amber-700 focus-visible:ring-amber-500/25",
};

/**
 * Icono por defecto según el verbo del rótulo, para que el botón principal de
 * un diálogo siempre diga con un símbolo qué hace. Un formulario que tenga uno
 * más específico (el de su entidad) lo pasa por `icon`.
 */
const VERB_ICONS: Array<[RegExp, LucideIcon]> = [
  [/^(crear|agregar|anadir|registrar|habilitar|nuevo|nueva)\b/, Plus],
  [/^(guardar|actualizar|aplicar)\b/, Save],
  [/^subir\b/, Upload],
  [/^descargar\b/, Download],
  [/^(enviar|solicitar)\b/, Send],
  [/^generar\b/, KeyRound],
  [/^(eliminar|borrar|vaciar|descartar)\b/, Trash2],
  [/^restaurar\b/, RotateCcw],
  [/^mover\b/, FolderInput],
  [/^copiar\b/, Copy],
  [/^compartir\b/, Share2],
  [/^(renombrar|editar|corregir)\b/, Pencil],
  [/^revisar\b/, ClipboardCheck],
  [/^recontratar\b/, UserPlus],
  [/^dar de baja\b/, UserMinus],
  [/^cerrar\b/, Lock],
  [/^(rechazar|cancelar)\b/, X],
];

export function inferActionIcon(label: React.ReactNode): React.ReactNode {
  if (typeof label !== "string") return <Check />;
  const normalized = label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
  const match = VERB_ICONS.find(([pattern]) => pattern.test(normalized));
  const Icon = match?.[1] ?? Check;
  return <Icon />;
}

export interface DialogButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: DialogButtonTone;
  /** Muestra el indicador de trabajo en lugar del icono y bloquea el botón. */
  busy?: boolean;
  /** Icono a la izquierda del texto. */
  icon?: React.ReactNode;
}

export const DialogButton = React.forwardRef<
  HTMLButtonElement,
  DialogButtonProps
>(function DialogButton(
  {
    tone = "primary",
    busy = false,
    icon,
    disabled,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || busy}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border px-4 text-sm font-medium shadow-xs",
        "transition-colors duration-150",
        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20",
        "active:shadow-none max-md:active:scale-[0.97]",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        TONES[tone],
        className,
      )}
      {...props}
    >
      {busy ? <Loader2 className="animate-spin" /> : icon}
      {children}
    </button>
  );
});
