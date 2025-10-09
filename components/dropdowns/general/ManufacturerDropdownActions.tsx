import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"


import { useDeleteManufacturer, useUpdateManufacturer } from "@/actions/general/fabricantes/actions"
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog"
import { Manufacturer } from "@/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCompanyStore } from "@/stores/CompanyStore"

const ManufacturerDropdownActions = ({ manufacturer }: { manufacturer: Manufacturer }) => {

  const [openDelete, setOpenDelete] = useState<boolean>(false)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const { selectedCompany } = useCompanyStore()

  const { deleteManufacturer } = useDeleteManufacturer()
  const { updateManufacturer } = useUpdateManufacturer()

  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    name: manufacturer.name,
    description: manufacturer.description,
    type: manufacturer.type
  })

  const handleDelete = async (id: number | string) => {
    await deleteManufacturer.mutateAsync(id);
    setOpenDelete(false);
  }

  const handleUpdate = async () => {
    await updateManufacturer.mutateAsync({
      company: selectedCompany?.slug,
      id: manufacturer.id,
      data: formData
    });
    setOpenEdit(false);
  }

  return (
    <>
      {/* Dialog de Editar */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Editar Fabricante</DialogTitle>
            <DialogDescription className="text-center">
              Modifique la información del fabricante
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del fabricante"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AIRCRAFT">Aeronave</SelectItem>
                  <SelectItem value="ENGINE">Motor</SelectItem>
                  <SelectItem value="APU">APU</SelectItem>
                  <SelectItem value="PROPELLER">Hélice</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 md:gap-0">
            <Button variant="outline" onClick={() => setOpenEdit(false)}>Cancelar</Button>
            <Button 
              disabled={updateManufacturer.isPending} 
              onClick={handleUpdate}
            >
              {updateManufacturer.isPending ? <Loader2 className="size-4 animate-spin" /> : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Eliminar */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">¿Seguro que desea eliminar este fabricante?</DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y estaría eliminando por completo el fabricante seleccionado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 md:gap-0">
            <Button className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black" onClick={() => setOpenDelete(false)} type="submit">Cancelar</Button>
            <Button disabled={deleteManufacturer.isPending} className="hover:bg-white hover:text-black hover:border hover:border-black transition-all" onClick={() => handleDelete(manufacturer.id)}>{deleteManufacturer.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Confirmar</p>}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="flex gap-2 justify-center">
          <DropdownMenuItem className="cursor-pointer" onClick={() => setOpenEdit(true)}>
            <Pencil className='size-5 text-blue-500' />
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => setOpenDelete(true)}>
            <Trash2 className='size-5 text-red-500' />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default ManufacturerDropdownActions
