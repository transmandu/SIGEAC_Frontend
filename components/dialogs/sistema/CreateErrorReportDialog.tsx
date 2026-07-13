"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateErrorReportForm from "@/components/forms/sistema/CreateErrorReportForm";

interface CreateErrorReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Muestra severidad y código HTTP, solo disponibles para el superuser desde el panel de gestión. */
  showAdvancedFields?: boolean;
}

export default function CreateErrorReportDialog({
  open,
  onOpenChange,
  showAdvancedFields = false,
}: CreateErrorReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Reportar un problema o sugerencia</DialogTitle>
          <DialogDescription>
            Cuéntanos qué error encontraste o qué te gustaría que mejoráramos en SIGEAC.
          </DialogDescription>
        </DialogHeader>
        <CreateErrorReportForm onClose={() => onOpenChange(false)} showAdvancedFields={showAdvancedFields} />
      </DialogContent>
    </Dialog>
  );
}
