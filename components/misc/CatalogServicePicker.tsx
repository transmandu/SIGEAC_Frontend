"use client";

import { useMemo, useState } from "react";
import { BookOpen, ChevronLeft, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTableSearchInput } from "@/components/tables/DataTableSearchInput";
import { useGetCatalogServices } from "@/hooks/mantenimiento/catalogo/useGetCatalogServices";
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

const norm = (value: string | null | undefined) => (value ?? "").toLowerCase();

function taskMatchesSearch(task: CatalogTask, term: string): boolean {
  const haystack = [
    task.description,
    task.ata,
    task.task_number,
    task.reference,
    task.required_skill,
    MSG3_TYPE_LABELS[task.msg3_type],
    ...task.requirements.flatMap((r) => [r.part_number, r.description]),
  ];
  return haystack.some((value) => norm(value).includes(term));
}

function serviceMatchesSearch(service: CatalogService, term: string): boolean {
  const haystack = [service.name, service.code, service.manual?.name, CATEGORY_LABELS[service.category]];
  return haystack.some((value) => norm(value).includes(term));
}

/**
 * Selector del catálogo de mantenimiento, reutilizado en el formulario de
 * Control de Mantenimiento (modo servicio) y en el alta de tareas de Órdenes
 * de Trabajo (modo tarea) — evita que el usuario tipee a mano lo que ya está
 * declarado en el catálogo. Sin aeronave seleccionada no hay nada que
 * mostrar, así que el botón no se renderiza en vez de aparecer deshabilitado.
 *
 * En modo tarea trae tasks.requirements de una vez (with_tasks=1): el
 * catálogo de una aeronave es chico (decenas de servicios, no miles), así que
 * buscar por ATA/N° de parte/descripción entre TODAS las tareas de la
 * aeronave no cuesta una consulta por servicio — se filtra en el cliente.
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
  const [search, setSearch] = useState("");

  const { data: services = [], isLoading } = useGetCatalogServices(selectedCompany?.slug, {
    aircraftId,
    category,
    // El picker es de consumo: un servicio/certificado superado no debe
    // volver a seleccionarse para un nuevo control u orden de trabajo.
    status: "ACTIVE",
    withTasks: !!onSelectTask,
    // Se monta uno por fila del formulario: sin diferirlo hasta abrirlo, cada
    // fila pediría el catálogo (con sus tareas) al cargar la pantalla.
    enabled: open && !!aircraftId,
  });

  const term = search.trim().toLowerCase();

  const filteredServices = useMemo(
    () => (term ? services.filter((s) => serviceMatchesSearch(s, term)) : services),
    [services, term],
  );

  const taskMatches = useMemo(() => {
    if (!onSelectTask || !term) return [];
    return services.flatMap((service) =>
      (service.tasks ?? [])
        .filter((task) => taskMatchesSearch(task, term))
        .map((task) => ({ task, service })),
    );
  }, [services, term, onSelectTask]);

  const drillService = drillServiceId ? services.find((s) => s.id === drillServiceId) : undefined;

  if (!aircraftId) return null;

  const handleSelectService = (service: CatalogService) => {
    if (onSelectTask) {
      setDrillServiceId(service.id);
      return;
    }
    onSelectService?.(service);
    setOpen(false);
  };

  const handleSelectTask = (task: CatalogTask, service: CatalogService) => {
    onSelectTask?.(task, service);
    setOpen(false);
    setDrillServiceId(null);
    setSearch("");
  };

  const showingTaskSearch = !!onSelectTask && term.length > 0;
  const showingDrill = !!drillServiceId && !showingTaskSearch;

  return (
    <>
      <TooltipProvider disableHoverableContent>
        <Tooltip>
          {/* El onClick va en el envoltorio y no en el botón por defecto: un
              `trigger` propio no tiene por qué traer el suyo para abrir. */}
          <TooltipTrigger asChild>
            <span className="inline-flex" onClick={() => setOpen(true)}>
              {trigger ?? (
                <Button type="button" variant="ghost" size="icon" className="size-8">
                  <BookOpen className="size-4" />
                </Button>
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent>Elegir del catálogo de mantenimiento</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setDrillServiceId(null);
            setSearch("");
          }
        }}
      >
        <DialogContent className="flex max-h-[75vh] flex-col sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {showingDrill && (
                <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => setDrillServiceId(null)}>
                  <ChevronLeft className="size-4" />
                </Button>
              )}
              {showingDrill ? drillService?.name ?? "Tareas" : "Catálogo de Mantenimiento"}
            </DialogTitle>
          </DialogHeader>

          <DataTableSearchInput
            value={search}
            onChange={setSearch}
            placeholder={
              onSelectTask ? "Buscar por ATA, N° de parte, descripción..." : "Buscar servicio o certificado..."
            }
          />

          <div className="flex-1 space-y-2 overflow-y-auto px-1 py-1">
            {isLoading ? (
              <p className="p-4 text-center text-sm text-muted-foreground">Cargando...</p>
            ) : showingTaskSearch ? (
              taskMatches.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  Ninguna tarea de esta aeronave coincide con &quot;{search}&quot;.
                </p>
              ) : (
                taskMatches.map(({ task, service }) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleSelectTask(task, service)}
                    className="flex w-full items-start gap-2 rounded-lg border border-slate-400/40 bg-gradient-to-br from-background/70 to-background/40 p-3 text-left backdrop-blur-md transition-colors hover:border-primary/40 dark:border-slate-600/40"
                  >
                    <ClipboardList className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {service.name}
                        {" · "}
                        {MSG3_TYPE_LABELS[task.msg3_type]}
                        {task.ata ? ` · ATA ${task.ata}` : ""}
                        {task.estimated_man_hours != null ? ` · ${task.estimated_man_hours} H-H` : ""}
                      </p>
                      <p className="text-sm font-medium">{task.description}</p>
                      {task.requirements.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {task.requirements
                            .map((r) => `${r.part_number ? `${r.part_number} — ` : ""}${r.description}`)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )
            ) : !drillServiceId ? (
              filteredServices.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  {term
                    ? `Ningún servicio/certificado coincide con "${search}".`
                    : "Esta aeronave no tiene servicios/certificados asignados en el catálogo."}
                </p>
              ) : (
                filteredServices.map((service) => (
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
                        {(service.tasks ?? []).length || service.tasks_count || 0} tarea(s)
                      </span>
                    )}
                  </button>
                ))
              )
            ) : !drillService || drillService.tasks?.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">Este servicio no tiene tareas registradas.</p>
            ) : (
              drillService.tasks?.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => handleSelectTask(task, drillService)}
                  className="flex w-full items-start gap-2 rounded-lg border border-slate-400/40 bg-gradient-to-br from-background/70 to-background/40 p-3 text-left backdrop-blur-md transition-colors hover:border-primary/40 dark:border-slate-600/40"
                >
                  <ClipboardList className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {MSG3_TYPE_LABELS[task.msg3_type]}
                      {task.ata ? ` · ATA ${task.ata}` : ""}
                      {task.estimated_man_hours != null ? ` · ${task.estimated_man_hours} H-H` : ""}
                      {task.required_skill ? ` · ${task.required_skill}` : ""}
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
