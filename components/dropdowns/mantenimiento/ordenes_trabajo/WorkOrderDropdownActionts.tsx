import { useDeleteWorkOrder } from "@/actions/mantenimiento/planificacion/ordenes_trabajo/actions";
import EditWorkOrderForm from "@/components/forms/mantenimiento/planificacion/ordenes_trabajo/EditWorkOrderForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkOrder } from "@/types";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReasonConfirmDialog } from "@/components/dialogs/mantenimiento/planificacion/ReasonConfirmDialog";
import { useCompanyStore } from "@/stores/CompanyStore";

const WorkOrderDropdownActions = ({
  work_order,
}: {
  work_order: WorkOrder;
}) => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);

  const { deleteWorkOrder } = useDeleteWorkOrder();
  const { selectedCompany } = useCompanyStore();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          className="flex flex-col gap-2 justify-center"
        >
          {/* Opción Editar */}
          <DropdownMenuItem
            onClick={() => setOpenEdit(true)}
            className="cursor-pointer"
          >
            <Edit className="size-5 text-blue-500" />
            <p className="pl-2">Editar</p>
          </DropdownMenuItem>

          {/* Opción Eliminar */}
          <DropdownMenuItem
            onClick={() => setOpenDelete(true)}
            className="cursor-pointer"
          >
            <Trash2 className="size-5 text-red-500" />
            <p className="pl-2">Eliminar</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog para Editar */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="flex flex-col max-w-4xl mx-2 max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              Editar Orden de Trabajo — {work_order.order_number}
            </DialogTitle>
            <DialogDescription className="text-center">
              Modifique los campos que desea actualizar y presione &quot;Guardar
              Cambios&quot;.
            </DialogDescription>
          </DialogHeader>
          <EditWorkOrderForm
            work_order={work_order}
            onClose={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>

      <ReasonConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title={`Eliminar la orden ${work_order.order_number}`}
        description="Se borra la orden con sus tareas, no rutinarias e inspección preliminar. Si respalda cumplimientos registrados en un control, no puede eliminarse."
        confirmLabel="Eliminar"
        destructive
        onConfirm={(reason) =>
          deleteWorkOrder.mutateAsync({
            id: work_order.id,
            company: selectedCompany!.slug,
            reason,
          })
        }
      />
    </>
  );
};

export default WorkOrderDropdownActions;
