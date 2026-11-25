"use client";

import { History } from "lucide-react";
import { useState } from "react";

import { ToolBoxHistoryDialog } from "@/components/dialogs/almacen/MovementHistoryDialog";
import { Button } from "@/components/ui/button";

/** Abre el historial de una caja desde su fila del listado. */
export function ToolBoxHistoryButton({
  toolBoxId,
  name,
}: {
  toolBoxId: number;
  name: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Historial de ${name}`}
        title="Historial"
        onClick={() => setOpen(true)}
      >
        <History className="size-4" />
      </Button>
      <ToolBoxHistoryDialog
        toolBoxId={open ? toolBoxId : null}
        onOpenChange={(next) => !next && setOpen(false)}
      />
    </>
  );
}
