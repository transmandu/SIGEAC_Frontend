"use client";

import { useState } from "react";
import { BookOpen, ChevronLeft, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGetCatalogServices } from "@/hooks/mantenimiento/catalogo/useGetCatalogServices";
import { useGetCatalogService } from "@/hooks/mantenimiento/catalogo/useGetCatalogService";
import { CATEGORY_LABELS, COUNTING_METHOD_LABELS, MSG3_TYPE_LABELS } from "@/lib/maintenanceCatalogLabels";
import { CatalogCategory, CatalogService, CatalogTask } from "@/types/maintenanceCatalog";
import { useCompanyStore } from "@/stores/CompanyStore";

interface CatalogServicePickerProps {
  aircraftId?: string | number;
  category?: CatalogCategory;
  trigger?: React.ReactNode;
  /** Modo "servicio": seleccionar un servicio/certificado completo (Control de Mantenimiento). */
  onSelectService?: (service: CatalogService) => void;
  /** Modo "tarea": navega a las tareas de un servicio y selecciona una (Órdenes de Trabajo). */
  onSelectTask?: (task: CatalogTask, service: CatalogService) => void;
}

/**
 * Selector del catálogo de mantenimiento, reutilizado en el formulario de
 * Control de Mantenimiento (modo servicio) y en el alta de tareas de Órdenes
 * de Trabajo (modo tarea) — evita que el usuario tipee a mano lo que ya está
 * declarado en el catálogo. Sin aeronave seleccionada no hay nada que
 * mostrar, así que el botón no se renderiza en vez de aparecer deshabilitado.
 */
export function CatalogServicePicker({
  aircraftId,
  category,
  trigger,
  onSelectService,
  onSelectTask,
}: CatalogServicePickerProps) {
  const { selectedCompany } = useCompanyStore();
  const [open, setOpen] = useState(false);
  const [drillServiceId, setDrillServiceId] = useState<number | null>(null);

  const { data: services = [], isLoading } = useGetCatalogServices(selectedCompany?.slug, {
    aircraftId,
    category,
  });
  const { data: drillService, isLoading: isDrillLoading } = useGetCatalogService(
    selectedCompany?.slug,
    drillServiceId ?? undefined,
  );

  if (!aircraftId) return null;

  const handleSelectService = (service: CatalogService) => {
    if (onSelectTask) {
      setDrillServiceId(service.id);
      return;
    }
    onSelectService?.(service);
    setOpen(false);
  };

  const handleSelectTask = (task: CatalogTask) => {
    if (!drillService) return;
    onSelectTask?.(task, drillService);
    setOpen(false);
    setDrillServiceId(null);
  };

  return (
    <>
      <TooltipProvider disableHoverableContent>
        <Tooltip>
          <TooltipTrigger asChild>
            {trigger ?? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setOpen(true)}
              >
                <BookOpen className="size-4" />
              </Button>
            )}
          </TooltipTrigger>
          <TooltipContent>Elegir del catálogo de mantenimiento</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setDrillServiceId(null);
        }}
      >
        <DialogContent className="flex max-h-[75vh] flex-col sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {drillServiceId && (
                <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => setDrillServiceId(null)}>
                  <ChevronLeft className="size-4" />
                </Button>
              )}
              {drillServiceId ? drillService?.name ?? "Tareas" : "Catálogo de Mantenimiento"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 space-y-2 overflow-y-auto px-1 py-1">
            {!drillServiceId ? (
              isLoading ? (
                <p className="p-4 text-center text-sm text-muted-foreground">Cargando...</p>
              ) : services.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  Esta aeronave no tiene servicios/certificados asignados en el catálogo.
                </p>
              ) : (
                services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleSelectService(service)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-400/40 bg-gradient-to-br from-background/70 to-background/40 p-3 text-left backdrop-blur-md transition-colors hover:border-primary/40 dark:border-slate-600/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {CATEGORY_LABELS[service.category]}
                        {service.manual ? ` · ${service.manual.name}` : ""}
                        {service.counting_method
                          ? ` · ${service.interval_value} ${COUNTING_METHOD_LABELS[service.counting_method]}`
                          : ""}
                      </p>
                    </div>
                    {onSelectTask && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {service.tasks_count ?? 0} tarea(s)
                      </span>
                    )}
                  </button>
                ))
              )
            ) : isDrillLoading || !drillService ? (
              <p className="p-4 text-center text-sm text-muted-foreground">Cargando...</p>
            ) : drillService.tasks?.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">Este servicio no tiene tareas registradas.</p>
            ) : (
              drillService.tasks?.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => handleSelectTask(task)}
                  className="flex w-full items-start gap-2 rounded-lg border border-slate-400/40 bg-gradient-to-br from-background/70 to-background/40 p-3 text-left backdrop-blur-md transition-colors hover:border-primary/40 dark:border-slate-600/40"
                >
                  <ClipboardList className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {MSG3_TYPE_LABELS[task.msg3_type]}
                      {task.ata ? ` · ATA ${task.ata}` : ""}
                    </p>
                    <p className="text-sm font-medium">{task.description}</p>
                    {task.requirements.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {task.requirements.length} requisito(s)
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
