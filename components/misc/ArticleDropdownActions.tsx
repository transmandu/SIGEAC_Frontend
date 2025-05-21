import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"


import { useDeleteArticle } from "@/actions/almacen/inventario/articulos/actions"
import { EyeIcon, Loader2, MoreHorizontal, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"

const ArticleDropdownActions = ({ id, serial, part_number }: { id: string | number, serial: string, part_number: string }) => {

  const [open, setOpen] = useState<boolean>(false)
  const router = useRouter()
  const { deleteArticle } = useDeleteArticle()

  const handleDelete = (id: number | string) => {
    deleteArticle.mutate(id, {
      onSuccess: () => setOpen(false), // Cierra el modal solo si la eliminación fue exitosa
    });
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
              <Trash2 className='size-5 text-red-500' />
            </DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuItem className="cursor-pointer" onClick={() => {
            router.push(`/hangar74/almacen/inventario/gestion/${part_number}/${serial}`)
          }}>
            <EyeIcon className="size-5" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">¿Seguro que desea eliminar el articulo?</DialogTitle>
          <DialogDescription className="text-center p-2 mb-0 pb-0">
            Esta acción es irreversible y estaría eliminando por completo el articulo seleccionado.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 md:gap-0">
          <Button className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black" onClick={() => setOpen(false)} type="submit">Cancelar</Button>
          <Button disabled={deleteArticle.isPending} className="hover:bg-white hover:text-black hover:border hover:border-black transition-all" onClick={() => handleDelete(id)}>{deleteArticle.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Confirmar</p>}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>


  )
}

export default ArticleDropdownActions
