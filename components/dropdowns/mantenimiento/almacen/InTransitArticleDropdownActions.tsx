import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"


import { useUpdateArticleStatus } from "@/actions/mantenimiento/almacen/inventario/articulos/actions"
import { ClipboardCheck, EyeIcon, Loader2, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { Button } from "../../../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../ui/dialog"

const InTransitArticleDropdownActions = ({ id }: { id: number }) => {

  const [open, setOpen] = useState<boolean>(false)

  const { updateArticleStatus } = useUpdateArticleStatus()

  const handleStatusUpdate = async (id: number, status: string) => {
    await updateArticleStatus.mutateAsync({
      id: id,
      status: status
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
          <DialogTrigger asChild>
            <DropdownMenuItem className="cursor-pointer">
              <ClipboardCheck className='size-5' />
            </DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuItem className="cursor-pointer">
            <EyeIcon className="size-5" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">¿Articulo en recepción?</DialogTitle>
          <DialogDescription className="text-center p-2 mb-0 pb-0">
            Indique si el articulo ya se encuentra en recepción.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 md:gap-0">
          <Button className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black" onClick={() => setOpen(false)} type="submit">Cancelar</Button>
          <Button disabled={updateArticleStatus.isPending} className="hover:bg-white hover:text-black hover:border hover:border-black transition-all" onClick={() => handleStatusUpdate(id, "Reception")}>{updateArticleStatus.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Confirmar</p>}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>


  )
}

export default InTransitArticleDropdownActions
