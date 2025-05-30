'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { useReturnToWarehouse } from "@/hooks/mantenimiento/almacen/articulos/useReturnToWarehouse"
import { IterationCw, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ReturnWarhouseProps {
  id: number,
  serial: string,
}

export function ReturnWarehouseDialog({ serial, id }: ReturnWarhouseProps) {

  const [open, setOpen] = useState<boolean>(false);
  const { mutateAsync, isPending, isError } = useReturnToWarehouse();

  const handleUpdate = async (article_id: number) => {
    await mutateAsync(article_id);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <IterationCw className="size-6 hover:scale-110 transition-all text-center ml-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Retorno de Articulo: <span className="italic font-medium">{serial}</span></DialogTitle>
          <DialogDescription>
            Regrese el articulo devuelta al almacén.
          </DialogDescription>
        </DialogHeader>
        <h1 className="text-center text-2xl font-bold">¿Seguro que desea retornar el articulo al almacén?</h1>
        <Button onClick={() => handleUpdate(Number(id))} disabled={isPending}>
          {
            isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Retornar</p>
          }
        </Button>
        <Button onClick={() => setOpen(false)} className="bg-rose-500">Cancelar</Button>
      </DialogContent>
    </Dialog>
  )
}
