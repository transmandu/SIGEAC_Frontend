"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { ErrorReport } from "@/types";
import { ERROR_REPORT_MODULES } from "@/lib/errorReportModules";
import { useResolveErrorReport } from "@/actions/sistema/reportes/actions";
import { Chip, STATUS_CHIP } from "./errorReportChips";

interface ResolveErrorReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ErrorReport;
}

export default function ResolveErrorReportDialog({
  open,
  onOpenChange,
  report,
}: ResolveErrorReportDialogProps) {
  const [resolution, setResolution] = useState("");
  const { resolveErrorReport } = useResolveErrorReport();

  const moduleLabel =
    ERROR_REPORT_MODULES.find((m) => m.value === report.module)?.label ?? report.module;
  const statusChip = STATUS_CHIP[report.status];

  const handleSubmit = async () => {
    if (!resolution.trim()) return;
    await resolveErrorReport.mutateAsync({ id: report.id, resolution });
    setResolution("");
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!resolveErrorReport.isPending) {
          onOpenChange(next);
          if (!next) setResolution("");
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolver reporte #{report.id}</DialogTitle>
          <DialogDescription>
            Describe la solución aplicada. El reporte pasará a estatus &quot;Resuelto&quot;.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          <Chip tone={statusChip.tone}>{statusChip.label}</Chip>
          {moduleLabel && <Chip tone="indigo">{moduleLabel}</Chip>}
        </div>

        <p className="whitespace-pre-wrap rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-sm leading-relaxed dark:border-slate-800/80 dark:bg-slate-900/30">
          {report.description}
        </p>

        <div className="space-y-2">
          <Label htmlFor="resolution">Solución</Label>
          <Textarea
            id="resolution"
            className="min-h-28"
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            placeholder="Describe cómo se resolvió el reporte..."
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={resolveErrorReport.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!resolution.trim() || resolveErrorReport.isPending}
          >
            {resolveErrorReport.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Resolver"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
