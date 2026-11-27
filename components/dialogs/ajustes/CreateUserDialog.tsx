import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { CreateUserForm } from "@/components/forms/ajustes/CreateUserForm"
import { useActionDialog } from "@/hooks/helpers/use-action-dialog";

export function CreateUserDialog() {
  const [open, setOpen] = useActionDialog("crear-usuario");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className="flex items-center justify-center gap-2 h-8 border-dashed"
        >
          Crear
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-137.5">
        <DialogHeader>
          <DialogTitle>Creación de Usuario</DialogTitle>
          <DialogDescription>
            Cree un usuario rellenando los campos necesarios.
          </DialogDescription>
        </DialogHeader>
        <CreateUserForm />
      </DialogContent>
    </Dialog>
  );
}
