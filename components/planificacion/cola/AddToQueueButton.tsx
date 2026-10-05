"use client";

import { useAddToControlQueue } from "@/actions/mantenimiento/planificacion/cola_cumplimientos/actions";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetControlQueue } from "@/hooks/mantenimiento/planificacion/useGetControlQueue";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ControlQueueType } from "@/types";
import { Check, ListPlus, Loader2 } from "lucide-react";

interface AddToQueueButtonProps {
  type: ControlQueueType;
  itemId: number;
  /** Cómo se nombra el ítem en el tooltip: "servicio «Inspección de 100 h»". */
  subject: string;
}

/**
 * Agrega el ítem a la bandeja de trabajo, desde la fila de cualquiera de los
 * cuatro controles. Lo que antes se resolvía fila por fila (una OT por ítem)
 * ahora se junta y se resuelve de una vez.
 *
 * Si el ítem ya está en la bandeja el botón lo muestra en vez de ocultarse: el
 * usuario necesita saber que esa fila ya está marcada, sobre todo al volver a
 * un control que revisó antes.
 */
export function AddToQueueButton({
  type,
  itemId,
  subject,
}: AddToQueueButtonProps) {
  const { selectedCompany } = useCompanyStore();
  const { addToControlQueue } = useAddToControlQueue();
  const { data: queue } = useGetControlQueue(selectedCompany?.slug);

  const queued = queue?.entries.some(
    (entry) => entry.type === type && entry.item_id === itemId,
  );

  if (queued) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex size-7 items-center justify-center text-emerald-600">
            <Check className="size-4" />
            <span className="sr-only">Ya está en la bandeja</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>Ya está en la bandeja de trabajo</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-primary"
          disabled={addToControlQueue.isPending}
          onClick={() =>
            addToControlQueue.mutate({
              company: selectedCompany!.slug,
              type,
              itemId,
            })
          }
        >
          {addToControlQueue.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ListPlus className="size-4" />
          )}
          <span className="sr-only">Agregar a la bandeja</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Agregar el {subject} a la bandeja de trabajo
      </TooltipContent>
    </Tooltip>
  );
}
