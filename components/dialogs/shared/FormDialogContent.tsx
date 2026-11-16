"use client";

import {
  createContext,
  useContext,
  type ComponentProps,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";

import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Molde de los diálogos de formulario y de detalle: cabecera con recuadro de
 * icono sobre un degradado, cuerpo desplazable y pie con borde. Es la regla
 * visual de todo el sistema para ese tipo de diálogo; las confirmaciones
 * (eliminar, suspender…) usan `ConfirmDeleteDialog` / `ConfirmActionDialog`.
 */

const InFormDialogContext = createContext(false);

/** Los formularios lo leen para poner sus acciones en el pie del diálogo. */
export const useInFormDialog = () => useContext(InFormDialogContext);

const TONES = {
  primary: "bg-primary/10 text-primary",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
} as const;

export type FormDialogTone = keyof typeof TONES;

/**
 * En móvil los diálogos ocupan toda la pantalla: sin márgenes ni esquinas, para
 * que no queden bordes sobrantes a los lados. Desde `sm` (tablet y escritorio)
 * no aplica nada de esto. El diálogo base de `ui/dialog` no lo hace por sí
 * mismo porque lo usan pantallas que todavía no se migraron; cada diálogo lo
 * pide con esta clase.
 */
export const fullScreenOnMobile =
  "max-sm:inset-0 max-sm:h-dvh max-sm:max-h-none! max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:border-0";

/** Margen lateral común a cabecera, cuerpo y pie. */
export const dialogPane = "px-4 sm:px-6";

interface FormDialogHeaderProps {
  icon?: LucideIcon;
  /** Reemplaza al icono cuando este cambia con el estado (llave → escudo). */
  iconNode?: ReactNode;
  tone?: FormDialogTone;
  title: ReactNode;
  description?: ReactNode;
  /** `data-tour` de la cabecera, para los tours que la señalan. */
  tourId?: string;
}

export function FormDialogHeader({
  icon: Icon,
  iconNode,
  tone = "primary",
  title,
  description,
  tourId,
}: FormDialogHeaderProps) {
  return (
    <div
      data-tour={tourId}
      className={cn(
        dialogPane,
        "shrink-0 border-b bg-linear-to-b from-slate-50 to-background pb-4 pt-5 max-sm:pt-[max(1.25rem,env(safe-area-inset-top))] sm:pt-6 dark:from-slate-900/40",
      )}
    >
      <div className="flex items-start gap-3 pr-6">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
            TONES[tone],
          )}
        >
          {iconNode ?? (Icon && <Icon className="size-5" />)}
        </span>

        <div className="min-w-0 space-y-1">
          <DialogTitle className="text-lg font-semibold leading-snug tracking-tight">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm">
              {description}
            </DialogDescription>
          )}
        </div>
      </div>
    </div>
  );
}

export function FormDialogBody({
  fill = false,
  className,
  children,
}: {
  /** El contenido administra su propio desplazamiento (listas con altura fija). */
  fill?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        dialogPane,
        "min-h-0 flex-1 py-5",
        // `sticky` se pega al borde del contenido, no al del cuerpo: con
        // relleno abajo el pie quedaba a 20 px del borde y por esa franja se
        // veía el contenido desplazándose. Sin relleno, queda al ras.
        "has-data-dialog-actions:pb-0",
        fill ? "flex flex-col" : "overflow-y-auto overscroll-contain",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FormDialogFooter({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        dialogPane,
        "flex shrink-0 items-center justify-end gap-2 border-t bg-linear-to-t from-slate-50 to-background py-3 max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:py-4 max-sm:[&>button]:flex-1 dark:from-slate-900/40",
        className,
      )}
    >
      {children}
    </div>
  );
}

type FormDialogContentProps = Omit<
  ComponentProps<typeof DialogContent>,
  "title"
> &
  FormDialogHeaderProps & {
    /** Pie fijo; los formularios con `ArticleFormShell` ya traen el suyo. */
    footer?: ReactNode;
    /** Ver `FormDialogBody`. Con una lista que desplaza, pasar una altura fija en `className`. */
    fill?: boolean;
    /** Un clic fuera no cierra el diálogo (lo escrito no se recupera). */
    lockOutside?: boolean;
  };

export function FormDialogContent({
  icon,
  iconNode,
  tone,
  title,
  description,
  tourId,
  footer,
  fill = false,
  lockOutside = true,
  className,
  onInteractOutside,
  children,
  ...props
}: FormDialogContentProps) {
  return (
    <DialogContent
      className={cn(
        "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0",
        fullScreenOnMobile,
        className,
      )}
      onInteractOutside={(event) => {
        if (lockOutside) event.preventDefault();
        onInteractOutside?.(event);
      }}
      // Sin descripción Radix avisa de que falta `aria-describedby`.
      {...(description ? {} : { "aria-describedby": undefined })}
      {...props}
    >
      <InFormDialogContext.Provider value>
        <FormDialogHeader
          icon={icon}
          iconNode={iconNode}
          tone={tone}
          title={title}
          description={description}
          tourId={tourId}
        />
        <FormDialogBody fill={fill}>{children}</FormDialogBody>
        {footer && <FormDialogFooter>{footer}</FormDialogFooter>}
      </InFormDialogContext.Provider>
    </DialogContent>
  );
}
