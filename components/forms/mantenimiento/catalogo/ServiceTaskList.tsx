"use client";

import { useState } from "react";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { FormSection } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { TaskDialog } from "@/components/dialogs/mantenimiento/catalogo/TaskDialog";
import { useDeleteCatalogTask } from "@/actions/mantenimiento/catalogo/tareas/actions";
import { MSG3_TYPE_LABELS, REQUIREMENT_TYPE_LABELS } from "@/lib/maintenanceCatalogLabels";
import { CatalogService, CatalogTask } from "@/types/maintenanceCatalog";
import { useCompanyStore } from "@/stores/CompanyStore";

/**
 * Las tareas de un servicio, editables. Es la misma lista en el detalle del
 * servicio y en su página de tareas: antes el detalle mostraba una versión
 * recortada (sin H-H ni especialidad) que obligaba a saltar a la otra página
 * para cualquier cambio.
 */
export function ServiceTaskList({ service }: { service: CatalogService }) {
  const { selectedCompany } = useCompanyStore();
  const { deleteCatalogTask } = useDeleteCatalogTask();

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CatalogTask | undefined>();
  const [deletingTask, setDeletingTask] = useState<CatalogTask | undefined>();

  const tasks = service.tasks ?? [];

  return (
    <>
      <FormSection
        icon={ClipboardList}
        title="Tareas"
        hint="Las tareas que se ejecutan cuando este servicio genera una orden de trabajo."
        action={
          <ActionTriggerButton
            type="button"
            onClick={() => {
              setEditingTask(undefined);
              setTaskDialogOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            Nueva Tarea
          </ActionTriggerButton>
        }
      >
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-400/40 py-10 text-center dark:border-slate-600/40">
            <ClipboardList className="size-6 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">Sin tareas registradas todavía.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-400/40 bg-gradient-to-br from-background/70 to-background/40 p-3.5 shadow-sm backdrop-blur-md dark:border-slate-600/40"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {MSG3_TYPE_LABELS[task.msg3_type]}
                    </span>
                    {task.ata && <span className="text-xs text-muted-foreground">ATA {task.ata}</span>}
                    {task.estimated_man_hours != null && (
                      <span className="text-xs text-muted-foreground">{task.estimated_man_hours} H-H</span>
                    )}
                    {task.required_skill && (
                      <span className="text-xs text-muted-foreground">· {task.required_skill}</span>
                    )}
                  </div>
                  <p className="text-sm font-medium">{task.description}</p>
                  {task.requirements.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Requisitos:{" "}
                      {task.requirements
                        .map((r) => {
                          const qty = r.quantity != null ? `${r.quantity}${r.unit ? ` ${r.unit.label}` : ""} ` : "";
                          return `${qty}${r.description} (${REQUIREMENT_TYPE_LABELS[r.requirement_type]})`;
                        })
                        .join(", ")}
                    </p>
                  )}
                </div>

                <TooltipProvider disableHoverableContent>
                  <div className="flex shrink-0 items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          onClick={() => {
                            setEditingTask(task);
                            setTaskDialogOpen(true);
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeletingTask(task)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Eliminar</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            ))}
          </div>
        )}
      </FormSection>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        serviceId={service.id}
        task={editingTask}
      />

      <AlertDialog open={!!deletingTask} onOpenChange={(open) => !open && setDeletingTask(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{deletingTask?.description}&quot; y sus requisitos. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deletingTask || !selectedCompany?.slug) return;
                deleteCatalogTask.mutate({
                  serviceId: service.id,
                  taskId: deletingTask.id,
                  company: selectedCompany.slug,
                });
                setDeletingTask(undefined);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
