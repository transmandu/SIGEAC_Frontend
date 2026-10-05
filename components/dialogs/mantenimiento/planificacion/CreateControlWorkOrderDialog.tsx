"use client";

import NonServiceWorkOrderForm from "@/app/[company]/planificacion/ordenes_trabajo/nueva_orden_trabajo/_components/NonServiceWorkOrderForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { useCompanyStore } from "@/stores/CompanyStore";

export interface CreatedWorkOrder {
  id: number;
  order_number: string;
}

interface CreateControlWorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aircraftId: number | string;
  /** Cómo se nombra lo que atiende la orden, para la cabecera: "ítem «X»". */
  subject: string;
  /**
   * Descripción de la primera tarea, ya en limpio (sin las comillas de
   * `subject`, que es texto de interfaz y no sirve dentro de la orden).
   */
  taskDescription: string;
  /**
   * La orden recién creada. El llamador decide qué hacer con ella: atarla al
   * ítem como su OT pendiente, o seleccionarla en el formulario de
   * cumplimiento.
   */
  onCreated: (workOrder: CreatedWorkOrder) => void | Promise<void>;
}

/**
 * Crea una orden de trabajo sin salir de la pantalla, para un ítem de control.
 *
 * Monta el MISMO formulario de la página de nueva orden
 * (NonServiceWorkOrderForm, en modo `embedded`) en vez de una versión corta
 * propia: así el usuario encuentra los mismos campos, el mismo selector de
 * tareas del catálogo y las mismas validaciones, y no quedan dos formularios de
 * OT que mantener en paralelo.
 *
 * Embebido, el formulario recibe la aeronave y la tarea por props —no por query
 * params—, fija la aeronave (la orden se va a atar a un ítem de ESA máquina) y
 * al guardar devuelve la orden en vez de navegar.
 */
export function CreateControlWorkOrderDialog({
  open,
  onOpenChange,
  aircraftId,
  subject,
  taskDescription,
  onCreated,
}: CreateControlWorkOrderDialogProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: aircrafts } = useGetMaintenanceAircrafts(selectedCompany?.slug);

  const acronym = aircrafts?.find(
    (a) => a.id.toString() === String(aircraftId),
  )?.acronym;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* El formulario completo es ancho (dos columnas de datos y una grilla de
          tareas) y alto: el diálogo le da el ancho de la página y scroll
          propio, en vez de comprimirlo. */}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Crear Orden de Trabajo</DialogTitle>
          <DialogDescription>
            Para {subject}
            {acronym ? ` — ${acronym}` : ""}. Queda atada a este cumplimiento y
            se precarga al registrarlo.
          </DialogDescription>
        </DialogHeader>

        <NonServiceWorkOrderForm
          embedded
          aircraftId={String(aircraftId)}
          taskDescription={taskDescription}
          // Cerrar es responsabilidad del diálogo, no del llamador: éste solo
          // decide qué hacer con la orden. Se cierra DESPUÉS de atarla, para
          // que un fallo al vincular deje el formulario abierto con los datos.
          onCreated={async (workOrder) => {
            await onCreated(workOrder);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
