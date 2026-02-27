import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { UserPen } from "lucide-react"
import { EditUserForm } from "@/components/forms/ajustes/EditUserForm"
import { User } from "@/types"
import { useState } from "react"

export function EditUserDialog({ user }: { user: User }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center justify-center"
        >
          <UserPen className="size-5 text-blue-500" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edición de Usuario</DialogTitle>
          <DialogDescription>
            Ingrese su nueva información para finalizar la edición.
          </DialogDescription>
        </DialogHeader>

        <EditUserForm user={user} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}