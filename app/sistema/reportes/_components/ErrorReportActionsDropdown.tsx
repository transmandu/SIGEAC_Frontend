"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, MoreHorizontal, Trash2 } from "lucide-react";
import { ErrorReport } from "@/types";
import { useDeleteErrorReport, useMarkErrorReportDuplicate, useSetErrorReportInProgress } from "@/actions/sistema/reportes/actions";
import ResolveErrorReportDialog from "./ResolveErrorReportDialog";
import ConfirmErrorReportActionDialog from "./ConfirmErrorReportActionDialog";

export default function ErrorReportActionsDropdown({ report }: { report: ErrorReport }) {
  const [resolveOpen, setResolveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);

  const { setErrorReportInProgress } = useSetErrorReportInProgress();
  const { deleteErrorReport } = useDeleteErrorReport();
  const { markErrorReportDuplicate } = useMarkErrorReportDuplicate();

  const isClosed = report.status === "RESOLVED";

  const handleDelete = async () => {
    try {
      await deleteErrorReport.mutateAsync(report.id);
    } catch {
      return;
    }
    setDeleteOpen(false);
  };

  const handleDuplicate = async () => {
    try {
      await markErrorReportDuplicate.mutateAsync(report.id);
    } catch {
      return;
    }
    setDuplicateOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {report.status === "OPEN" && (
            <DropdownMenuItem
              onClick={() => setErrorReportInProgress.mutate(report.id)}
              disabled={setErrorReportInProgress.isPending}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Tomar
            </DropdownMenuItem>
          )}
          {!isClosed && (
            <DropdownMenuItem onClick={() => setResolveOpen(true)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Resolver
            </DropdownMenuItem>
          )}
          {!isClosed && (
            <DropdownMenuItem onClick={() => setDuplicateOpen(true)}>
              <Copy className="mr-2 h-4 w-4" />
              Marcar duplicado
            </DropdownMenuItem>
          )}
          {/* El superuser puede eliminar el reporte sin importar su estatus. */}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ResolveErrorReportDialog
        open={resolveOpen}
        onOpenChange={setResolveOpen}
        report={report}
      />

      <ConfirmErrorReportActionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar reporte"
        description="Esta acción elimina el reporte permanentemente. No se puede deshacer."
        confirmLabel="Eliminar"
        isPending={deleteErrorReport.isPending}
        onConfirm={handleDelete}
      />

      <ConfirmErrorReportActionDialog
        open={duplicateOpen}
        onOpenChange={setDuplicateOpen}
        title="Marcar como duplicado"
        description="Esta acción marca el reporte como un duplicado de otro ya existente."
        confirmLabel="Marcar duplicado"
        isPending={markErrorReportDuplicate.isPending}
        onConfirm={handleDuplicate}
      />
    </>
  );
}
