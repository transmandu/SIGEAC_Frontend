"use client";

import {
  CreateControlWorkOrderDialog,
  type CreatedWorkOrder,
} from "@/components/dialogs/mantenimiento/planificacion/CreateControlWorkOrderDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FilePlus2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface WorkOrderRef {
  id?: number | string;
  order_number: string;
  status?: string;
}

interface WorkOrderCellProps {
  company: string;
  aircraftId: number | string;
  /** Qué atiende la orden: "ítem «Inspección de 100 h»". Alimenta el diálogo. */
  subject: string;
  /** Lo mismo en limpio, para la descripción de la tarea de la orden. */
  taskDescription: string;
  /** La del último cumplimiento registrado. */
  previous?: WorkOrderRef | null;
  /** La que está atendiendo el próximo cumplimiento, si ya se abrió. */
  current?: WorkOrderRef | null;
  /** Ata al ítem la orden recién creada (su endpoint pending-work-order). */
  onWorkOrderCreated: (workOrder: CreatedWorkOrder) => Promise<unknown>;
  /** Control o ítem dado de baja: se muestran las OT, pero no se crean nuevas. */
  readOnly?: boolean;
}

function WorkOrderLink({
  company,
  workOrder,
  className,
}: {
  company: string;
  workOrder: WorkOrderRef;
  className?: string;
}) {
  return (
    <Link
      href={`/${company}/planificacion/ordenes_trabajo/${workOrder.order_number}`}
      className={cn("block truncate hover:underline", className)}
    >
      {workOrder.order_number}
    </Link>
  );
}

/**
 * La columna de Orden de Trabajo de los cuatro controles.
 *
 * Dos campos etiquetados en orden cronológico: "OT Anterior" (la del último
 * cumplimiento, normalmente ya cerrada) y "OT en Curso" (la que atenderá el
 * próximo). Van etiquetados porque dos números sueltos no dicen cuál es cuál,
 * y la fila necesita leerse de un vistazo como pasado → presente.
 *
 * Sin orden en curso, ese segundo campo ofrece crearla en el acto: el trabajo
 * se programa antes de que el ítem apremie, y esa orden queda atada al ítem
 * para precargarse al registrar su cumplimiento.
 */
export function WorkOrderCell({
  company,
  aircraftId,
  subject,
  taskDescription,
  previous,
  current,
  onWorkOrderCreated,
  readOnly = false,
}: WorkOrderCellProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linking, setLinking] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Una orden cerrada ya no está atendiendo nada: cuenta como historia, no
  // como trabajo en curso, y la fila vuelve a poder abrir una nueva.
  const openCurrent =
    current && current.status !== "CLOSED" ? current : undefined;

  // La misma orden en los dos lugares (se registró el cumplimiento y la orden
  // sigue abierta) se muestra una sola vez, como la anterior.
  const showPrevious =
    previous && previous.order_number !== openCurrent?.order_number
      ? previous
      : undefined;

  const handleCreated = async (workOrder: CreatedWorkOrder) => {
    setLinking(true);
    try {
      await onWorkOrderCreated(workOrder);
    } finally {
      // Solo si la celda sigue montada: al atar la orden se invalida la query
      // del control y la fila se vuelve a renderizar, así que este `finally`
      // puede caer después de que esta instancia dejó de existir.
      if (mountedRef.current) setLinking(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {/* Orden cronológico: lo que ya se hizo arriba, lo que viene abajo. */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
          OT Anterior
        </p>
        {showPrevious ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <WorkOrderLink
                company={company}
                workOrder={showPrevious}
                className="text-xs text-muted-foreground"
              />
            </TooltipTrigger>
            <TooltipContent>
              Orden del cumplimiento anterior de este ítem.
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-xs text-muted-foreground/60">—</span>
        )}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
          OT en Curso
        </p>
        {openCurrent ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <WorkOrderLink
                company={company}
                workOrder={openCurrent}
                className="text-xs font-medium text-primary"
              />
            </TooltipTrigger>
            <TooltipContent>
              Orden abierta para el próximo cumplimiento de este ítem.
            </TooltipContent>
          </Tooltip>
        ) : readOnly ? (
          <span className="text-xs text-muted-foreground/60">—</span>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-1.5 h-6 w-fit gap-1 px-1.5 text-xs text-muted-foreground hover:text-primary"
                disabled={linking}
                onClick={() => setDialogOpen(true)}
              >
                {linking ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <FilePlus2 className="size-3.5" />
                )}
                Crear OT
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Crear la Orden de Trabajo del próximo cumplimiento
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {!readOnly && (
        <CreateControlWorkOrderDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          aircraftId={aircraftId}
          subject={subject}
          taskDescription={taskDescription}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
