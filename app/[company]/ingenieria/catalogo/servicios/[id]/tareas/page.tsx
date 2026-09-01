"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { sectionClass, SectionTitle } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { TaskDialog } from "@/components/dialogs/mantenimiento/catalogo/TaskDialog";
import { useGetCatalogService } from "@/hooks/mantenimiento/catalogo/useGetCatalogService";
import { useDeleteCatalogTask } from "@/actions/mantenimiento/catalogo/tareas/actions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { CATEGORY_LABELS, MSG3_TYPE_LABELS, REQUIREMENT_TYPE_LABELS } from "@/lib/maintenanceCatalogLabels";
import { CatalogTask } from "@/types/maintenanceCatalog";

const ServiceTasksPage = () => {
  const { id } = useParams<{ id: string }>();
  const { selectedCompany } = useCompanyStore();
  const { data: service, isLoading } = useGetCatalogService(selectedCompany?.slug, id);
  const { deleteCatalogTask } = useDeleteCatalogTask();

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CatalogTask | undefined>();
  const [deletingTask, setDeletingTask] = useState<CatalogTask | undefined>();

  if (isLoading || !service) return <LoadingPage />;

  return (
    <ContentLayout title={`Tareas — ${service.name}`}>
      <div className="flex flex-col gap-6">
        {/* El id intermedio se omite del rastro y la migaja final queda como
            "Tareas", que no dice de qué servicio: se renombra al servicio. */}
        <PageHeader
          currentLabel={`Tareas de ${service.name}`}
          backFallbackHref={`/${selectedCompany?.slug}/ingenieria/catalogo/servicios/${service.id}`}
        />

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-center gap-2">
            <Badge variant={service.category === "CERTIFICATE" ? "secondary" : "default"}>
              {CATEGORY_LABELS[service.category]}
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Tareas de {service.name}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Las tareas que se ejecutan cuando este servicio genera una orden de trabajo.
          </p>
        </div>

        <section className={sectionClass}>
          <SectionTitle
            icon={ClipboardList}
            title="Tareas"
            hint="Las tareas de este servicio, tipificadas con la taxonomía MSG-3."
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
          />

          {!service.tasks || service.tasks.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-400/40 py-10 text-center dark:border-slate-600/40">
              <ClipboardList className="size-6 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">Sin tareas registradas todavía.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {service.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-400/40 bg-gradient-to-br from-background/70 to-background/40 p-3.5 backdrop-blur-md shadow-sm dark:border-slate-600/40"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {MSG3_TYPE_LABELS[task.msg3_type]}
                      </span>
                      {task.ata && <span className="text-xs text-muted-foreground">ATA {task.ata}</span>}
                    </div>
                    <p className="text-sm font-medium">{task.description}</p>
                    {task.requirements.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Requisitos:{" "}
                        {task.requirements
                          .map((r) => `${r.description} (${REQUIREMENT_TYPE_LABELS[r.requirement_type]})`)
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
        </section>
      </div>

      <TaskDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} serviceId={service.id} task={editingTask} />

      <AlertDialog open={!!deletingTask} onOpenChange={(open) => !open && setDeletingTask(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{deletingTask?.description}&quot; y sus requisitos. Esta acción no se puede deshacer.
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
    </ContentLayout>
  );
};

export default ServiceTasksPage;
