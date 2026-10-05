"use client";

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsSuperuser } from "@/hooks/helpers/useIsSuperuser";
import { downloadAuditRecordPdf } from "@/lib/planificacion/auditExport";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { AuditSubjectType } from "@/types/planification/audit";
import { FileDown, History, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { OperationList } from "./OperationList";

interface RecordAuditHistoryProps {
  subjectType: AuditSubjectType;
  subjectId: number;
  /** Nombre del PDF, sin extensión. */
  filename: string;
}

/**
 * Botón "Auditoría" de la cabecera del control (junto a Editar/Importar
 * Historial) — solo SUPERUSER. Abre en un diálogo todo lo que se hizo sobre
 * ESE registro, sin ensuciar la página del control con una sección siempre
 * visible.
 */
export function RecordAuditHistory({
  subjectType,
  subjectId,
  filename,
}: RecordAuditHistoryProps) {
  const isSuperuser = useIsSuperuser();
  const { selectedCompany } = useCompanyStore();
  const [open, setOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const filters = useMemo(
    () => ({ subject_type: subjectType, subject_id: subjectId }),
    [subjectType, subjectId],
  );

  if (!isSuperuser) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadAuditRecordPdf(
        selectedCompany!.slug,
        subjectType,
        subjectId,
        `${filename}.pdf`,
      );
    } catch (error) {
      toast.error("Oops!", {
        description: "No se pudo generar el historial en PDF.",
      });
      console.log(error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <ActionTriggerButton onClick={() => setOpen(true)}>
        <History className="mr-2 size-4" />
        Auditoría
      </ActionTriggerButton>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85vh] flex-col overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Historial de Auditoría</DialogTitle>
            <DialogDescription>
              Altas, correcciones, bajas y documentos emitidos, con su motivo.
            </DialogDescription>
          </DialogHeader>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit gap-1.5 text-xs"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <FileDown className="size-3.5" />
                )}
                Historial PDF
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Descargar el historial completo, con la verificación de la
              cadena
            </TooltipContent>
          </Tooltip>

          <OperationList
            filters={filters}
            perPage={10}
            emptyLabel="Sin movimientos registrados"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
