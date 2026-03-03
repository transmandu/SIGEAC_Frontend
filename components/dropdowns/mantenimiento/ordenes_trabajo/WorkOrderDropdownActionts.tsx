import { useDeleteWorkOrder } from "@/actions/mantenimiento/planificacion/ordenes_trabajo/actions"
import EditWorkOrderForm from "@/components/forms/mantenimiento/planificacion/ordenes_trabajo/EditWorkOrderForm"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { WorkOrder } from "@/types"
import { Edit, Loader2, MoreHorizontal, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "../../../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../ui/dialog"
import { useCompanyStore } from "@/stores/CompanyStore"

const WorkOrderDropdownActions = ({ work_order }: { work_order: WorkOrder }) => {

  const [openDelete, setOpenDelete] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)

  const { deleteWorkOrder } = useDeleteWorkOrder()
  const { selectedCompany } = useCompanyStore()

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkOrder.mutateAsync({id, company: selectedCompany!.slug});
    } catch (error) {
      console.log(error)
    } finally {
      setOpenDelete(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="flex flex-col gap-2 justify-center">
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
            <Trash2 className='size-5 text-red-500' />
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
              Modifique los campos que desea actualizar y presione &quot;Guardar Cambios&quot;.
            </DialogDescription>
          </DialogHeader>
          <EditWorkOrderForm
            work_order={work_order}
            onClose={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para Eliminar */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">¿Seguro que desea eliminar esta Ord. de Trabajo?</DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y estaría eliminando por completo la orden de trabajo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 md:gap-0">
            <Button className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black" onClick={() => setOpenDelete(false)} type="submit">Cancelar</Button>
            <Button disabled={deleteWorkOrder.isPending} className="hover:bg-white hover:text-black hover:border hover:border-black transition-all" onClick={() => handleDelete(work_order.id.toString())}>{deleteWorkOrder.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Confirmar</p>}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>

  )
}

export default WorkOrderDropdownActions
