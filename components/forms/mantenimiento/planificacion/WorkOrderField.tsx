"use client";

import {
  CreateControlWorkOrderDialog,
  type CreatedWorkOrder,
} from "@/components/dialogs/mantenimiento/planificacion/CreateControlWorkOrderDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetWorkOrdersByAircraft } from "@/hooks/mantenimiento/planificacion/useGetWorkOrdersByAircraft";
import { useCompanyStore } from "@/stores/CompanyStore";
import { FilePlus2 } from "lucide-react";
import { useMemo, useState } from "react";
import { SearchableSelect, hintClass, labelClass } from "./_theme";

interface WorkOrderFieldProps {
  value?: string;
  onChange: (workOrderId: string) => void;
  aircraftId: number | string;
  /** Qué atiende la orden; alimenta la cabecera del diálogo de creación. */
  subject: string;
  /** Lo mismo en limpio, para la descripción de la tarea de la orden. */
  taskDescription: string;
  /** OT ya atada al ítem: se avisa que viene precargada. */
  pendingWorkOrder?: { id: number | string; order_number: string } | null;
  /** Aclaración propia del control, bajo el campo. */
  hint?: string;
  /** false cuando la orden es obligatoria (cerrar un cumplimiento). */
  optional?: boolean;
}

/**
 * Selector de Orden de Trabajo del formulario de cumplimiento.
 *
 * Lista solo las órdenes ABIERTAS de la aeronave: una cerrada ya no puede
 * recibir el trabajo de un cumplimiento que se está registrando ahora, y
 * ofrecerlas llenaba el desplegable de historia inservible. La excepción es la
 * que ya está seleccionada, que se muestra siempre para no "perder" en
 * silencio un valor que el usuario ve en el campo.
 *
 * Si la orden no existe todavía se crea desde acá, sin cerrar el formulario de
 * cumplimiento ni perder lo escrito: es el caso de un cumplimiento que se
 * registra sin que nadie haya abierto antes su orden.
 */
export function WorkOrderField({
  value,
  onChange,
  aircraftId,
  subject,
  taskDescription,
  pendingWorkOrder,
  hint,
  optional = true,
}: WorkOrderFieldProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { data: workOrders, isLoading } = useGetWorkOrdersByAircraft(
    selectedCompany?.slug,
    aircraftId,
  );

  const options = useMemo(
    () =>
      (workOrders ?? [])
        .filter((wo) => wo.status !== "CLOSED" || String(wo.id) === value)
        .map((wo) => ({ ...wo, name: wo.order_number })),
    [workOrders, value],
  );

  return (
    <>
      <FormItem className="w-full">
        <FormLabel className={labelClass}>
          Orden de Trabajo
          {optional && (
            <span className="text-xs text-muted-foreground"> (Opcional)</span>
          )}
        </FormLabel>

        {pendingWorkOrder && (
          <p className="text-xs text-muted-foreground">
            Precargada la OT {pendingWorkOrder.order_number}, abierta para
            resolver este ítem.
          </p>
        )}

        <div className="flex items-center gap-1">
          <SearchableSelect
            options={options}
            value={value}
            loading={isLoading}
            placeholder={
              options.length
                ? "Seleccione..."
                : "Sin Órdenes de Trabajo abiertas"
            }
            searchPlaceholder="Buscar orden de trabajo..."
            emptyLabel="No se encontró ninguna orden de trabajo abierta."
            onSelect={(wo) => onChange(String(wo.id))}
            renderLabel={(wo) => (
              <span className="flex items-center gap-2">
                {wo.order_number}
                <Badge variant="outline" className="text-[10px]">
                  {wo.status}
                </Badge>
              </span>
            )}
          />

          <TooltipProvider disableHoverableContent>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground hover:text-primary"
                  onClick={() => setDialogOpen(true)}
                >
                  <FilePlus2 className="size-3.5" />
                  <span className="sr-only">Crear Orden de Trabajo</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Crear una Orden de Trabajo nueva para este cumplimiento
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {hint && (
          <FormDescription className={hintClass}>{hint}</FormDescription>
        )}

        <FormMessage />
      </FormItem>

      {/* Fuera del FormItem: es un formulario propio, y anidarlo en el campo
          de otro formulario mezcla los dos contextos de react-hook-form. */}
      <CreateControlWorkOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        aircraftId={aircraftId}
        subject={subject}
        taskDescription={taskDescription}
        // Queda seleccionada al instante: el usuario pidió crearla justamente
        // para usarla en este cumplimiento.
        onCreated={(created: CreatedWorkOrder) => onChange(String(created.id))}
      />
    </>
  );
}
