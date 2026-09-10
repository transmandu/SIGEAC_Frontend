"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { SectionTitle } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { TaskFieldsEditor, emptyTask } from "@/components/forms/mantenimiento/catalogo/TaskFieldsEditor";
import { toTaskFormData } from "@/lib/maintenanceCatalogForm";
import { CatalogTask } from "@/types/maintenanceCatalog";
import {
  TaskFormData,
  useCreateCatalogTask,
  useUpdateCatalogTask,
} from "@/actions/mantenimiento/catalogo/tareas/actions";
import { useCompanyStore } from "@/stores/CompanyStore";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: number;
  task?: CatalogTask;
}

export function TaskDialog({ open, onOpenChange, serviceId, task }: TaskDialogProps) {
  const { selectedCompany } = useCompanyStore();
  const { createCatalogTask } = useCreateCatalogTask();
  const { updateCatalogTask } = useUpdateCatalogTask();
  const [form, setForm] = useState<TaskFormData>(emptyTask);

  useEffect(() => {
    if (!open) return;
    setForm(task ? toTaskFormData(task) : emptyTask);
  }, [open, task]);

  const isPending = createCatalogTask.isPending || updateCatalogTask.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany?.slug) return;

    // Solo se cierra si guardó: ante un error el toast ya avisa y los
    // requisitos cargados deben seguir en pantalla para corregirlos.
    try {
      if (task) {
        await updateCatalogTask.mutateAsync({
          serviceId,
          taskId: task.id,
          data: form,
          company: selectedCompany.slug,
        });
      } else {
        await createCatalogTask.mutateAsync({ serviceId, data: form, company: selectedCompany.slug });
      }
      onOpenChange(false);
    } catch {
      // El hook de la mutación ya notificó el fallo.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle asChild>
            <SectionTitle
              icon={ClipboardList}
              title={task ? "Editar Tarea" : "Nueva Tarea"}
              hint="Tipificada con la taxonomía MSG-3 del programa de mantenimiento."
            />
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto px-1 py-1">
          <TaskFieldsEditor value={form} onChange={setForm} />

          <DialogFooter>
            <ActionTriggerButton type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {task ? "Guardar Cambios" : "Crear Tarea"}
            </ActionTriggerButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
