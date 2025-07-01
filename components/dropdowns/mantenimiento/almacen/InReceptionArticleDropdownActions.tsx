'use client'

import { useUpdateArticleStatus } from "@/actions/mantenimiento/almacen/inventario/articulos/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Biohazard, ClipboardCheck, Loader2, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { Button } from "../../../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../ui/dialog"
import { useRouter } from "next/navigation"

const InReceptionDropdownActions = ({ id }: { id: number }) => {

  const [open, setOpen] = useState<boolean>(false)

  const router = useRouter()

  const { updateArticleStatus } = useUpdateArticleStatus()

  const handleUpdateToReception = async (id: number, status: string) => {
    await updateArticleStatus.mutateAsync({
      id,
      status,
    });
    setOpen(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="flex gap-2 justify-center">
          <DropdownMenuItem onClick={() => router.push(`/hangar74/almacen/ingreso/confirmar_ingreso/${id}`)} className="cursor-pointer">
            <ClipboardCheck className="size-5" />
          </DropdownMenuItem>
          <DialogTrigger asChild>
            <DropdownMenuItem className="cursor-pointer">
              <Biohazard className='size-5' />
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className="w-[1080px]">
        <DialogHeader>
          <DialogTitle className="text-center flex gap-2 justify-center items-center">Enviar a Cuarentena <Biohazard /></DialogTitle>
          <DialogDescription className="text-center p-2 mb-0 pb-0">
            Indique si el articulo debe ir a cuarentena.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 md:gap-0">
          <Button className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black" onClick={() => setOpen(false)} type="submit">Cancelar</Button>
          <Button disabled={updateArticleStatus.isPending} className="hover:bg-white hover:text-black hover:border hover:border-black transition-all" onClick={() => handleUpdateToReception(id, "Quarentine")}>{updateArticleStatus.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Confirmar</p>}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default InReceptionDropdownActions
