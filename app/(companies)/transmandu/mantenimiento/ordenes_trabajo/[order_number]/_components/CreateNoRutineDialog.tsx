import CreateNoRutineForm from "@/components/forms/mantenimiento/ordenes_trabajo/CreateNoRutineForm"
import { Button } from "@/components/ui/button"
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
import { useState } from "react"

const CreateNoRutineDialog = ({ task_id }: { task_id: string }) => {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Generar - No Rutinario</Button>
      </DialogTrigger>
      <DialogContent className="m-0 p-0 max-w-[650px]">
        <CreateNoRutineForm onClose={() => setOpen(false)} id={task_id} />
      </DialogContent>
    </Dialog>
  )
}

export default CreateNoRutineDialog
