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
import { FlightControl } from "@/types"
import { MoreHorizontal, SquarePen, Trash2, Loader2 } from "lucide-react"
import { useState } from "react"
import CreateFlightControlForm from "@/components/forms/mantenimiento/ordenes_trabajo/CreateFlightControlForm"

interface FlightControlDropdownActionsProps {
  flightControl: FlightControl
}

const FlightControlDropdownActions = ({ flightControl }: FlightControlDropdownActionsProps) => {
  const [open, setOpen] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [openDelete, setOpenDelete] = useState<boolean>(false)

  const handleDelete = () => {
    // TODO: Implementar eliminación
    console.log('Eliminar vuelo:', flightControl.id)
    setOpenDelete(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="flex-col gap-2 justify-center">
            <DropdownMenuItem onClick={() => setOpenDelete(true)}>
              <Trash2 className='size-5 text-red-500' />
              <p className="pl-2">Eliminar</p>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpenEdit(true)}>
              <SquarePen className="size-5" />
              <p className="pl-2">Editar</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* DIALOGO DE ELIMINAR */}
        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">
                ¿Seguro que desea eliminar el vuelo?
              </DialogTitle>
              <DialogDescription className="text-center p-2 mb-0 pb-0">
                Esta acción es irreversible y estaría eliminando por completo el vuelo seleccionado.
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
                className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
                onClick={handleDelete}
              >
                <p>Confirmar</p>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOGO DE EDITAR */}
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent className="sm:max-w-[420px] md:max-w-[650px]">
            <DialogHeader>
              <DialogTitle>Edición de Vuelo</DialogTitle>
              <DialogDescription>
                Edite el vuelo modificando la información necesaria.
              </DialogDescription>
            </DialogHeader>
            <CreateFlightControlForm 
              onClose={() => setOpenEdit(false)} 
              flightData={{
                id: flightControl.id.toString(),
                flight_number: flightControl.flight_number,
                aircraft_operator: flightControl.aircraft_operator,
                origin: flightControl.origin,
                destination: flightControl.destination,
                flight_date: flightControl.flight_date,
                flight_hours: flightControl.flight_hours,
                flight_cycles: flightControl.flight_cycles,
                aircraft_id: flightControl.aircraft.id.toString(),
              }}
            />
          </DialogContent>
        </Dialog>
      </Dialog>
    </>
  )
}

export default FlightControlDropdownActions

