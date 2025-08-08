import CreatePlanificationEventForm from "@/components/forms/mantenimiento/planificacion/CreatePlanificationEventForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type CreatePlanificationEventDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: string;
};

const CreatePlanificationEventDialog = ({open, onOpenChange, selectedDate}: CreatePlanificationEventDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Creación de Evento</DialogTitle>
          <DialogDescription>
            {selectedDate ? `Crear evento para: ${format(selectedDate, "PPP", {locale: es})}` : "Creando nuevo evento."}
          </DialogDescription>
        </DialogHeader>
        <CreatePlanificationEventForm date={selectedDate} onClose={onOpenChange} />
      </DialogContent>
    </Dialog>
  )
}

export default CreatePlanificationEventDialog
