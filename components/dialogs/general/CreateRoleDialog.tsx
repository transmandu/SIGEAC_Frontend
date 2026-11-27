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
import CreateRoleForm from "@/components/forms/general/CreateRoleForm"
import { useActionDialog } from "@/hooks/helpers/use-action-dialog"

export function CreateRoleDialog() {

  const [open, setOpen] = useActionDialog("crear-rol");

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
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Creación de Rol</DialogTitle>
          <DialogDescription>
            Cree un rol colocando el nombre.
          </DialogDescription>
        </DialogHeader>
        <CreateRoleForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
