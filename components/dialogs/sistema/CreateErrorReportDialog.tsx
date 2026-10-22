"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import CreateErrorReportForm from "@/components/forms/sistema/CreateErrorReportForm";
import type { ErrorReportDraft } from "@/stores/ErrorReportDraftStore";

interface CreateErrorReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Muestra severidad y código HTTP, solo disponibles para el superuser desde el panel de gestión. */
  showAdvancedFields?: boolean;
  /** Reporte que nace de un aviso de error: llega con el contexto ya cargado. */
  draft?: ErrorReportDraft;
}

export default function CreateErrorReportDialog({
  open,
  onOpenChange,
  showAdvancedFields = false,
  draft,
}: CreateErrorReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl border-slate-200/80 p-0 sm:max-w-140 dark:border-slate-800/80">
        <CreateErrorReportForm
          onClose={() => onOpenChange(false)}
          showAdvancedFields={showAdvancedFields}
          draft={draft}
        />
      </DialogContent>
    </Dialog>
  );
}
