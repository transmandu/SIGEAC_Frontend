"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { useVerifyPlanificationAudit } from "@/hooks/mantenimiento/planificacion/useVerifyPlanificationAudit";
import { formatInstant } from "@/lib/date";
import { downloadAuditExcel } from "@/lib/planificacion/auditExport";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { PlanificationAuditFilters } from "@/types/planification/audit";
import {
  FileSpreadsheet,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * La cadena de hash se verifica bajo pedido: recalcula todas las entradas.
 * Todas las noches la verifica también planification:audit-verify.
 */
export function IntegrityCheck() {
  const verify = useVerifyPlanificationAudit();
  const timeZone = useCompanyTimezone();
  const result = verify.data;

  const Icon = verify.isPending
    ? Loader2
    : !result
      ? ShieldQuestion
      : result.ok
        ? ShieldCheck
        : ShieldAlert;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => !verify.isPending && verify.mutate()}
          className={cn(
            "h-9 gap-1.5 text-xs",
            result?.ok &&
              "border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
            result && !result.ok && "border-destructive/50 text-destructive",
          )}
        >
          <Icon
            className={cn("size-3.5", verify.isPending && "animate-spin")}
          />
          {!result
            ? "Verificar integridad"
            : result.ok
              ? `Íntegra · ${result.checked} entradas`
              : `Alterada en la entrada ${result.broken_at}`}
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        {!result
          ? "Recalcula la cadena de hash para detectar entradas alteradas o borradas."
          : result.ok
            ? `Verificada el ${formatInstant(result.verified_at, timeZone)}. Ninguna entrada fue alterada ni borrada.`
            : result.reason}
      </TooltipContent>
    </Tooltip>
  );
}

export function ExportExcelButton({
  filters,
}: {
  filters: PlanificationAuditFilters;
}) {
  const { selectedCompany } = useCompanyStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await downloadAuditExcel(selectedCompany!.slug, filters);
    } catch (error) {
      toast.error("Oops!", {
        description: "No se pudo exportar la auditoría.",
      });
      console.log(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-xs"
          onClick={handleExport}
        >
          {isExporting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <FileSpreadsheet className="size-3.5" />
          )}
          Excel
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Exportar el período y módulo elegidos, una fila por campo cambiado
      </TooltipContent>
    </Tooltip>
  );
}
