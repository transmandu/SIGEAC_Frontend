'use client'

import { useState } from "react"
import Link from "next/link"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AvionicsControl } from "@/types"
import { MoreHorizontal, Trash2, Loader2, SquarePen } from "lucide-react"
import { useDeleteAvionicsControl } from "@/actions/mantenimiento/planificacion/control_avionica/actions"
import { useCompanyStore } from "@/stores/CompanyStore"

const iconBase = "size-[18px] transition-all duration-200 ease-out group-hover:scale-110"

const itemBase = `
  group
  relative
  flex
  items-center
  justify-center
  size-9
  rounded-xl
  transition-all
  duration-200
  ease-out
  hover:bg-muted
  hover:shadow-sm
  active:scale-95
`

const AvionicsControlDropdownActions = ({ avionicsControl }: { avionicsControl: AvionicsControl }) => {
  const [openDropdown, setOpenDropdown] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const { deleteAvionicsControl } = useDeleteAvionicsControl()
  const { selectedCompany } = useCompanyStore()

  const handleDelete = () => {
    deleteAvionicsControl.mutate({ id: avionicsControl.id, company: selectedCompany!.slug })
    setOpenDelete(false)
  }

  return (
    <TooltipProvider delayDuration={120}>
      <>
        <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-xl border border-transparent transition-all duration-200 hover:border-border/50 hover:bg-muted/70 hover:shadow-sm data-[state=open]:bg-muted"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="center"
            sideOffset={3}
            className="flex items-center justify-center gap-1.5 overflow-visible rounded-2xl border border-border/50 bg-background/90 p-1.5 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                    <Link
                      href={`/${selectedCompany?.slug}/planificacion/control_avionica/editar/${avionicsControl.id}`}
                      className={`${itemBase} text-primary`}
                    >
                      <SquarePen className={iconBase} />
                    </Link>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Editar control de aviónica</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                    <button
                      onClick={() => {
                        setOpenDropdown(false)
                        setOpenDelete(true)
                      }}
                      className={`${itemBase} text-red-600`}
                    >
                      <Trash2 className={iconBase} />
                    </button>
                  </DropdownMenuItem>
                </span>
              </TooltipTrigger>
              <TooltipContent>Eliminar control de aviónica</TooltipContent>
            </Tooltip>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">¿Seguro que desea eliminar el control de aviónica?</DialogTitle>
              <DialogDescription className="text-center p-2 mb-0 pb-0">
                Esta acción es irreversible: se elimina el control con todos sus equipos y{" "}
                <strong>todo su historial de cumplimientos registrados</strong>.
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
                disabled={deleteAvionicsControl.isPending}
                className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
                onClick={handleDelete}
              >
                {deleteAvionicsControl.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Confirmar</p>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    </TooltipProvider>
  )
}

export default AvionicsControlDropdownActions
