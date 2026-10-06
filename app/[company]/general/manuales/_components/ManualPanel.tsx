"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  ExternalLink,
  Eye,
  FileText,
  History,
  Loader2,
  Pencil,
  Plane,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";

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
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { ManualDialog } from "@/components/dialogs/mantenimiento/catalogo/ManualDialog";
import { ManualRevisionDialog } from "@/components/dialogs/mantenimiento/catalogo/ManualRevisionDialog";
import { ServiceDialog } from "@/components/dialogs/mantenimiento/catalogo/ServiceDialog";
import { TaskDialog } from "@/components/dialogs/mantenimiento/catalogo/TaskDialog";
import { sectionClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { useDeleteCatalogManual } from "@/actions/mantenimiento/catalogo/manuales/actions";
import { useDeleteCatalogService } from "@/actions/mantenimiento/catalogo/servicios/actions";
import { useDeleteCatalogTask } from "@/actions/mantenimiento/catalogo/tareas/actions";
import { formatCalendarDate } from "@/lib/date";
import { STATUS_LABELS } from "@/lib/maintenanceCatalogLabels";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import type {
  CatalogManual,
  CatalogService,
  CatalogTask,
} from "@/types/maintenanceCatalog";
import {
  ManualDetailsDialog,
  ServiceDetailsDialog,
  TaskDetailsDialog,
} from "./DetailDialogs";
import { ItemActions } from "./ItemActions";
import type { ManualAction } from "./ManualList";
import { ServiceCard } from "./ServiceCard";

/** Lo que está abierto sobre el panel: un único diálogo a la vez. */
type Overlay =
  | { kind: "manual-details" }
  | { kind: "manual-edit" }
  | { kind: "manual-revision" }
  | { kind: "manual-delete" }
  | { kind: "service-new" }
  | { kind: "service-details"; service: CatalogService }
  | { kind: "service-edit"; service: CatalogService }
  | { kind: "service-delete"; service: CatalogService }
  | { kind: "task-new"; service: CatalogService }
  | { kind: "task-details"; task: CatalogTask }
  | { kind: "task-edit"; service: CatalogService; task: CatalogTask }
  | { kind: "task-delete"; service: CatalogService; task: CatalogTask };

type OverlayKind = Overlay["kind"];

interface ManualPanelProps {
  manual: CatalogManual | undefined;
  /**
   * Los servicios sin manual asignado. Con valor, el panel muestra ese grupo
   * en lugar de un manual: no hay datos de manual, archivo ni revisiones.
   */
  unassignedServices: CatalogService[] | null;
  isLoading: boolean;
  /** Aeronave que filtra: solo se muestran los servicios que le aplican. */
  aircraftId: number | null;
  aircraftAcronym: string | null;
  /** Con búsqueda o filtros de servicio activos: los ids que coinciden. */
  matchedIds: Set<number> | null;
  /** Búsqueda y filtros de servicios: van en el encabezado de su lista. */
  toolbar: ReactNode;
  canManage: boolean;
  isSuperuser: boolean;
  onSelectManual: (id: number) => void;
  onManualDeleted: () => void;
  /** Limpia la aeronave y los filtros de servicio. */
  onClearFilters: () => void;
  /** Acción pedida desde el menú de un manual de la lista. */
  request: { id: number; kind: ManualAction } | null;
  onRequestHandled: () => void;
}

const supportLabel = (manual: CatalogManual) =>
  manual.is_physical
    ? "Solo físico"
    : manual.file_url
      ? "Digital"
      : "Sin archivo";

export function ManualPanel({
  manual,
  unassignedServices,
  isLoading,
  aircraftId,
  aircraftAcronym,
  matchedIds,
  toolbar,
  canManage,
  isSuperuser,
  onSelectManual,
  onManualDeleted,
  onClearFilters,
  request,
  onRequestHandled,
}: ManualPanelProps) {
  const { selectedCompany } = useCompanyStore();
  const { deleteCatalogManual } = useDeleteCatalogManual();
  const { deleteCatalogService } = useDeleteCatalogService();
  const { deleteCatalogTask } = useDeleteCatalogTask();

  // `overlay` no se vacía al cerrar: el diálogo conserva sus datos hasta
  // terminar la animación de salida, y vaciarlo de golpe lo dejaría parpadear
  // sin contenido. Lo que gobierna la apertura es `visible`.
  const [overlay, setOverlayState] = useState<Overlay | null>(null);
  const [visible, setVisible] = useState(false);
  const shown = overlay;

  const setOverlay = (next: Overlay) => {
    setOverlayState(next);
    setVisible(true);
  };
  const isOpen = (kind: OverlayKind) => visible && overlay?.kind === kind;
  const close = () => setVisible(false);
  const closeOn = (kind: OverlayKind) => (open: boolean) => {
    if (!open && overlay?.kind === kind) close();
  };

  // Una acción pedida desde el menú de la lista espera a que el detalle de ese
  // manual esté cargado: los diálogos de edición y de revisión parten de él.
  useEffect(() => {
    if (!request || manual?.id !== request.id) return;
    setOverlayState({ kind: `manual-${request.kind}` });
    setVisible(true);
    onRequestHandled();
  }, [request, manual, onRequestHandled]);

  const unassigned = unassignedServices !== null;

  if (isLoading || (!manual && !unassigned)) {
    return (
      <section
        className={cn(
          sectionClass,
          "flex min-h-72 items-center justify-center lg:h-full",
        )}
      >
        {isLoading ? (
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        ) : matchedIds !== null ? (
          // Con filtros activos y sin ningún manual que coincida, la barra no
          // puede desaparecer: sin ella no habría cómo cambiar la búsqueda.
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {toolbar}
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Ningún servicio coincide con los filtros activos.
            </p>
            <button
              type="button"
              onClick={onClearFilters}
              className="text-xs font-medium text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex size-11 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
              <BookOpen className="size-5" />
            </span>
            <p className="text-sm font-medium text-muted-foreground">
              Seleccione un manual
            </p>
            <p className="text-xs text-muted-foreground/70">
              Sus servicios, certificados y tareas aparecen aquí.
            </p>
          </div>
        )}
      </section>
    );
  }

  const allServices = unassignedServices ?? manual?.services ?? [];
  const services = allServices.filter(
    (service) =>
      (aircraftId == null ||
        service.aircrafts?.some((aircraft) => aircraft.id === aircraftId)) &&
      (matchedIds === null || matchedIds.has(service.id)),
  );
  const filtering = aircraftId != null || matchedIds !== null;
  const filterNote = [
    aircraftId != null && `aplican a ${aircraftAcronym}`,
    matchedIds !== null && "coinciden con la búsqueda y los filtros",
  ]
    .filter(Boolean)
    .join(" y ");
  const canDeleteManual = canManage && (manual?.services_count ?? 0) === 0;

  // Lo que el manual declara, sumado sobre todos sus servicios (sin el filtro
  // de aeronave: es el resumen del manual, no de la vista).
  const tasksTotal = allServices.reduce(
    (sum, s) => sum + (s.tasks?.length ?? s.tasks_count ?? 0),
    0,
  );
  const aircraftsTotal = new Set(
    allServices.flatMap((s) => (s.aircrafts ?? []).map((a) => a.id)),
  ).size;
  const plural = (n: number, one: string, many: string) =>
    `${n} ${n === 1 ? one : many}`;
  const summary = manual
    ? [
        ...(manual.effective_date
          ? [
              {
                icon: CalendarDays,
                text: `Vigente desde ${formatCalendarDate(manual.effective_date)}`,
              },
            ]
          : []),
        { icon: FileText, text: supportLabel(manual) },
        {
          icon: Wrench,
          text: plural(allServices.length, "servicio", "servicios"),
        },
        { icon: ClipboardList, text: plural(tasksTotal, "tarea", "tareas") },
        {
          icon: Plane,
          text: plural(aircraftsTotal, "aeronave", "aeronaves"),
        },
      ]
    : [];
  const company = selectedCompany?.slug;

  // El detalle del manual no trae `service.manual`; el formulario lo necesita
  // para preseleccionar el manual de referencia al editar.
  const withManual = (service: CatalogService): CatalogService => ({
    ...service,
    manual: manual ?? service.manual,
  });

  return (
    <section
      className={cn(
        sectionClass,
        "flex min-w-0 flex-col gap-4 lg:h-full lg:min-h-0",
      )}
    >
      {!manual && (
        <header className="space-y-1">
          <h2 className="text-lg font-semibold leading-snug">
            Sin manual asignado
          </h2>
          <p className="text-xs text-muted-foreground">
            Servicios y certificados que aún no declaran un manual de
            referencia. Asígnelos editando cada uno.
          </p>
        </header>
      )}
      {manual && (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {/* Contexto, no protagonista: el código y la revisión ya están en la
              lista y la descripción en "Ver detalles"; aquí solo el título y
              una línea de resumen para que los servicios ocupen el panel. */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h2 className="wrap-break-word text-lg font-semibold leading-snug">
                {manual.name}
              </h2>
              <Badge
                variant={manual.status === "ACTIVE" ? "default" : "secondary"}
                className="text-[10px]"
              >
                {STATUS_LABELS[manual.status]}
              </Badge>
            </div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {summary.map(({ icon: Icon, text }) => (
                <span key={text} className="inline-flex items-center gap-1.5">
                  <Icon className="size-3.5" />
                  {text}
                </span>
              ))}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {manual.file_url && (
              <ActionTriggerButton asChild>
                <a
                  href={manual.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 size-4" />
                  Ver Archivo
                </a>
              </ActionTriggerButton>
            )}
            <ItemActions
              label={`Acciones de ${manual.name}`}
              actions={[
                {
                  label: "Ver detalles",
                  icon: Eye,
                  onSelect: () => setOverlay({ kind: "manual-details" }),
                },
                {
                  label: "Editar manual",
                  icon: Pencil,
                  tone: "primary",
                  hidden: !canManage,
                  onSelect: () => setOverlay({ kind: "manual-edit" }),
                },
                {
                  label: "Nueva revisión",
                  icon: History,
                  hidden: !canManage || manual.status !== "ACTIVE",
                  onSelect: () => setOverlay({ kind: "manual-revision" }),
                },
                {
                  // Un manual con servicios no se puede borrar (el backend lo
                  // rechaza): no se ofrece en vez de mostrarla y fallar.
                  label: "Eliminar manual",
                  icon: Trash2,
                  tone: "danger",
                  hidden: !canDeleteManual,
                  onSelect: () => setOverlay({ kind: "manual-delete" }),
                },
              ]}
            />
          </div>
        </header>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-400/30 pt-4 lg:min-h-0 lg:flex-1 dark:border-slate-600/30">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <Wrench className="size-4 text-primary" />
              Servicios y Certificados
              <span className="text-xs font-normal text-muted-foreground">
                {filtering
                  ? `${services.length} de ${allServices.length}`
                  : allServices.length}
              </span>
            </h3>
            {filtering && (
              <p className="mt-1 text-xs text-muted-foreground">
                Solo los que {filterNote}.{" "}
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="font-medium text-primary hover:underline"
                >
                  Ver todos
                </button>
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {toolbar}
            {canManage && (!manual || manual.status === "ACTIVE") && (
              <ActionTriggerButton
                type="button"
                onClick={() => setOverlay({ kind: "service-new" })}
              >
                <Plus className="mr-2 size-4" />
                Agregar Servicio
              </ActionTriggerButton>
            )}
          </div>
        </div>

        {services.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-400/40 py-10 text-center dark:border-slate-600/40">
            <Wrench className="size-6 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">
              {allServices.length === 0
                ? manual
                  ? "Ningún servicio/certificado referencia este manual."
                  : "Todos los servicios/certificados tienen manual asignado."
                : `Ningún servicio de ${manual ? "este manual" : "este grupo"} cumple con los filtros activos.`}
            </p>
          </div>
        ) : (
          // El margen negativo compensa el relleno que evita recortar la sombra
          // y el anillo de foco de las tarjetas al scrollear.
          <div className="flex flex-col gap-3 lg:-m-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:p-1">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                canManage={canManage}
                canDelete={isSuperuser}
                onDetails={() =>
                  setOverlay({ kind: "service-details", service })
                }
                onEdit={() => setOverlay({ kind: "service-edit", service })}
                onDelete={() => setOverlay({ kind: "service-delete", service })}
                onNewTask={() => setOverlay({ kind: "task-new", service })}
                onTaskDetails={(task) =>
                  setOverlay({ kind: "task-details", task })
                }
                onTaskEdit={(task) =>
                  setOverlay({ kind: "task-edit", service, task })
                }
                onTaskDelete={(task) =>
                  setOverlay({ kind: "task-delete", service, task })
                }
              />
            ))}
          </div>
        )}
      </div>

      {manual && (
        <>
          <ManualDetailsDialog
            open={isOpen("manual-details")}
            onOpenChange={closeOn("manual-details")}
            manual={manual}
            onSelectManual={onSelectManual}
          />
          <ManualDialog
            open={isOpen("manual-edit")}
            onOpenChange={closeOn("manual-edit")}
            manual={manual}
          />
          <ManualRevisionDialog
            open={isOpen("manual-revision")}
            onOpenChange={closeOn("manual-revision")}
            manual={manual}
          />
        </>
      )}
      <ServiceDialog
        open={isOpen("service-new")}
        onOpenChange={closeOn("service-new")}
        lockedManual={manual}
      />

      {shown?.kind === "service-details" && (
        <ServiceDetailsDialog
          open={isOpen("service-details")}
          onOpenChange={closeOn("service-details")}
          service={shown.service}
          manual={manual}
        />
      )}
      {shown?.kind === "service-edit" && (
        <ServiceDialog
          open={isOpen("service-edit")}
          onOpenChange={closeOn("service-edit")}
          service={withManual(shown.service)}
        />
      )}
      {shown?.kind === "task-details" && (
        <TaskDetailsDialog
          open={isOpen("task-details")}
          onOpenChange={closeOn("task-details")}
          task={shown.task}
        />
      )}
      {(shown?.kind === "task-new" || shown?.kind === "task-edit") && (
        <TaskDialog
          open={isOpen("task-new") || isOpen("task-edit")}
          onOpenChange={(open) => !open && close()}
          serviceId={shown.service.id}
          task={shown.kind === "task-edit" ? shown.task : undefined}
        />
      )}

      <AlertDialog
        open={isOpen("manual-delete")}
        onOpenChange={closeOn("manual-delete")}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este manual?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{manual?.name}&quot; y su archivo adjunto, si
              tiene. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!company || !manual) return;
                deleteCatalogManual.mutate(
                  { id: manual.id, company },
                  { onSuccess: onManualDeleted },
                );
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isOpen("service-delete")}
        onOpenChange={closeOn("service-delete")}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar este servicio/certificado?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;
              {shown?.kind === "service-delete" ? shown.service.name : ""}
              &quot; con sus tareas y requisitos. Si ya se usó en un Control de
              Mantenimiento o una Orden de Trabajo, el sistema lo rechazará: en
              ese caso márquelo como superado. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (shown?.kind !== "service-delete" || !company) return;
                deleteCatalogService.mutate({
                  id: shown.service.id,
                  company,
                });
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isOpen("task-delete")}
        onOpenChange={closeOn("task-delete")}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;
              {shown?.kind === "task-delete" ? shown.task.description : ""}
              &quot; y sus requisitos. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (shown?.kind !== "task-delete" || !company) return;
                deleteCatalogTask.mutate({
                  serviceId: shown.service.id,
                  taskId: shown.task.id,
                  company,
                });
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
