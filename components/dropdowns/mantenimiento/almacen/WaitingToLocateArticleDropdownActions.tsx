import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"


import { useLocateArticle } from "@/actions/mantenimiento/almacen/inventario/articulos/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, MoreHorizontal, PackageSearch } from "lucide-react"
import { useState } from "react"
import { Button } from "../../../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../ui/dialog"

const WaitingToLocateArticleDropdownActions = ({ id }: { id: number }) => {
  const [open, setOpen] = useState<boolean>(false)
  const { locateArticle } = useLocateArticle()
  const [zone, setZone] = useState<string>("")
  const handleLocate = async (id: number) => {
    await locateArticle.mutateAsync({
      id: id,
      zone: zone,
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
              <PackageSearch className='size-5' />
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Ubicar articulo en almacén</DialogTitle>
          <DialogDescription className="text-center p-2 mb-0 pb-0">
            Indique la ubicación del articulo en el almacén.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 ">
          <Label htmlFor="zone">
            Zona de Almacén
          </Label>
          <Input
            id="zone"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            placeholder="Ingrese la zona de almacén"
          />
        </div>
        <DialogFooter className="flex flex-col gap-2 md:gap-0">
          <Button className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black" onClick={() => setOpen(false)} type="submit">Cancelar</Button>
          <Button disabled={locateArticle.isPending} className="hover:bg-white hover:text-black hover:border hover:border-black transition-all" onClick={() => handleLocate(id, "Located")}>{locateArticle.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Confirmar</p>}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>


  )
}

export default WaitingToLocateArticleDropdownActions
