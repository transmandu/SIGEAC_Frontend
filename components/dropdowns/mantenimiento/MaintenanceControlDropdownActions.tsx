'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { MaintenanceControl } from "@/types"
import { MoreHorizontal, Trash2, Loader2, SquarePen, Eye } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useDeleteMaintenanceControl } from "@/actions/mantenimiento/planificacion/control_mantenimiento/actions"
import { useCompanyStore } from "@/stores/CompanyStore"

interface MaintenanceControlDropdownActionsProps {
  maintenanceControl: MaintenanceControl
}

const MaintenanceControlDropdownActions = ({ maintenanceControl }: MaintenanceControlDropdownActionsProps) => {
  const [openDelete, setOpenDelete] = useState<boolean>(false)
  const { deleteMaintenanceControl } = useDeleteMaintenanceControl();
  const { selectedCompany } = useCompanyStore();

  const handleDelete = () => {
    deleteMaintenanceControl.mutate({ id: maintenanceControl.id, company: selectedCompany!.slug })
    setOpenDelete(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="flex-col gap-2 justify-center">
          <DropdownMenuItem asChild>
            <Link href={`/${selectedCompany?.slug}/planificacion/control_mantenimiento/${maintenanceControl.id}`}>
              <Eye className="size-5" />
              <p className="pl-2">Ver Detalle</p>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${selectedCompany?.slug}/planificacion/control_mantenimiento/editar/${maintenanceControl.id}`}>
              <SquarePen className="size-5" />
              <p className="pl-2">Editar</p>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            <Trash2 className='size-5 text-red-500' />
            <p className="pl-2">Eliminar</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar el control de mantenimiento?
            </DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y estaría eliminando por completo el control seleccionado, junto con sus certificados, servicios y partes asociadas.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
            <Button
              className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
              onClick={() => setOpenDelete(false)}
              type="button"
            >
              Cancelar
            </Button>

            <Button
              disabled={deleteMaintenanceControl.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={handleDelete}
            >
              {deleteMaintenanceControl.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MaintenanceControlDropdownActions
