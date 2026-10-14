"use client";

import type { ReactNode } from "react";
import {
  BookMarked,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Cpu,
  Droplets,
  ExternalLink,
  GraduationCap,
  Hash,
  History,
  Hourglass,
  Link2,
  Package,
  Plane,
  Repeat,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCalendarDate } from "@/lib/date";
import {
  CATEGORY_LABELS,
  MSG3_TYPE_LABELS,
  REQUIREMENT_TYPE_LABELS,
  STATUS_LABELS,
} from "@/lib/maintenanceCatalogLabels";
import { cn } from "@/lib/utils";
import type {
  CatalogManual,
  CatalogRequirementType,
  CatalogService,
  CatalogTask,
} from "@/types/maintenanceCatalog";
import { formatIntervals } from "./catalog-format";
import { IncompleteBadge } from "./IncompleteBadge";

const divider = "border-slate-400/30 dark:border-slate-600/30";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Marco común de los tres detalles: cabecera con identidad (icono, tipo, título
 * y badges), cuerpo que scrollea y una franja de pie. Sin esto cada diálogo era
 * una lista de campos sueltos sobre fondo plano.
 */
function DetailsShell({
  open,
  onOpenChange,
  icon: Icon,
  eyebrow,
  title,
  badges,
  footer,
  children,
}: DialogProps & {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  badges?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // Es un detalle de solo lectura: la cabecera ya nombra el diálogo.
        aria-describedby={undefined}
        className="gap-0 overflow-hidden bg-background p-0 sm:max-w-2xl"
      >
        <DialogHeader
          className={cn(
            "border-b bg-linear-to-br from-primary/5 to-transparent p-5 pr-12",
            divider,
          )}
        >
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1 space-y-1.5 text-left">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {eyebrow}
              </p>
              <DialogTitle className="wrap-break-word text-lg font-semibold leading-snug">
                {title}
              </DialogTitle>
              {badges && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {badges}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto p-5">
          {children}
        </div>

        {footer && (
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t bg-muted/30 px-5 py-2.5 text-xs text-muted-foreground",
              divider,
            )}
          >
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Un dato clave, con icono: lo que se busca de un vistazo. */
const Stat = ({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex min-w-0 items-center gap-2.5 rounded-lg border bg-muted/20 px-3 py-2.5",
      divider,
      className,
    )}
  >
    <span className="flex shrink-0 items-center justify-center text-primary/80">
      <Icon className="size-4" />
    </span>
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="wrap-break-word text-sm font-semibold">
        {value || <span className="font-normal text-muted-foreground">—</span>}
      </p>
    </div>
  </div>
);

const Block = ({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: LucideIcon;
  title: string;
  count?: number;
  children: ReactNode;
}) => (
  <section className="space-y-2.5">
    <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <Icon className="size-3.5" />
      {title}
      {count !== undefined && (
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal">
          {count}
        </span>
      )}
    </h4>
    {children}
  </section>
);

const TextCard = ({ children }: { children: ReactNode }) => (
  <div
    className={cn(
      "wrap-break-word rounded-xl border bg-linear-to-br from-background/70 to-background/40 p-4 text-sm leading-relaxed",
      divider,
    )}
  >
    {children}
  </div>
);

const Meta = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <span className="inline-flex items-center gap-1.5">
      <User className="size-3.5" />
      {label} <span className="font-medium text-foreground">{value}</span>
    </span>
  ) : null;

const supportLabel = (manual: CatalogManual) =>
  manual.is_physical
    ? "Solo físico"
    : manual.file_url
      ? "Digital"
      : "Sin archivo";

export function ManualDetailsDialog({
  open,
  onOpenChange,
  manual,
  onSelectManual,
}: DialogProps & {
  manual: CatalogManual;
  /** Salta a otra revisión del mismo manual y cierra el detalle. */
  onSelectManual: (id: number) => void;
}) {
  const previous = manual.previous_revisions ?? [];

  const jump = (id: number) => {
    onOpenChange(false);
    onSelectManual(id);
  };

  return (
    <DetailsShell
      open={open}
      onOpenChange={onOpenChange}
      icon={BookOpen}
      eyebrow="Manual de mantenimiento"
      title={manual.name}
      badges={
        <>
          <Badge variant={manual.status === "ACTIVE" ? "default" : "secondary"}>
            {STATUS_LABELS[manual.status]}
          </Badge>
          <Badge variant="outline">{supportLabel(manual)}</Badge>
        </>
      }
      footer={
        <>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Meta label="Registrado por" value={manual.registered_by} />
            <Meta label="Actualizado por" value={manual.updated_by} />
          </span>
          {manual.file_url && (
            <a
              href={manual.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              <ExternalLink className="size-3.5" />
              Ver archivo
            </a>
          )}
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Hash} label="Código" value={manual.manual_code} />
        <Stat icon={BookMarked} label="Revisión" value={manual.revision} />
        <Stat
          icon={CalendarDays}
          label="Vigente desde"
          value={
            manual.effective_date
              ? formatCalendarDate(manual.effective_date)
              : null
          }
        />
        <Stat
          icon={Wrench}
          label="Servicios"
          value={manual.services?.length ?? manual.services_count ?? 0}
        />
      </div>

      {manual.description && (
        <Block icon={BookOpen} title="Descripción">
          <TextCard>{manual.description}</TextCard>
        </Block>
      )}

      {manual.superseded_by && (
        <button
          type="button"
          onClick={() => jump(manual.superseded_by!.id)}
          className="flex w-full items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left text-sm transition-colors hover:bg-amber-500/15"
        >
          <History className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="min-w-0 flex-1">
            Este manual fue superado por{" "}
            <span className="font-semibold">
              {manual.superseded_by.revision || manual.superseded_by.name}
            </span>
          </span>
          <span className="shrink-0 text-xs font-medium text-primary">
            Abrir
          </span>
        </button>
      )}

      {previous.length > 0 && (
        <Block
          icon={History}
          title="Historial de revisiones"
          count={previous.length}
        >
          {/* Línea de tiempo: el punto marca cada revisión y la línea las
              encadena de la más reciente a la original. */}
          <ol className={cn("ml-1.5 space-y-2 border-l pl-5", divider)}>
            {previous.map((prev) => (
              <li key={prev.id} className="relative">
                <span className="absolute left-[-1.6rem] top-4 size-2.5 rounded-full border-2 border-primary bg-background" />
                <button
                  type="button"
                  onClick={() => jump(prev.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl border bg-linear-to-br from-background/70 to-background/40 p-3 text-left text-sm transition-all hover:border-primary/40 hover:shadow-sm",
                    divider,
                  )}
                >
                  <span className="min-w-0 truncate font-medium">
                    {prev.revision || prev.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {prev.effective_date
                      ? formatCalendarDate(prev.effective_date)
                      : "Sin fecha de vigencia"}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </Block>
      )}
    </DetailsShell>
  );
}

export function ServiceDetailsDialog({
  open,
  onOpenChange,
  service,
  manual,
}: DialogProps & { service: CatalogService; manual?: CatalogManual }) {
  const aircrafts = service.aircrafts ?? [];
  const tasksCount = service.tasks?.length ?? service.tasks_count ?? 0;

  return (
    <DetailsShell
      open={open}
      onOpenChange={onOpenChange}
      icon={Wrench}
      eyebrow={[CATEGORY_LABELS[service.category], service.code]
        .filter(Boolean)
        .join(" · ")}
      title={service.name}
      badges={
        <>
          <Badge
            variant={service.status === "ACTIVE" ? "default" : "secondary"}
          >
            {STATUS_LABELS[service.status]}
          </Badge>
          {manual ? (
            <Badge variant="outline" className="gap-1.5">
              <BookOpen className="size-3" />
              {manual.name}
              {manual.revision ? ` · Rev. ${manual.revision}` : ""}
            </Badge>
          ) : (
            <Badge variant="secondary">Sin manual asignado</Badge>
          )}
          <IncompleteBadge service={service} />
        </>
      }
      footer={
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Meta label="Registrado por" value={service.registered_by} />
          <Meta label="Actualizado por" value={service.updated_by} />
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Stat
          icon={Repeat}
          label="Intervalo"
          className="col-span-2"
          value={
            service.intervals.length > 0
              ? `Cada ${formatIntervals(service.intervals)}`
              : "Sin intervalo recurrente"
          }
        />
        <Stat icon={ClipboardList} label="Tareas" value={tasksCount} />
        <Stat icon={Plane} label="Aeronaves" value={aircrafts.length} />
      </div>

      {service.description && (
        <Block icon={BookOpen} title="Descripción">
          <TextCard>{service.description}</TextCard>
        </Block>
      )}

      <Block icon={Plane} title="Aeronaves aplicables" count={aircrafts.length}>
        {aircrafts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {aircrafts.map((aircraft) => (
              <span
                key={aircraft.id}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border bg-linear-to-br from-background/70 to-background/40 px-3 py-1 text-xs font-semibold",
                  divider,
                )}
              >
                <Plane className="size-3 text-primary" />
                {aircraft.acronym}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No aplica a ninguna aeronave todavía.
          </p>
        )}
      </Block>
    </DetailsShell>
  );
}

const REQUIREMENT_ICONS: Record<CatalogRequirementType, LucideIcon> = {
  PART: Package,
  TOOL: Wrench,
  CONSUMABLE: Droplets,
  COMPONENT: Cpu,
  GENERAL: ClipboardList,
};

export function TaskDetailsDialog({
  open,
  onOpenChange,
  task,
}: DialogProps & { task: CatalogTask }) {
  return (
    <DetailsShell
      open={open}
      onOpenChange={onOpenChange}
      icon={ClipboardList}
      eyebrow={MSG3_TYPE_LABELS[task.msg3_type]}
      title={
        task.task_number ? `Tarea ${task.task_number}` : "Detalle de la tarea"
      }
    >
      <Block icon={ClipboardList} title="Descripción">
        <TextCard>
          <p className="text-base font-medium leading-relaxed">
            {task.description}
          </p>
        </TextCard>
      </Block>

      <div className="grid grid-cols-2 gap-3">
        <Stat icon={Hash} label="ATA" value={task.ata} />
        <Stat
          icon={Hourglass}
          label="Horas-hombre"
          value={
            task.estimated_man_hours != null
              ? `${task.estimated_man_hours} H-H`
              : null
          }
        />
        <Stat
          icon={GraduationCap}
          label="Especialidad"
          value={task.required_skill}
        />
        <Stat icon={Link2} label="Referencia" value={task.reference} />
        <Stat
          icon={Repeat}
          label="Intervalo"
          className="col-span-2"
          value={
            task.intervals.length > 0
              ? `Cada ${formatIntervals(task.intervals)}`
              : "Hereda el del servicio"
          }
        />
      </div>

      <Block icon={Package} title="Requisitos" count={task.requirements.length}>
        {task.requirements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            La tarea no declara requisitos.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {task.requirements.map((req) => {
              const Icon = REQUIREMENT_ICONS[req.requirement_type];

              return (
                <li
                  key={req.id}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border bg-linear-to-br from-background/70 to-background/40 p-3",
                    divider,
                  )}
                >
                  <span className="flex shrink-0 mt-0.5 items-center justify-center text-primary/80">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="wrap-break-word text-sm font-medium leading-snug">
                      {req.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="text-[11px]">
                        {REQUIREMENT_TYPE_LABELS[req.requirement_type]}
                      </Badge>
                      {req.is_mandatory && (
                        <Badge variant="secondary" className="text-[11px]">
                          Obligatorio
                        </Badge>
                      )}
                      {req.part_number && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                          P/N {req.part_number}
                        </span>
                      )}
                    </div>
                    {req.notes && (
                      <p className="wrap-break-word text-xs text-muted-foreground">
                        {req.notes}
                      </p>
                    )}
                  </div>
                  {req.quantity != null && (
                    <div className="shrink-0 text-right">
                      <p className="text-base font-semibold leading-none tabular-nums">
                        {req.quantity}
                      </p>
                      {req.unit && (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {req.unit.label}
                        </p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Block>
    </DetailsShell>
  );
}
