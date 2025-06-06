'use client'

import { useDeleteToolBox } from "@/actions/mantenimiento/almacen/inventario/caja_herramientas/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ToolBox } from "@/types"
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { EditToolBoxForm } from "../forms/EditToolBoxForm"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"

const ToolBoxDropdownActions = ({ id, initialData }: { id: number, initialData: ToolBox }) => {

  const [open, setOpen] = useState<boolean>(false)

  const [openEdit, setOpenEdit] = useState<boolean>(false)

  const { deleteToolBox } = useDeleteToolBox()

  const handleDelete = async (id: number) => {
    await deleteToolBox.mutateAsync(id);
    setOpen(false);
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

        <DropdownMenuContent align="center" className="flex gap-2 justify-center">
          <DropdownMenuItem onClick={() => setOpenEdit(true)} className="cursor-pointer">
            <Pencil className="size-5" />
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Trash2 onClick={() => setOpen(true)} className='size-5 text-red-500' />
          </DropdownMenuItem>
        </DropdownMenuContent>

      </DropdownMenu>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[1080px]">
          <DialogHeader>
            <DialogTitle className="text-center flex gap-2 justify-center items-center">Eliminar Caja de Herramientas</DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              ¿Desea elimiar la caja de herramientas?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 md:gap-0">
            <Button className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black" onClick={() => setOpen(false)} type="submit">Cancelar</Button>
            <Button disabled={deleteToolBox.isPending} className="hover:bg-white hover:text-black hover:border hover:border-black transition-all" onClick={() => handleDelete(id)}>{deleteToolBox.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Confirmar</p>}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="w-[380px]">
          <DialogHeader>
            <DialogTitle>Editar Caja de Herramientas</DialogTitle>
            <DialogDescription>
              Edite la caja de herramientas a su necesidad.
            </DialogDescription>
          </DialogHeader>
          <EditToolBoxForm initialData={initialData} onClose={() => setOpenEdit(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ToolBoxDropdownActions
