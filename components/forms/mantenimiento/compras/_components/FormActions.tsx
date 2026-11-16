"use client";

import type { ReactNode } from "react";

import { useInFormDialog } from "@/components/dialogs/shared/FormDialogContent";
import { cn } from "@/lib/utils";

/**
 * Acciones de los formularios de compras. Dentro de un diálogo hacen de pie
 * fijo (siempre a la vista mientras el formulario desplaza), con la misma
 * franja que el resto de los diálogos del sistema; fuera de uno, quedan al
 * final del formulario.
 */
export default function FormActions({ children }: { children: ReactNode }) {
  const inDialog = useInFormDialog();

  return (
    <div
      data-dialog-actions={inDialog ? "" : undefined}
      className={cn(
        "flex items-center justify-end gap-2 border-t pt-4 max-sm:flex-col-reverse max-sm:items-stretch max-sm:[&>button]:w-full",
        inDialog &&
          "sticky bottom-0 z-10 -mx-4 mt-1 bg-linear-to-t from-slate-50 to-background px-4 py-3 max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:-mx-6 sm:px-6 sm:py-4 dark:from-slate-900/40",
      )}
    >
      {children}
    </div>
  );
}
