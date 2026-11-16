"use client";

import { Loader2 } from "lucide-react";

import { useInFormDialog } from "@/components/dialogs/shared/FormDialogContent";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Marco común de los formularios de artículo: cuerpo y acciones.
 *
 * Sin encabezado a propósito: el título lo pone la página o el diálogo que
 * monta el formulario, que es quien sabe en qué flujo está el usuario.
 */
export const ArticleFormShell = ({
  busy,
  canSave,
  isEditing,
  submitLabel,
  onCancel,
  /** Presente cuando el contexto monta el botón en el pie de un diálogo. */
  hideActions,
  /** El botón abre una vista previa en vez de guardar: el rótulo lo anuncia. */
  opensPreview,
  submitTourId,
  onSubmit,
  formRef,
  className,
  children,
}: {
  busy?: boolean;
  canSave?: boolean;
  isEditing?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
  hideActions?: boolean;
  opensPreview?: boolean;
  /** `data-tour` del botón de guardar, para los tours que lo señalan. */
  submitTourId?: string;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  formRef?: React.Ref<HTMLFormElement>;
  /** Para que el formulario llene un contenedor con altura limitada (diálogos con una lista que desplaza). */
  className?: string;
  children: React.ReactNode;
}) => {
  const inDialog = useInFormDialog();

  return (
    <form
      ref={formRef}
      className={cn(
        "flex flex-col gap-5",
        // El cuerpo del diálogo no debe poder desplazarse más allá del último
        // elemento del formulario: lo que sobresale por abajo (elementos ocultos
        // o con transformaciones) no cuenta como contenido.
        inDialog && "overflow-y-clip",
        className,
      )}
      onSubmit={onSubmit}
    >
      {children}

      {!hideActions && (
        <div
          data-dialog-actions={inDialog ? "" : undefined}
          className={cn(
            "flex justify-end gap-3 border-t pt-4 max-sm:flex-col-reverse max-sm:[&>button]:w-full",
            // En un diálogo las acciones son el pie: ancho completo del cuerpo y
            // fijas abajo mientras el formulario se desplaza.
            inDialog &&
              "sticky bottom-0 z-10 -mx-4 mt-1 bg-linear-to-t from-slate-50 to-background px-4 py-3 max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:-mx-6 sm:px-6 sm:py-4 dark:from-slate-900/40",
          )}
        >
          {onCancel && (
            <Button
              type="button"
              variant={inDialog ? "outline" : "ghost"}
              onClick={onCancel}
              disabled={busy}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={busy || !canSave}
            className="min-w-42.5"
            data-tour={submitTourId}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              (submitLabel ??
              (opensPreview
                ? isEditing
                  ? "Revisar cambios"
                  : "Revisar y registrar"
                : isEditing
                  ? "Guardar cambios"
                  : "Registrar"))
            )}
          </Button>
        </div>
      )}
    </form>
  );
};
