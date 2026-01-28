'use client'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Convertion } from "@/types"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface DialogProps {
  articles?: {
    description?: string,
    serial?: string,
    dispatch_quantity: string | number,
    part_number?: string,
    article_id?: string | number,
    unit?: string,
  }[],
  work_order?: string,
}
const DispatchArticlesDialog = ({ articles, work_order }: DialogProps) => {
  return (
    <Dialog>
      <DialogTrigger className="text-center">
        <Button variant='ghost'>Ver Articulos</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="mx-auto w-full max-w-md">
          <DialogHeader className="flex flex-row justify-between items-center">
            <div className="flex flex-col gap-1">
              <DialogTitle>Articulos para WO: {work_order ? work_order : "N/A"}</DialogTitle>
              <DialogDescription>Aquí puede ver los articulos despachados.</DialogDescription>
            </div>
            <Image src={'/LOGO_TRD.png'} className="w-[70px] h-[70px]" width={70} height={70} alt="logo" />
          </DialogHeader>
          <div className="p-4 pb-0">
            <div className="flex flex-col items-center gap-2 p-2">
              {
                articles && articles.map((article) => (
                  <div key={article.article_id} className="w-[200px] group cursor-pointer" >
                    {article.description} - Cantidad: {article.dispatch_quantity  ?? "1"} {article.unit ? article.unit : ""}
                  </div>
                ))
              }
            </div>
          </div>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DispatchArticlesDialog;
