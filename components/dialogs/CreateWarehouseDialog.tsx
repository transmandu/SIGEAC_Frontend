import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import CreateRoleForm from "../forms/general/CreateRoleForm"
import { Button } from "../ui/button"
import CreateWarehouseForm from "../forms/ajustes/CreateWarehouseForm"

const CreateWarehouseDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Crear</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Creación de Almacén</DialogTitle>
          <DialogDescription>
            Cree un almácen rellenando los datos necesarios.
          </DialogDescription>
        </DialogHeader>
        <CreateWarehouseForm />
      </DialogContent>
    </Dialog>
  )
}

export default CreateWarehouseDialog
