"use client";

import { useState, type ReactNode } from "react";
import {
  ChevronDown,
  ClipboardList,
  Eye,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CATEGORY_LABELS,
  MSG3_TYPE_LABELS,
  STATUS_LABELS,
} from "@/lib/maintenanceCatalogLabels";
import { cn } from "@/lib/utils";
import type { CatalogService, CatalogTask } from "@/types/maintenanceCatalog";
import { formatIntervals } from "./catalog-format";
import { ItemActions } from "./ItemActions";

const MAX_AIRCRAFT_BADGES = 4;

const CardField = ({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) => (
  <span className={cn("flex min-w-0 flex-col gap-0.5", className)}>
    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
    <span className="wrap-break-word text-xs font-semibold">{children}</span>
  </span>
);

const cardClass =
  "rounded-xl border border-slate-400/40 bg-linear-to-br from-background/70 to-background/40 shadow-sm backdrop-blur-md dark:border-slate-600/40";

interface ServiceCardProps {
  service: CatalogService;
  canManage: boolean;
  /** Eliminar un servicio es saneamiento de datos: solo el SUPERUSER. */
  canDelete: boolean;
  onDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onNewTask: () => void;
  onTaskDetails: (task: CatalogTask) => void;
  onTaskEdit: (task: CatalogTask) => void;
  onTaskDelete: (task: CatalogTask) => void;
}

export function ServiceCard({
  service,
  canManage,
  canDelete,
  onDetails,
  onEdit,
  onDelete,
  onNewTask,
  onTaskDetails,
  onTaskEdit,
  onTaskDelete,
}: ServiceCardProps) {
  const [open, setOpen] = useState(false);
  const tasks = service.tasks ?? [];
  const aircrafts = service.aircrafts ?? [];
  const shownAircrafts = aircrafts.slice(0, MAX_AIRCRAFT_BADGES);
  const CategoryIcon =
    service.category === "CERTIFICATE" ? ShieldCheck : Wrench;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={cardClass}>
      <div className="flex items-start gap-1 p-3">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            aria-label={open ? "Contraer tareas" : "Ver tareas"}
            className="flex min-w-0 flex-1 items-start gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CategoryIcon className="size-4" />
            </span>

            <span className="flex min-w-0 flex-1 flex-col gap-2.5">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="min-w-0 wrap-break-word text-sm font-semibold leading-snug">
                  {service.name}
                </span>
                <Badge
                  variant={
                    service.category === "CERTIFICATE" ? "secondary" : "outline"
                  }
                  className="text-[10px]"
                >
                  {CATEGORY_LABELS[service.category]}
                </Badge>
                {service.status === "SUPERSEDED" && (
                  <Badge variant="secondary" className="text-[10px]">
                    {STATUS_LABELS.SUPERSEDED}
                  </Badge>
                )}
              </span>

              {/* Solo lo primordial: el resto (código, descripción, requisitos,
                  auditoría) vive en "Ver detalles". */}
              <span className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-[minmax(0,2fr)_auto_minmax(0,2fr)]">
                <CardField label="Intervalo">
                  {service.intervals.length > 0 ? (
                    formatIntervals(service.intervals)
                  ) : (
                    <span className="font-normal text-muted-foreground">
                      Sin intervalo
                    </span>
                  )}
                </CardField>
                <CardField label="Tareas">{tasks.length}</CardField>
                <CardField
                  label="Aplica a"
                  className="col-span-2 sm:col-span-1"
                >
                  {aircrafts.length > 0 ? (
                    <span className="flex flex-wrap gap-1">
                      {shownAircrafts.map((aircraft) => (
                        <span
                          key={aircraft.id}
                          className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold"
                        >
                          {aircraft.acronym}
                        </span>
                      ))}
                      {aircrafts.length > shownAircrafts.length && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                          +{aircrafts.length - shownAircrafts.length}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="font-normal text-muted-foreground">
                      Sin aeronaves
                    </span>
                  )}
                </CardField>
              </span>
            </span>

            <ChevronDown
              className={cn(
                "mt-2.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </button>
        </CollapsibleTrigger>

        <ItemActions
          label={`Acciones de ${service.name}`}
          actions={[
            { label: "Ver detalles", icon: Eye, onSelect: onDetails },
            {
              label: "Editar servicio",
              icon: Pencil,
              onSelect: onEdit,
              tone: "primary",
              hidden: !canManage,
            },
            {
              label: "Eliminar servicio",
              icon: Trash2,
              onSelect: onDelete,
              tone: "danger",
              hidden: !canDelete,
            },
          ]}
        />
      </div>

      <CollapsibleContent>
        <div className="flex flex-col gap-2 border-t border-slate-400/30 p-3 dark:border-slate-600/30">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-400/40 py-6 text-center dark:border-slate-600/40">
              <ClipboardList className="size-5 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">
                Sin tareas registradas todavía.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-start gap-2 rounded-lg bg-muted/30 py-2 pl-3 pr-1"
                >
                  <ClipboardList className="mt-1 size-3.5 shrink-0 text-muted-foreground/70" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="wrap-break-word text-sm font-medium">
                      {task.description}
                    </p>
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span>{MSG3_TYPE_LABELS[task.msg3_type]}</span>
                      {task.ata && <span>· ATA {task.ata}</span>}
                      {task.estimated_man_hours != null && (
                        <span>· {task.estimated_man_hours} H-H</span>
                      )}
                      {task.required_skill && (
                        <span>· {task.required_skill}</span>
                      )}
                      {task.requirements.length > 0 && (
                        <span>
                          · {task.requirements.length}{" "}
                          {task.requirements.length === 1
                            ? "requisito"
                            : "requisitos"}
                        </span>
                      )}
                    </p>
                  </div>
                  <ItemActions
                    label={`Acciones de la tarea ${task.description}`}
                    actions={[
                      {
                        label: "Ver detalles",
                        icon: Eye,
                        onSelect: () => onTaskDetails(task),
                      },
                      {
                        label: "Editar tarea",
                        icon: Pencil,
                        onSelect: () => onTaskEdit(task),
                        tone: "primary",
                        hidden: !canManage,
                      },
                      {
                        label: "Eliminar tarea",
                        icon: Trash2,
                        onSelect: () => onTaskDelete(task),
                        tone: "danger",
                        hidden: !canManage,
                      },
                    ]}
                  />
                </li>
              ))}
            </ul>
          )}

          {canManage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onNewTask}
              className="self-start rounded-lg"
            >
              <Plus className="mr-2 size-4" />
              Nueva Tarea
            </Button>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
