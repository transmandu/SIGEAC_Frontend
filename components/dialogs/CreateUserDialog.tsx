import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { CreateUserForm } from "../forms/ajustes/CreateUserForm"

export function CreateUserDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Crear</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Creación de Usuario</DialogTitle>
          <DialogDescription>
            Cree un usuario rellenando los campos necesarios.
          </DialogDescription>
        </DialogHeader>
        <CreateUserForm />
      </DialogContent>
    </Dialog>
  )
}
