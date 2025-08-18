import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { UserPen } from "lucide-react"
import { EditUserForm } from "@/components/forms/ajustes/EditUserForm"
import { User } from "@/types"
import { useState } from "react"

export function EditUserDialog({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="hover:scale-110 transition-all ease-in duration-100"><UserPen className="size-5" /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edición de Usuario</DialogTitle>
          <DialogDescription>
            Ingrese sus nueva información para finalizar la edición.
          </DialogDescription>
        </DialogHeader>
        <EditUserForm user={user} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
