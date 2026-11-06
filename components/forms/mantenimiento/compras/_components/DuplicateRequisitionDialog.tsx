"use client";

import { AlertTriangle } from "lucide-react";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ActiveGeneralArticleRequisition } from "@/types/purchase";
import { ActiveRequisitionWarning } from "./ActiveRequisitionWarning";

export interface DuplicateRequisitionConflict {
  label: string;
  entries: ActiveGeneralArticleRequisition[];
}

/** Último aviso antes de repetir un pedido. Confirma, no bloquea. */
export function DuplicateRequisitionDialog({
  conflicts,
  open,
  onOpenChange,
  onConfirm,
}: {
  conflicts: DuplicateRequisitionConflict[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        className="sm:max-w-lg"
        icon={AlertTriangle}
        tone="amber"
        title="¿Solicitar de todos modos?"
        description={
          conflicts.length === 1
            ? "Este artículo ya fue solicitado y su requisición sigue abierta."
            : "Estos artículos ya fueron solicitados y sus requisiciones siguen abiertas."
        }
        footer={
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Revisar
            </Button>
            <Button onClick={onConfirm}>Solicitar igual</Button>
          </>
        }
      >
        <ScrollArea className={conflicts.length > 3 ? "h-70 pr-3" : ""}>
          <div className="flex flex-col gap-3">
            {conflicts.map((conflict) => (
              <div key={conflict.label} className="flex flex-col gap-1.5">
                <p className="text-sm font-medium">{conflict.label}</p>
                <ActiveRequisitionWarning entries={conflict.entries} />
              </div>
            ))}
          </div>
        </ScrollArea>
      </FormDialogContent>
    </Dialog>
  );
}
