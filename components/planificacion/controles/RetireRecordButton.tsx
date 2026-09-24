"use client";

import {
  ControlRecordType,
  useRestoreControlRecord,
  useRetireControlRecord,
} from "@/actions/mantenimiento/planificacion/control_bajas/actions";
import { ReasonConfirmDialog } from "@/components/dialogs/mantenimiento/planificacion/ReasonConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Archive, ArchiveRestore } from "lucide-react";
import { useState } from "react";

interface RecordActionProps {
  recordType: ControlRecordType;
  recordId: number;
  /** "servicio «Inspección de 100 h»", "equipo GTN 750"... */
  subject: string;
}

export function RetireRecordButton({
  recordType,
  recordId,
  subject,
}: RecordActionProps) {
  const [open, setOpen] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { retireControlRecord } = useRetireControlRecord();

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-amber-700"
            onClick={() => setOpen(true)}
          >
            <Archive className="size-4" />
            <span className="sr-only">Dar de baja</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Dar de baja</TooltipContent>
      </Tooltip>

      <ReasonConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Dar de baja"
        description={
          <>
            El {subject} sale del cálculo, de las alertas y del calendario. Su
            historial de cumplimientos se conserva y puede reactivarse después.
          </>
        }
        confirmLabel="Dar de baja"
        onConfirm={(reason) =>
          retireControlRecord.mutateAsync({
            company: selectedCompany!.slug,
            type: recordType,
            id: recordId,
            reason,
          })
        }
      />
    </>
  );
}

export function RestoreRecordButton({
  recordType,
  recordId,
  subject,
}: RecordActionProps) {
  const [open, setOpen] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { restoreControlRecord } = useRestoreControlRecord();

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 gap-1.5 text-xs"
        onClick={() => setOpen(true)}
      >
        <ArchiveRestore className="size-3.5" />
        Reactivar
      </Button>

      <ReasonConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Reactivar"
        description={
          <>El {subject} vuelve al cálculo, a las alertas y al calendario.</>
        }
        confirmLabel="Reactivar"
        onConfirm={(reason) =>
          restoreControlRecord.mutateAsync({
            company: selectedCompany!.slug,
            type: recordType,
            id: recordId,
            reason,
          })
        }
      />
    </>
  );
}
