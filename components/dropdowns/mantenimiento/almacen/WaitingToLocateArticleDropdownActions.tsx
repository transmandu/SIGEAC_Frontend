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
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const WaitingToLocateArticleDropdownActions = ({
  id,
  zone: suggestedZone,
}: {
  id: number
  zone?: string | null
}) => {
  const [open, setOpen] = useState<boolean>(false)
  const { locateArticle } = useLocateArticle()
  const [zone, setZone] = useState<string>("")

  // La zona se recarga al abrir, no al montar: la fila puede refrescarse
  // mientras la tabla sigue montada y el valor inicial quedaría viejo.
  const handleOpenChange = (next: boolean) => {
    if (next) setZone(suggestedZone ?? "")
    setOpen(next)
  }

  const handleLocate = async (id: number) => {
    const trimmedZone = zone.trim()

    if (!trimmedZone) {
      toast.error("Ingrese una zona de almacén válida.")
      return
    }

    await locateArticle.mutateAsync({
      id: id,
      zone: trimmedZone,
    });
    setOpen(false);
    setZone("");
  }
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
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
            {suggestedZone
              ? "Confirme o corrija la zona registrada durante la recepción."
              : "Indique la ubicación del articulo en el almacén."}
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
          {suggestedZone && (
            <p className="text-xs text-muted-foreground italic">
              Zona propuesta en recepción: {suggestedZone}
            </p>
          )}
        </div>
        <DialogFooter className="flex flex-col gap-2 md:gap-0">
          <Button className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black" onClick={() => setOpen(false)} type="submit">Cancelar</Button>
          <Button disabled={locateArticle.isPending || !zone.trim()} className="hover:bg-white hover:text-black hover:border hover:border-black transition-all" onClick={() => handleLocate(id)}>{locateArticle.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Confirmar</p>}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>


  )
}

export default WaitingToLocateArticleDropdownActions
