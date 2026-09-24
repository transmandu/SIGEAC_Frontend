"use client";

import { Fragment, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RegisterAvionicsComplianceDialog } from "@/components/dialogs/mantenimiento/planificacion/RegisterAvionicsComplianceDialog";
import { useGetAvionicsControl } from "@/hooks/mantenimiento/planificacion/useGetAvionicsControl";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  computeMaintenanceItem,
  fmtNumber,
  ItemStatus,
  STATUS_META,
} from "@/lib/maintenanceControlCalc";
import {
  AVIONICS_ACTION_LABELS,
  AVIONICS_CATEGORY_LABELS,
} from "@/lib/avionicsControlLabels";
import {
  FormSection,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/planificacion/_theme";
import { AvionicsControlItem, AvionicsControlTask } from "@/types";
import { cn } from "@/lib/utils";
import { RecordAuditHistory } from "@/components/planificacion/auditoria/RecordAuditHistory";
import { RetiredControlBanner } from "@/components/planificacion/controles/RetiredControlBanner";
import {
  RetiredItemsSection,
  type RetiredRow,
} from "@/components/planificacion/controles/RetiredItemsSection";
import { RetireRecordButton } from "@/components/planificacion/controles/RetireRecordButton";
import {
  AlertTriangle,
  Clock,
  Info,
  Radio,
  Search,
  SquarePen,
  Wrench,
} from "lucide-react";

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold leading-tight">
        {value || (
          <span className="font-normal italic text-muted-foreground">
            No especificado
          </span>
        )}
      </p>
    </div>
  );
}

function TruncatedText({ children }: { children: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block truncate">{children}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs wrap-break-word">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

/** Mismo ciclo que los otros controles, sobre la tarea. */
function PrimaryTaskAction({
  item,
  task,
  status,
  company,
  controlId,
  aircraftId,
  aircraftAcronym,
  aircraftHours,
  aircraftCycles,
}: {
  item: AvionicsControlItem;
  task: AvionicsControlTask;
  status: ItemStatus;
  company: string;
  controlId: string | number;
  aircraftId: number | string;
  aircraftAcronym?: string;
  aircraftHours: number;
  aircraftCycles: number;
}) {
  if (!task.id) return null;

  const pendingWorkOrder = task.pending_work_order;
  const isBlockedByWorkOrder =
    !!pendingWorkOrder && pendingWorkOrder.status !== "CLOSED";

  if (isBlockedByWorkOrder) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={`/${company}/planificacion/ordenes_trabajo/${pendingWorkOrder!.order_number}`}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            <Clock className="size-3.5 shrink-0" />
            <span className="truncate">{pendingWorkOrder!.order_number}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          Bloqueado hasta que se cierre la Orden de Trabajo{" "}
          {pendingWorkOrder!.order_number}.
        </TooltipContent>
      </Tooltip>
    );
  }

  if ((status === "CRITICAL" || status === "OVERDUE") && !pendingWorkOrder) {
    const params = new URLSearchParams({
      aircraft_id: String(aircraftId),
      avionics_control_task_id: String(task.id),
      avionics_control_id: String(controlId),
      task_description: `${item.description}${item.position ? ` ${item.position}` : ""} (P/N ${item.part_number}, S/N ${item.serial})${aircraftAcronym ? ` — ${aircraftAcronym}` : ""}: ${AVIONICS_ACTION_LABELS[task.action].toLowerCase()} por vencimiento del Control de Aviónica.`,
    });

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={`/${company}/planificacion/ordenes_trabajo/nueva_orden_trabajo?${params.toString()}`}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-orange-600 hover:text-orange-700"
            >
              <Wrench className="size-4" />
              <span className="sr-only">Crear Orden de Trabajo</span>
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>Crear Orden de Trabajo</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <RegisterAvionicsComplianceDialog
      taskId={task.id}
      taskName={`${AVIONICS_ACTION_LABELS[task.action]} — ${item.description}${item.position ? ` ${item.position}` : ""} · S/N ${item.serial}`}
      aircraftId={aircraftId}
      defaultHours={aircraftHours}
      defaultCycles={aircraftCycles}
      pendingWorkOrder={pendingWorkOrder ?? null}
    />
  );
}

type TaskActionProps = Parameters<typeof PrimaryTaskAction>[0];

function TaskActionCell({
  controlRetired,
  ...props
}: TaskActionProps & { controlRetired: boolean }) {
  if (!props.task.id || controlRetired) return null;

  return (
    <div className="flex items-center justify-end gap-0.5">
      <PrimaryTaskAction {...props} />
      <RetireRecordButton
        recordType="avionics_control_task"
        recordId={props.task.id}
        subject={`tarea «${AVIONICS_ACTION_LABELS[props.task.action]}» de ${props.item.description}`}
      />
    </div>
  );
}

const COL = {
  task: "w-[150px]",
  limit: "w-[110px]",
  applied: "w-[125px]",
  next: "w-[115px]",
  remaining: "w-[150px]",
  provider: "w-[140px]",
  workOrder: "w-[110px]",
  actions: "w-[80px]",
};

const AvionicsControlDetailPage = () => {
  const { id, company } = useParams<{ id: string; company: string }>();
  const { selectedCompany } = useCompanyStore();
  const {
    data: control,
    isLoading,
    isError,
  } = useGetAvionicsControl(selectedCompany?.slug, id);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [onlyHazardous, setOnlyHazardous] = useState(false);

  // Una tarea dada de baja no tiene estado que calcular: se lista aparte.
  const activeItems = useMemo(
    () =>
      (control?.items ?? [])
        .filter((i) => i.status === "ACTIVE" && !i.retired_at)
        .map((i) => ({
          ...i,
          tasks: (i.tasks ?? []).filter((task) => !task.retired_at),
        }))
        .filter((i) => i.tasks.length > 0),
    [control],
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return activeItems.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (onlyHazardous && !item.is_hazardous) return false;
      if (status === "ON_CONDITION" && item.status_computed) return false;
      if (
        status !== "all" &&
        status !== "ON_CONDITION" &&
        item.status_computed !== status
      )
        return false;
      if (needle) {
        const haystack = [
          item.description,
          item.part_number,
          item.serial,
          item.position,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [activeItems, category, onlyHazardous, status, search]);

  if (isLoading) return <LoadingPage />;

  if (isError || !control) {
    return (
      <ContentLayout title="Control de Aviónica">
        <PageHeader className="mb-6" />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudo cargar el control de aviónica.
          </AlertDescription>
        </Alert>
      </ContentLayout>
    );
  }

  const remainingPercentage = Number(control.remaining_percentage);
  const controlRetired = !!control.retired_at;
  const hasPercentageOverrides = activeItems.some((item) =>
    (item.tasks ?? []).some(
      (task) =>
        task.remaining_percentage !== null &&
        task.remaining_percentage !== undefined,
    ),
  );
  const aircraftHours = Number(control.aircraft?.flight_hours ?? 0);
  const aircraftCycles = Number(control.aircraft?.flight_cycles ?? 0);
  const scheduledCount = activeItems.filter((i) => i.status_computed).length;

  return (
    <ContentLayout title={control.title}>
      <div className="flex flex-col gap-6">
        <PageHeader currentLabel={control.title} />

        <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col">
            <h1 className="text-3xl font-semibold tracking-tight">
              {control.title}
            </h1>
            {control.description && (
              <p className="text-sm text-muted-foreground">
                {control.description}
              </p>
            )}
          </div>
          {!controlRetired && (
            <ActionTriggerButton asChild>
              <Link
                href={`/${company}/planificacion/control_avionica/editar/${control.id}`}
              >
                <SquarePen className="mr-2 size-4" />
                Editar
              </Link>
            </ActionTriggerButton>
          )}
        </div>

        <RetiredControlBanner
          control={control}
          recordType="avionics_control"
          noun="control de aviónica"
        />

        <FormSection icon={Info} title="Información General">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-6">
            <InfoItem label="Matrícula" value={control.aircraft?.acronym} />
            <InfoItem
              label="Marca"
              value={control.aircraft?.manufacturer?.name}
            />
            <InfoItem label="Modelo" value={control.aircraft?.model} />
            <InfoItem label="Serial" value={control.aircraft?.serial} />
            <InfoItem
              label="Horas Totales"
              value={`${fmtNumber(aircraftHours)} hrs`}
            />
            <InfoItem
              label="Ciclos Totales"
              value={fmtNumber(aircraftCycles)}
            />
            <InfoItem
              label="% Remanente para Alerta"
              value={`${remainingPercentage}%${hasPercentageOverrides ? " (general)" : ""}`}
            />
            <InfoItem
              label="Manual de Referencia"
              value={
                control.has_reference_manual
                  ? (control.reference_manual ?? undefined)
                  : undefined
              }
            />
            <InfoItem label="Equipos instalados" value={activeItems.length} />
            <InfoItem label="Con plazo" value={scheduledCount} />
            <InfoItem
              label="Por condición"
              value={activeItems.length - scheduledCount}
            />
          </div>
        </FormSection>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por descripción, P/N o S/N..."
              className="h-10 pl-9 text-sm"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className={cn(selectTriggerClass, "w-full sm:w-60")}>
              <SelectValue placeholder="Sistema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los sistemas</SelectItem>
              {Object.entries(AVIONICS_CATEGORY_LABELS).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className={cn(selectTriggerClass, "w-full sm:w-48")}>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="ON_CONDITION">Por condición</SelectItem>
              {(Object.keys(STATUS_META) as ItemStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_META[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant={onlyHazardous ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlyHazardous((v) => !v)}
            className="h-10 gap-1.5"
          >
            <AlertTriangle className="size-4" />
            Mercancía peligrosa
          </Button>
        </div>

        <FormSection
          icon={Radio}
          title="Equipos de Aviónica"
          hint="Una fila por tarea; los equipos por condición no tienen plazo, solo se listan y se verifican."
        >
          {!filtered.length ? (
            <p className="text-sm italic text-muted-foreground">
              Ningún equipo coincide con el filtro.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-400/40 dark:border-slate-600/40">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="bg-muted/40 font-semibold">
                      Equipo
                    </TableHead>
                    <TableHead
                      className={cn(COL.task, "bg-muted/40 font-semibold")}
                    >
                      Tarea
                    </TableHead>
                    <TableHead
                      className={cn(COL.limit, "bg-muted/40 font-semibold")}
                    >
                      Límite
                    </TableHead>
                    <TableHead
                      className={cn(COL.applied, "bg-muted/40 font-semibold")}
                    >
                      Último Cump.
                    </TableHead>
                    <TableHead
                      className={cn(COL.next, "bg-muted/40 font-semibold")}
                    >
                      Próximo
                    </TableHead>
                    <TableHead
                      className={cn(COL.remaining, "bg-muted/40 font-semibold")}
                    >
                      Remanente
                    </TableHead>
                    <TableHead
                      className={cn(COL.provider, "bg-muted/40 font-semibold")}
                    >
                      Realizado Por
                    </TableHead>
                    <TableHead
                      className={cn(COL.workOrder, "bg-muted/40 font-semibold")}
                    >
                      OT en curso
                    </TableHead>
                    <TableHead className={cn(COL.actions, "bg-muted/40")} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <Fragment key={item.id}>
                      {item.tasks.map((task, t) => {
                        const computed = task.computed
                          ? computeMaintenanceItem(task)
                          : null;
                        const meta = computed
                          ? STATUS_META[computed.status]
                          : null;
                        const pending = task.pending_work_order;
                        const lastWorkOrder =
                          task.latest_compliance?.work_order?.order_number;
                        return (
                          <TableRow
                            key={task.id ?? t}
                            className={cn(
                              meta?.row,
                              "transition-colors hover:bg-primary/3",
                            )}
                          >
                            {t === 0 && (
                              <TableCell
                                rowSpan={item.tasks.length}
                                className="align-top font-medium"
                              >
                                <TruncatedText>{`${item.description}${item.position ? ` ${item.position}` : ""}`}</TruncatedText>
                                <span className="block truncate text-xs text-muted-foreground">
                                  P/N {item.part_number} · S/N {item.serial}
                                </span>
                                {item.reference_document && (
                                  <span className="block truncate text-xs text-muted-foreground">
                                    {item.reference_document}
                                  </span>
                                )}
                                <span className="mt-1 flex flex-wrap items-center gap-1">
                                  <Badge
                                    variant="outline"
                                    className="text-[10px]"
                                  >
                                    {AVIONICS_CATEGORY_LABELS[item.category]}
                                  </Badge>
                                  {item.is_hazardous && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex items-center rounded border border-amber-500/40 bg-amber-500/10 px-1 text-[10px] text-amber-700 dark:text-amber-400">
                                          <AlertTriangle className="mr-0.5 size-3" />
                                          MP
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Mercancía peligrosa
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {!controlRetired && item.id && (
                                    <RetireRecordButton
                                      recordType="avionics_control_item"
                                      recordId={item.id}
                                      subject={`equipo «${item.description} · S/N ${item.serial}» con todas sus tareas`}
                                    />
                                  )}
                                </span>
                              </TableCell>
                            )}
                            <TableCell className={cn(COL.task, "truncate")}>
                              <span className="block truncate">
                                {AVIONICS_ACTION_LABELS[task.action]}
                              </span>
                              {task.is_on_condition && (
                                <span className="block truncate text-xs italic text-muted-foreground">
                                  Por condición
                                </span>
                              )}
                            </TableCell>
                            {computed ? (
                              <>
                                <TableCell
                                  className={cn(COL.limit, "truncate")}
                                >
                                  <span className="block truncate">
                                    {computed.frequency}
                                  </span>
                                  {computed.extras.map((extra, i) => (
                                    <span
                                      key={i}
                                      className="block truncate text-xs text-muted-foreground"
                                    >
                                      Ó {extra.frequency}
                                    </span>
                                  ))}
                                </TableCell>
                                <TableCell className={COL.applied}>
                                  <span className="block truncate">
                                    {computed.applied}
                                  </span>
                                  {lastWorkOrder && (
                                    <Link
                                      href={`/${company}/planificacion/ordenes_trabajo/${lastWorkOrder}`}
                                      className="block truncate text-xs text-primary hover:underline"
                                    >
                                      {lastWorkOrder}
                                    </Link>
                                  )}
                                </TableCell>
                                <TableCell className={cn(COL.next, "truncate")}>
                                  <span className="block truncate">
                                    {computed.next}
                                  </span>
                                  {computed.extras.map((extra, i) => (
                                    <span
                                      key={i}
                                      className="block truncate text-xs text-muted-foreground"
                                    >
                                      {extra.next}
                                    </span>
                                  ))}
                                </TableCell>
                                <TableCell
                                  className={cn(COL.remaining, "truncate")}
                                >
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1.5 font-semibold",
                                      meta!.text,
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "size-1.5 shrink-0 rounded-full",
                                        meta!.dot,
                                      )}
                                    />
                                    {computed.remaining}
                                    {task.remaining_percentage !== null &&
                                      task.remaining_percentage !==
                                        undefined && (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span className="rounded bg-muted px-1 text-[10px] font-medium text-muted-foreground">
                                              {Number(
                                                task.remaining_percentage,
                                              )}
                                              %
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            Margen propio de esta tarea,
                                            distinto del {remainingPercentage}%
                                            del control
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                  </span>
                                  {computed.extras.map((extra, i) => (
                                    <span
                                      key={i}
                                      className={cn(
                                        "block truncate text-xs",
                                        extra.status
                                          ? STATUS_META[extra.status].text
                                          : "text-muted-foreground",
                                      )}
                                    >
                                      {extra.remaining}
                                    </span>
                                  ))}
                                </TableCell>
                                <TableCell className={COL.provider}>
                                  <TruncatedText>
                                    {computed.providerName}
                                  </TruncatedText>
                                </TableCell>
                                <TableCell className={COL.workOrder}>
                                  {pending && pending.status !== "CLOSED" ? (
                                    <Link
                                      href={`/${company}/planificacion/ordenes_trabajo/${pending.order_number}`}
                                      className="truncate text-primary hover:underline"
                                    >
                                      {pending.order_number}
                                    </Link>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      —
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className={COL.actions}>
                                  <TaskActionCell
                                    item={item}
                                    task={task}
                                    status={computed.status}
                                    company={company}
                                    controlId={control.id}
                                    aircraftId={control.aircraft.id}
                                    aircraftAcronym={control.aircraft?.acronym}
                                    aircraftHours={aircraftHours}
                                    aircraftCycles={aircraftCycles}
                                    controlRetired={controlRetired}
                                  />
                                </TableCell>
                              </>
                            ) : (
                              <TableCell
                                colSpan={7}
                                className="text-sm text-muted-foreground"
                              >
                                Sin plazo — se verifica en tierra en cada
                                inspección y se certifica en el 43-005.
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </FormSection>

        <RetiredItemsSection
          canRestore={!controlRetired}
          rows={(control.items ?? []).flatMap((item): RetiredRow[] => {
            const equipment = `${item.description}${item.position ? ` ${item.position}` : ""}`;

            if (item.retired_at && item.id) {
              return [
                {
                  id: item.id,
                  recordType: "avionics_control_item",
                  label: equipment,
                  detail: `P/N ${item.part_number} · S/N ${item.serial} · equipo completo`,
                  subject: `equipo «${item.description} · S/N ${item.serial}»`,
                  retired_at: item.retired_at,
                  retired_by: item.retired_by,
                },
              ];
            }

            return (item.tasks ?? [])
              .filter((task) => task.retired_at && task.id)
              .map((task) => ({
                id: task.id!,
                recordType: "avionics_control_task",
                label: `${AVIONICS_ACTION_LABELS[task.action]} — ${equipment}`,
                detail: `P/N ${item.part_number} · S/N ${item.serial}`,
                subject: `tarea «${AVIONICS_ACTION_LABELS[task.action]}» de ${item.description}`,
                retired_at: task.retired_at!,
                retired_by: task.retired_by,
              }));
          })}
        />

        <RecordAuditHistory
          subjectType="avionics_control"
          subjectId={control.id}
          filename={`historial_control_avionica_${control.aircraft?.acronym ?? control.id}`}
        />
      </div>
    </ContentLayout>
  );
};

export default AvionicsControlDetailPage;
