"use client";

import { FormSection } from "@/components/forms/mantenimiento/planificacion/_theme";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCanViewPlanificationAudit } from "@/hooks/mantenimiento/planificacion/useCanViewPlanificationAudit";
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

/** Todo lo que se hizo sobre un registro, para quienes pueden ver la auditoría. */
export function RecordAuditHistory({
  subjectType,
  subjectId,
  filename,
}: RecordAuditHistoryProps) {
  const canView = useCanViewPlanificationAudit();
  const { selectedCompany } = useCompanyStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const filters = useMemo(
    () => ({ subject_type: subjectType, subject_id: subjectId }),
    [subjectType, subjectId],
  );

  if (!canView) return null;

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
    <FormSection
      icon={History}
      title="Historial de auditoría"
      hint="Altas, correcciones, bajas y documentos emitidos, con su motivo."
      action={
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-primary"
              onClick={handleDownload}
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
            Descargar el historial completo, con la verificación de la cadena
          </TooltipContent>
        </Tooltip>
      }
    >
      <OperationList
        filters={filters}
        perPage={10}
        emptyLabel="Sin movimientos registrados"
      />
    </FormSection>
  );
}
