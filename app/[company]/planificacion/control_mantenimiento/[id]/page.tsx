"use client";

import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { CloseComplianceDialog } from "@/components/dialogs/mantenimiento/planificacion/CloseComplianceDialog";
import { StartComplianceDialog } from "@/components/dialogs/mantenimiento/planificacion/StartComplianceDialog";
import { AddMaintenanceControlItemDialog } from "@/components/dialogs/mantenimiento/planificacion/AddMaintenanceControlItemDialog";
import { ImportComplianceHistoryDialog } from "@/components/dialogs/mantenimiento/planificacion/ImportComplianceHistoryDialog";
import { DownloadMaintenanceFormatButton } from "@/components/dialogs/mantenimiento/planificacion/DownloadMaintenanceFormatButton";
import { useGetMaintenanceControl } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceControl";
import { useGetAircraftDailyAverage } from "@/hooks/mantenimiento/planificacion/useGetAircraftDailyAverage";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  computeMaintenanceItem,
  fmtNumber,
  ItemStatus,
  STATUS_META,
} from "@/lib/maintenanceControlCalc";
import { partTypeLabel } from "@/lib/maintenancePartTypes";
import { FormSection } from "@/components/forms/mantenimiento/planificacion/_theme";
import { MaintenanceAircraftPart, MaintenanceControlItem } from "@/types";
import { cn } from "@/lib/utils";
import { RecordAuditHistory } from "@/components/planificacion/auditoria/RecordAuditHistory";
import { RetiredControlBanner } from "@/components/planificacion/controles/RetiredControlBanner";
import { RetiredItemsSection } from "@/components/planificacion/controles/RetiredItemsSection";
import { RetireRecordButton } from "@/components/planificacion/controles/RetireRecordButton";
import { useLinkPendingWorkOrder } from "@/actions/mantenimiento/planificacion/control_mantenimiento/actions";
import { WorkOrderCell } from "@/components/planificacion/controles/WorkOrderCell";
import { AddToQueueButton } from "@/components/planificacion/cola/AddToQueueButton";
import {
  AlertTriangle,
  ClipboardList,
  Clock,
  Info,
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
          <span className="font-normal text-muted-foreground italic">
            No especificado
          </span>
        )}
      </p>
    </div>
  );
}

// Misma jerarquía visual para Control / Aeronave / cada Parte: un subtítulo
// seguido de la grilla de InfoItem, para que la información no cambie de
// forma según de qué entidad se trate.
function InfoSection({
  title,
  bordered = false,
  children,
}: {
  title: string;
  bordered?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        bordered &&
          "border-t border-slate-400/30 pt-3 dark:border-slate-600/30",
      )}
    >
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-6">
        {children}
      </div>
    </div>
  );
}

function StatusLegend({
  remainingPercentage,
  hasOverrides,
}: {
  remainingPercentage: number;
  hasOverrides: boolean;
}) {
  const descriptions: Record<ItemStatus, string> = {
    OK: "Remanente por encima del doble del margen configurado.",
    WARNING: "Remanente dentro del doble del margen configurado.",
    CRITICAL: "Remanente dentro del margen configurado.",
    OVERDUE: "Ya superó la fecha, horas o ciclos límite.",
    NONE: "No tiene un cumplimiento vigente: inicie uno para que corra su reloj.",
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
        >
          <Info className="size-4" />
          ¿Qué significan los colores?
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <p className="text-sm font-medium">Estado según el remanente</p>
          <p className="text-xs text-muted-foreground">
            {hasOverrides
              ? `El margen es ${remainingPercentage}% salvo en los ítems que definen el suyo, indicado junto a su remanente.`
              : `Margen configurado: ${remainingPercentage}%.`}
          </p>
          {(Object.keys(STATUS_META) as ItemStatus[]).map((status) => (
            <div key={status} className="flex items-start gap-2">
              <span
                className={cn(
                  "mt-1 size-2 shrink-0 rounded-full",
                  STATUS_META[status].dot,
                )}
              />
              <div>
                <p className="text-sm font-medium leading-none">
                  {STATUS_META[status].label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {descriptions[status]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const COL = {
  frequency: "w-[110px]",
  applied: "w-[120px]",
  next: "w-[120px]",
  remaining: "w-37.5",
  estimate: "w-[120px]",
  provider: "w-37.5",
  workOrder: "w-37.5",
  actions: "w-[100px]",
};

// Columnas como "Estimación" pueden llevar texto largo ("Sin vuelos en los
// últimos 30 días") que el ancho fijo trunca; sin esto no hay forma de leer
// qué decía sin ensanchar la columna.
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

// La acción por fila ahora es mandar el ítem a la cola de cumplimientos: la OT
// se crea desde ahí, para una sola orden que atienda varios cumplimientos (ver
// ComplianceQueueButton). Registrar el cumplimiento sigue disponible por fila,
// porque cada uno exige sus propias lecturas y proveedor.
function ItemActionCell({
  item,
  company,
  aircraftId,
  defaultHours,
  defaultCycles,
  controlRetired,
}: {
  item: MaintenanceControlItem;
  company: string;
  aircraftId: number | string;
  defaultHours: number;
  defaultCycles: number;
  controlRetired: boolean;
}) {
  if (!item.id || controlRetired) return null;

  const current = item.current_compliance;
  const pendingWorkOrder = current?.work_order;
  const hasOpenWorkOrder =
    !!pendingWorkOrder && pendingWorkOrder.status !== "CLOSED";
  const workOrderDescription =
    item.declared_description?.trim() || item.description;
  const units = item.intervals.map((interval) => interval.counting_method);

  return (
    <div className="flex flex-col items-end gap-0.5">
      {/* Informativo, no excluyente: tener una OT abierta no impide volver a
          encolar el ítem — puede entrar en una segunda orden, o en un formato. */}
      {hasOpenWorkOrder && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={`/${company}/planificacion/ordenes_trabajo/${pendingWorkOrder!.order_number}`}
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <Clock className="size-3.5 shrink-0" />
              <span className="sr-only">
                Ver Orden de Trabajo {pendingWorkOrder!.order_number}
              </span>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            Orden de Trabajo {pendingWorkOrder!.order_number} abierta para este
            ítem.
          </TooltipContent>
        </Tooltip>
      )}

      <AddToQueueButton
        type="maintenance_control_item"
        itemId={item.id}
        subject={`ítem «${item.description}»`}
      />

      {current ? (
        <CloseComplianceDialog
          kind="maintenance"
          complianceId={current.id}
          subjectName={item.description}
          workOrderDescription={workOrderDescription}
          aircraftId={aircraftId}
          units={units}
          appliedDate={current.applied_date}
          defaultHours={defaultHours}
          defaultCycles={defaultCycles}
          currentProviderId={current.maintenance_provider_id}
          currentWorkOrder={pendingWorkOrder ?? null}
        />
      ) : (
        <StartComplianceDialog
          kind="maintenance"
          subjectId={item.id}
          subjectName={item.description}
          workOrderDescription={workOrderDescription}
          aircraftId={aircraftId}
          units={units}
          defaultHours={defaultHours}
          defaultCycles={defaultCycles}
          defaultProviderId={item.maintenance_provider_id}
        />
      )}
      <RetireRecordButton
        recordType="maintenance_control_item"
        recordId={item.id}
        subject={`ítem «${item.description}»`}
      />
    </div>
  );
}

function MaintenanceItemsTable({
  items,
  aircraft,
  emptyLabel,
  company,
  realAircraftId,
  controlRemainingPercentage,
  controlRetired,
}: {
  items: MaintenanceControlItem[];
  aircraft: { flight_hours: number | string; flight_cycles: number | string };
  emptyLabel: string;
  company: string;
  realAircraftId: number | string;
  controlRemainingPercentage: number;
  controlRetired: boolean;
}) {
  const { selectedCompany } = useCompanyStore();
  const { linkPendingWorkOrder } = useLinkPendingWorkOrder();
  const selectedCompanySlug = selectedCompany?.slug;

  if (!items.length) {
    return <p className="text-sm italic text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-400/40 dark:border-slate-600/40">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="bg-muted/40 font-semibold">Nombre</TableHead>
            <TableHead
              className={cn(COL.frequency, "bg-muted/40 font-semibold")}
            >
              Frecuencia
            </TableHead>
            <TableHead className={cn(COL.applied, "bg-muted/40 font-semibold")}>
              Aplicada
            </TableHead>
            <TableHead className={cn(COL.next, "bg-muted/40 font-semibold")}>
              Próximo
            </TableHead>
            <TableHead
              className={cn(COL.remaining, "bg-muted/40 font-semibold")}
            >
              Remanente
            </TableHead>
            <TableHead
              className={cn(COL.estimate, "bg-muted/40 font-semibold")}
            >
              Estimación
            </TableHead>
            <TableHead
              className={cn(COL.provider, "bg-muted/40 font-semibold")}
            >
              Realizado Por
            </TableHead>
            <TableHead
              className={cn(COL.workOrder, "bg-muted/40 font-semibold")}
            >
              Orden de Trabajo
            </TableHead>
            <TableHead className={cn(COL.actions, "bg-muted/40")} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const computed = computeMaintenanceItem(item);
            const meta = STATUS_META[computed.status];
            return (
              <TableRow
                key={item.id}
                className={cn(meta.row, "transition-colors hover:bg-primary/3")}
              >
                <TableCell className="font-medium">
                  <TruncatedText>{item.description}</TruncatedText>
                </TableCell>
                <TableCell className={cn(COL.frequency, "truncate")}>
                  <span className="block truncate">{computed.frequency}</span>
                  {/* N intervalos ("lo que ocurra primero"): mismo cumplimiento, un reloj cada uno. */}
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
                  <span className="block truncate">{computed.applied}</span>
                  {computed.appliedSub && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {computed.appliedSub}
                    </span>
                  )}
                </TableCell>
                <TableCell className={cn(COL.next, "truncate")}>
                  <span className="block truncate">{computed.next}</span>
                  {computed.extras.map((extra, i) => (
                    <span
                      key={i}
                      className="block truncate text-xs text-muted-foreground"
                    >
                      {extra.next}
                    </span>
                  ))}
                </TableCell>
                <TableCell className={cn(COL.remaining, "truncate")}>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 font-semibold",
                      meta.text,
                    )}
                  >
                    <span
                      className={cn("size-1.5 shrink-0 rounded-full", meta.dot)}
                    />
                    {computed.remaining}
                    {item.remaining_percentage !== null &&
                      item.remaining_percentage !== undefined && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="rounded bg-muted px-1 text-[10px] font-medium text-muted-foreground">
                              {Number(item.remaining_percentage)}%
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            Margen propio de este ítem, distinto del{" "}
                            {controlRemainingPercentage}% del control
                          </TooltipContent>
                        </Tooltip>
                      )}
                  </span>
                  {computed.extras.map((extra, i) => (
                    <span
                      key={i}
                      className={cn(
                        "block truncate text-xs",
                        STATUS_META[extra.status].text,
                      )}
                    >
                      {extra.remaining}
                    </span>
                  ))}
                </TableCell>
                <TableCell className={COL.estimate}>
                  <TruncatedText>{computed.estimate}</TruncatedText>
                  {computed.extras.map((extra, i) => (
                    <span
                      key={i}
                      className="block truncate text-xs text-muted-foreground"
                    >
                      {extra.estimate}
                    </span>
                  ))}
                </TableCell>
                <TableCell className={COL.provider}>
                  <TruncatedText>{computed.providerName}</TruncatedText>
                </TableCell>
                <TableCell className={COL.workOrder}>
                  <WorkOrderCell
                    company={company}
                    aircraftId={realAircraftId}
                    subject={`ítem «${item.description}»`}
                    taskDescription={
                      item.declared_description?.trim() || item.description
                    }
                    previous={item.last_completed_compliance?.work_order}
                    current={item.current_compliance?.work_order}
                    // Sin cumplimiento vigente no hay a quién atar una orden.
                    readOnly={
                      controlRetired || !item.id || !item.current_compliance
                    }
                    onWorkOrderCreated={(workOrder) =>
                      linkPendingWorkOrder.mutateAsync({
                        company: selectedCompanySlug!,
                        itemId: item.id!,
                        workOrderId: workOrder.id,
                      })
                    }
                  />
                </TableCell>
                <TableCell className={COL.actions}>
                  <ItemActionCell
                    item={item}
                    company={company}
                    aircraftId={realAircraftId}
                    defaultHours={Number(aircraft.flight_hours ?? 0)}
                    defaultCycles={Number(aircraft.flight_cycles ?? 0)}
                    controlRetired={controlRetired}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

const MaintenanceControlDetailPage = () => {
  const { id, company } = useParams<{ id: string; company: string }>();
  const { selectedCompany } = useCompanyStore();
  const {
    data: control,
    isLoading,
    isError,
  } = useGetMaintenanceControl(selectedCompany?.slug, id);
  const { data: dailyAverage } = useGetAircraftDailyAverage(
    selectedCompany?.slug,
    control?.aircraft?.acronym,
  );

  if (isLoading) return <LoadingPage />;

  if (isError || !control) {
    return (
      <ContentLayout title="Control de Mantenimiento">
        <PageHeader className="mb-6" />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudo cargar el control de mantenimiento.
          </AlertDescription>
        </Alert>
      </ContentLayout>
    );
  }

  const remainingPercentage = Number(control.remaining_percentage);
  const allItems = control.items ?? [];
  const items = allItems.filter((item) => !item.retired_at);
  const controlRetired = !!control.retired_at;
  const hasPercentageOverrides = items.some(
    (item) =>
      item.remaining_percentage !== null &&
      item.remaining_percentage !== undefined,
  );
  const certificates = items.filter((i) => i.item_type === "CERTIFICATE");
  const aircraftServices = items.filter(
    (i) => i.item_type === "SERVICE" && !i.aircraft_part_id,
  );

  // "Motor 1 S/N: <serial>", "Motor 2 S/N: <serial>"...: numerado por orden
  // de aparición dentro de su propio tipo, no por el número de parte (que no
  // dice nada al usuario) — igual con Hélice, Turbina, APU. `label` es texto
  // plano (nombre de archivo, tooltip); `typeLabel` + `serial` separados
  // armar el título con "S/N:" en gris, para no confundir el serial con un
  // modelo que ya trae guiones propios (ej. TPE331-12UHR-701H).
  const partTypeCounters: Record<string, number> = {};
  const partsById = new Map<string, MaintenanceAircraftPart>();
  items.forEach((item) => {
    if (item.aircraft_part_id && item.aircraft_part) {
      partsById.set(String(item.aircraft_part_id), item.aircraft_part);
    }
  });
  const parts = Array.from(partsById.values()).map((aircraftPart) => {
    const type = (aircraftPart.type ?? "").toUpperCase();
    partTypeCounters[type] = (partTypeCounters[type] ?? 0) + 1;
    const serial = aircraftPart.serial;
    const typeLabel = `${partTypeLabel(aircraftPart.type)} ${partTypeCounters[type]}`;
    return {
      id: aircraftPart.id,
      aircraft_part: aircraftPart,
      typeLabel,
      serial,
      label: `${typeLabel}${serial ? ` - ${serial}` : ""}`,
    };
  });

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
          <div className="flex items-center gap-2">
            <StatusLegend
              remainingPercentage={remainingPercentage}
              hasOverrides={hasPercentageOverrides}
            />
            <RecordAuditHistory
              subjectType="maintenance_control"
              subjectId={control.id}
              filename={`historial_control_mantenimiento_${control.aircraft?.acronym ?? control.id}`}
            />
            {!controlRetired && (
              <>
                <ImportComplianceHistoryDialog
                  controlId={control.id}
                  items={items}
                />
                <ActionTriggerButton asChild>
                  <Link
                    href={`/${company}/planificacion/control_mantenimiento/editar/${control.id}`}
                  >
                    <SquarePen className="mr-2 size-4" />
                    Editar
                  </Link>
                </ActionTriggerButton>
              </>
            )}
          </div>
        </div>

        <RetiredControlBanner
          control={control}
          recordType="maintenance_control"
          noun="control de mantenimiento"
        />

        <FormSection icon={Info} title="Información General">
          <div className="space-y-3">
            <InfoSection title="Control">
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
            </InfoSection>

            <InfoSection title="Aeronave" bordered>
              <InfoItem label="Matrícula" value={control.aircraft?.acronym} />
              <InfoItem
                label="Marca"
                value={control.aircraft?.manufacturer?.name}
              />
              <InfoItem label="Modelo" value={control.aircraft?.model} />
              <InfoItem label="Serial" value={control.aircraft?.serial} />
              <InfoItem
                label="Horas Totales"
                value={`${fmtNumber(Number(control.aircraft?.flight_hours ?? 0))} hrs`}
              />
              <InfoItem
                label="Ciclos Totales"
                value={fmtNumber(Number(control.aircraft?.flight_cycles ?? 0))}
              />
              <InfoItem
                label={`Promedio Horas/Día (${dailyAverage?.days_considered ?? 30}d)`}
                value={
                  dailyAverage
                    ? `${fmtNumber(dailyAverage.daily_average_hours)} hrs`
                    : undefined
                }
              />
              <InfoItem
                label={`Promedio Ciclos/Día (${dailyAverage?.days_considered ?? 30}d)`}
                value={
                  dailyAverage
                    ? fmtNumber(dailyAverage.daily_average_cycles)
                    : undefined
                }
              />
            </InfoSection>

            {parts.map((part) => {
              const p = part.aircraft_part;
              return (
                <InfoSection key={part.id} title={part.label} bordered>
                  <InfoItem label="Tipo" value={p?.type} />
                  <InfoItem label="Número de Parte" value={p?.part_number} />
                  <InfoItem label="Serial" value={p?.serial} />
                  <InfoItem
                    label="TSN"
                    value={
                      p?.time_since_new !== undefined &&
                      p?.time_since_new !== null
                        ? `${fmtNumber(Number(p.time_since_new))} hrs`
                        : undefined
                    }
                  />
                  <InfoItem
                    label="CSN"
                    value={
                      p?.cycles_since_new !== undefined &&
                      p?.cycles_since_new !== null
                        ? fmtNumber(Number(p.cycles_since_new))
                        : undefined
                    }
                  />
                </InfoSection>
              );
            })}
          </div>
        </FormSection>

        <FormSection
          icon={ClipboardList}
          title="Certificados"
          action={
            !controlRetired && (
              <AddMaintenanceControlItemDialog
                controlId={control.id}
                itemType="CERTIFICATE"
                sectionLabel="Certificados"
                currentHours={Number(control.aircraft?.flight_hours ?? 0)}
                currentCycles={Number(control.aircraft?.flight_cycles ?? 0)}
              />
            )
          }
        >
          <MaintenanceItemsTable
            items={certificates}
            aircraft={control.aircraft}
            emptyLabel="Este control no tiene certificados registrados."
            company={company}
            realAircraftId={control.aircraft.id}
            controlRemainingPercentage={remainingPercentage}
            controlRetired={controlRetired}
          />
        </FormSection>

        <FormSection
          icon={Wrench}
          title="Aeronave"
          action={
            <div className="flex items-center gap-1">
              {!controlRetired && (
                <AddMaintenanceControlItemDialog
                  controlId={control.id}
                  itemType="SERVICE"
                  sectionLabel="Servicios de Aeronave"
                  currentHours={Number(control.aircraft?.flight_hours ?? 0)}
                  currentCycles={Number(control.aircraft?.flight_cycles ?? 0)}
                />
              )}
              <DownloadMaintenanceFormatButton
                url={`/${company}/maintenance-controls/${control.id}/format/aeronave`}
                filename={`control_mantenimiento_${control.aircraft?.acronym}.pdf`}
                label="Descargar formato INAC-43-008 de la aeronave"
              />
            </div>
          }
        >
          <MaintenanceItemsTable
            items={aircraftServices}
            aircraft={control.aircraft}
            emptyLabel="Este control no tiene servicios de aeronave registrados."
            company={company}
            realAircraftId={control.aircraft.id}
            controlRemainingPercentage={remainingPercentage}
            controlRetired={controlRetired}
          />
        </FormSection>

        {parts.map((part) => {
          const partItems = items.filter(
            (i) => String(i.aircraft_part_id) === String(part.id),
          );
          return (
            <FormSection
              key={part.id}
              icon={Wrench}
              title={
                <>
                  {part.typeLabel}
                  {part.serial && (
                    <>
                      {" "}
                      <span className="text-muted-foreground">S/N:</span>{" "}
                      {part.serial}
                    </>
                  )}
                </>
              }
              action={
                <div className="flex items-center gap-1">
                  {!controlRetired && (
                    <AddMaintenanceControlItemDialog
                      controlId={control.id}
                      itemType="SERVICE"
                      aircraftPartId={part.id}
                      sectionLabel={part.label}
                      currentHours={Number(
                        part.aircraft_part?.time_since_new ?? 0,
                      )}
                      currentCycles={Number(
                        part.aircraft_part?.cycles_since_new ?? 0,
                      )}
                    />
                  )}
                  <DownloadMaintenanceFormatButton
                    url={`/${company}/maintenance-controls/${control.id}/format/parte/${part.id}`}
                    filename={`control_mantenimiento_${part.label}.pdf`}
                    label={`Descargar formato INAC-43-008 de ${part.label}`}
                  />
                </div>
              }
            >
              <MaintenanceItemsTable
                items={partItems}
                // Las horas/ciclos "actuales" de un servicio de parte son
                // los de la PARTE (TSN/CSN), no los totales de la aeronave —
                // una parte más nueva que el avión no puede medirse contra
                // las horas de éste. El backend ya resolvió esto al calcular
                // `item.computed` (MaintenanceControlCalculator); acá solo
                // queda para defaultHours/defaultCycles del diálogo de
                // registrar cumplimiento.
                aircraft={{
                  flight_hours: part.aircraft_part?.time_since_new ?? 0,
                  flight_cycles: part.aircraft_part?.cycles_since_new ?? 0,
                }}
                emptyLabel="Esta parte no tiene servicios registrados."
                company={company}
                realAircraftId={control.aircraft.id}
                controlRemainingPercentage={remainingPercentage}
                controlRetired={controlRetired}
              />
            </FormSection>
          );
        })}

        <RetiredItemsSection
          canRestore={!controlRetired}
          rows={allItems
            .filter((item) => item.retired_at && item.id)
            .map((item) => ({
              id: item.id!,
              recordType: "maintenance_control_item" as const,
              label: item.description,
              detail:
                item.item_type === "CERTIFICATE" ? "Certificado" : "Servicio",
              subject: `ítem «${item.description}»`,
              retired_at: item.retired_at!,
              retired_by: item.retired_by,
            }))}
        />
      </div>
    </ContentLayout>
  );
};

export default MaintenanceControlDetailPage;
