"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { fullScreenOnMobile } from "@/components/dialogs/shared/FormDialogContent";
import { cn } from "@/lib/utils";
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
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-140",
          fullScreenOnMobile,
        )}
        // Lo escrito y las capturas adjuntas no se recuperan: un clic de más
        // fuera del diálogo no debe cerrarlo.
        onInteractOutside={(event) => event.preventDefault()}
      >
        <CreateErrorReportForm
          onClose={() => onOpenChange(false)}
          showAdvancedFields={showAdvancedFields}
          draft={draft}
        />
      </DialogContent>
    </Dialog>
  );
}
