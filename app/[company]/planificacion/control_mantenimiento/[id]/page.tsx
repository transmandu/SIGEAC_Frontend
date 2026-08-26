"use client";

import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RegisterComplianceDialog } from "@/components/dialogs/mantenimiento/planificacion/RegisterComplianceDialog";
import { useGetMaintenanceControl } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceControl";
import { useGetAircraftDailyAverage } from "@/hooks/mantenimiento/planificacion/useGetAircraftDailyAverage";
import { useCompanyStore } from "@/stores/CompanyStore";
import { computeMaintenanceItem, fmtNumber, ItemStatus } from "@/lib/maintenanceControlCalc";
import { MaintenanceControlItem } from "@/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, Info, SquarePen, Wrench } from "lucide-react";

function InfoItem({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold leading-tight">
        {value || <span className="font-normal text-muted-foreground italic">No especificado</span>}
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
    <div className={cn(bordered && "border-t pt-3")}>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">{title}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-6">{children}</div>
    </div>
  );
}

// Las mismas 4 franjas de computeMaintenanceItem, con su color y qué
// significan en texto llano — usado tanto en la leyenda como en el texto
// coloreado de "Remanente".
const STATUS_META: Record<ItemStatus, { label: string; dot: string; text: string; row: string }> = {
  OK: {
    label: "Vigente",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    row: "",
  },
  WARNING: {
    label: "Alerta temprana",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    row: "bg-amber-500/[0.04]",
  },
  CRITICAL: {
    label: "Crítico",
    dot: "bg-orange-500",
    text: "text-orange-700 dark:text-orange-400",
    row: "bg-orange-500/[0.04]",
  },
  OVERDUE: {
    label: "Vencido",
    dot: "bg-red-600",
    text: "text-red-700 dark:text-red-400",
    row: "bg-red-600/[0.04]",
  },
};

function StatusLegend({ remainingPercentage }: { remainingPercentage: number }) {
  const descriptions: Record<ItemStatus, string> = {
    OK: `Remanente por encima del doble del margen configurado (${remainingPercentage}%).`,
    WARNING: `Remanente dentro del doble del margen configurado (entre ${remainingPercentage}% y ${remainingPercentage * 2}%).`,
    CRITICAL: `Remanente dentro del margen configurado (${remainingPercentage}% o menos).`,
    OVERDUE: "Ya superó la fecha, horas o ciclos límite.",
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <Info className="size-4" />
          ¿Qué significan los colores?
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <p className="text-sm font-medium">Estado según el remanente</p>
          {(Object.keys(STATUS_META) as ItemStatus[]).map((status) => (
            <div key={status} className="flex items-start gap-2">
              <span className={cn("mt-1 size-2 shrink-0 rounded-full", STATUS_META[status].dot)} />
              <div>
                <p className="text-sm font-medium leading-none">{STATUS_META[status].label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{descriptions[status]}</p>
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
  remaining: "w-[150px]",
  estimate: "w-[120px]",
  provider: "w-[150px]",
  actions: "w-[44px]",
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
      <TooltipContent side="top" className="max-w-xs break-words">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

// Punto 5 de la reunión de planificación: desde que un ítem entra en estado
// crítico/vencido, no se puede registrar un nuevo cumplimiento hasta abrir
// (y cerrar) una Orden de Trabajo real para resolverlo — el ítem queda
// "atado" a esa OT (pending_work_order) mientras no esté CLOSED.
function ItemActionCell({
  item,
  status,
  company,
  controlId,
  aircraftId,
  aircraftAcronym,
  defaultHours,
  defaultCycles,
}: {
  item: MaintenanceControlItem;
  status: ItemStatus;
  company: string;
  controlId: string | number;
  aircraftId: number | string;
  aircraftAcronym?: string;
  defaultHours: number;
  defaultCycles: number;
}) {
  if (!item.id) return null;

  const pendingWorkOrder = item.pending_work_order;
  const isBlockedByWorkOrder = !!pendingWorkOrder && pendingWorkOrder.status !== "CLOSED";

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
          Bloqueado hasta que se cierre la Orden de Trabajo {pendingWorkOrder!.order_number}.
        </TooltipContent>
      </Tooltip>
    );
  }

  const needsWorkOrder = (status === "CRITICAL" || status === "OVERDUE") && !pendingWorkOrder;

  if (needsWorkOrder) {
    const params = new URLSearchParams({
      aircraft_id: String(aircraftId),
      maintenance_control_item_id: String(item.id),
      maintenance_control_id: String(controlId),
      task_description: `${item.name}${aircraftAcronym ? ` — ${aircraftAcronym}` : ""}: servicio en estado crítico del Control de Mantenimiento.`,
    });

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/${company}/planificacion/ordenes_trabajo/nueva_orden_trabajo?${params.toString()}`}>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-orange-600 hover:text-orange-700">
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
    <RegisterComplianceDialog
      itemId={item.id}
      itemName={item.name}
      aircraftId={aircraftId}
      defaultHours={defaultHours}
      defaultCycles={defaultCycles}
    />
  );
}

function MaintenanceItemsTable({
  items,
  showProvider,
  aircraft,
  dailyAverage,
  remainingPercentage,
  emptyLabel,
  company,
  controlId,
  realAircraftId,
  realAircraftAcronym,
}: {
  items: MaintenanceControlItem[];
  showProvider: boolean;
  aircraft: { flight_hours: number | string; flight_cycles: number | string };
  dailyAverage: ReturnType<typeof useGetAircraftDailyAverage>["data"];
  remainingPercentage: number;
  emptyLabel: string;
  company: string;
  controlId: string | number;
  realAircraftId: number | string;
  realAircraftAcronym?: string;
}) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className={COL.frequency}>Frecuencia</TableHead>
            <TableHead className={COL.applied}>Aplicada</TableHead>
            <TableHead className={COL.next}>Próximo</TableHead>
            <TableHead className={COL.remaining}>Remanente</TableHead>
            <TableHead className={COL.estimate}>Estimación</TableHead>
            {showProvider && <TableHead className={COL.provider}>Realizado Por</TableHead>}
            <TableHead className={COL.actions} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const computed = computeMaintenanceItem(item, aircraft, dailyAverage, remainingPercentage);
            const meta = STATUS_META[computed.status];
            return (
              <TableRow key={item.id} className={meta.row}>
                <TableCell className="font-medium">
                  <TruncatedText>{item.name}</TruncatedText>
                </TableCell>
                <TableCell className={cn(COL.frequency, "truncate")}>{computed.frequency}</TableCell>
                <TableCell className={COL.applied}>
                  <span className="block truncate">{computed.applied}</span>
                  {computed.appliedSub && (
                    <span className="block truncate text-xs text-muted-foreground">{computed.appliedSub}</span>
                  )}
                </TableCell>
                <TableCell className={cn(COL.next, "truncate")}>{computed.next}</TableCell>
                <TableCell className={cn(COL.remaining, "truncate")}>
                  <span className={cn("inline-flex items-center gap-1.5 font-semibold", meta.text)}>
                    <span className={cn("size-1.5 shrink-0 rounded-full", meta.dot)} />
                    {computed.remaining}
                  </span>
                </TableCell>
                <TableCell className={COL.estimate}>
                  <TruncatedText>{computed.estimate}</TruncatedText>
                </TableCell>
                {showProvider && (
                  <TableCell className={COL.provider}>
                    <TruncatedText>{computed.providerName}</TruncatedText>
                  </TableCell>
                )}
                <TableCell className={COL.actions}>
                  <ItemActionCell
                    item={item}
                    status={computed.status}
                    company={company}
                    controlId={controlId}
                    aircraftId={realAircraftId}
                    aircraftAcronym={realAircraftAcronym}
                    defaultHours={Number(aircraft.flight_hours ?? 0)}
                    defaultCycles={Number(aircraft.flight_cycles ?? 0)}
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
  const { data: control, isLoading, isError } = useGetMaintenanceControl(selectedCompany?.slug, id);
  const { data: dailyAverage } = useGetAircraftDailyAverage(selectedCompany?.slug, control?.aircraft?.acronym);

  if (isLoading) return <LoadingPage />;

  if (isError || !control) {
    return (
      <ContentLayout title="Control de Mantenimiento">
        <PageHeader className="mb-6" />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No se pudo cargar el control de mantenimiento.</AlertDescription>
        </Alert>
      </ContentLayout>
    );
  }

  const remainingPercentage = Number(control.remaining_percentage);
  const items = control.items ?? [];
  const parts = control.parts ?? [];
  const certificates = items.filter((i) => i.category === "CERTIFICATE");
  const aircraftServices = items.filter((i) => i.category === "SERVICE" && !i.maintenance_control_part_id);

  return (
    <ContentLayout title={control.title}>
      <PageHeader className="mb-6" currentLabel={control.title} />

      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">{control.title}</h1>
            {control.description && <p className="text-sm text-muted-foreground">{control.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <StatusLegend remainingPercentage={remainingPercentage} />
            <Link href={`/${company}/planificacion/control_mantenimiento/editar/${control.id}`}>
              <Button variant="outline" className="gap-2">
                <SquarePen className="size-4" />
                Editar
              </Button>
            </Link>
          </div>
        </header>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoSection title="Control">
              <InfoItem label="% Remanente para Alerta" value={`${remainingPercentage}%`} />
              <InfoItem label="Manual de Referencia" value={control.has_reference_manual ? control.reference_manual ?? undefined : undefined} />
            </InfoSection>

            <InfoSection title="Aeronave" bordered>
              <InfoItem label="Matrícula" value={control.aircraft?.acronym} />
              <InfoItem label="Marca" value={control.aircraft?.manufacturer?.name} />
              <InfoItem label="Modelo" value={control.aircraft?.model} />
              <InfoItem label="Serial" value={control.aircraft?.serial} />
              <InfoItem label="Horas Totales" value={`${fmtNumber(Number(control.aircraft?.flight_hours ?? 0))} hrs`} />
              <InfoItem label="Ciclos Totales" value={fmtNumber(Number(control.aircraft?.flight_cycles ?? 0))} />
              <InfoItem
                label={`Promedio Horas/Día (${dailyAverage?.days_considered ?? 30}d)`}
                value={dailyAverage ? `${fmtNumber(dailyAverage.daily_average_hours)} hrs` : undefined}
              />
              <InfoItem
                label={`Promedio Ciclos/Día (${dailyAverage?.days_considered ?? 30}d)`}
                value={dailyAverage ? fmtNumber(dailyAverage.daily_average_cycles) : undefined}
              />
            </InfoSection>

            {parts.map((part) => {
              const p = part.aircraft_part;
              return (
                <InfoSection key={part.id} title={p?.part_name || p?.part_number || "Parte"} bordered>
                  <InfoItem label="Tipo" value={p?.type} />
                  <InfoItem label="Número de Parte" value={p?.part_number} />
                  <InfoItem label="Serial" value={p?.serial} />
                  <InfoItem
                    label="TSN"
                    value={p?.time_since_new !== undefined && p?.time_since_new !== null ? `${fmtNumber(Number(p.time_since_new))} hrs` : undefined}
                  />
                  <InfoItem
                    label="CSN"
                    value={p?.cycles_since_new !== undefined && p?.cycles_since_new !== null ? fmtNumber(Number(p.cycles_since_new)) : undefined}
                  />
                </InfoSection>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Certificados</CardTitle>
          </CardHeader>
          <CardContent>
            <MaintenanceItemsTable
              items={certificates}
              showProvider={false}
              aircraft={control.aircraft}
              dailyAverage={dailyAverage}
              remainingPercentage={remainingPercentage}
              emptyLabel="Este control no tiene certificados registrados."
              company={company}
              controlId={control.id}
              realAircraftId={control.aircraft.id}
              realAircraftAcronym={control.aircraft?.acronym}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Servicios de la Aeronave</CardTitle>
          </CardHeader>
          <CardContent>
            <MaintenanceItemsTable
              items={aircraftServices}
              showProvider
              aircraft={control.aircraft}
              dailyAverage={dailyAverage}
              remainingPercentage={remainingPercentage}
              emptyLabel="Este control no tiene servicios de aeronave registrados."
              company={company}
              controlId={control.id}
              realAircraftId={control.aircraft.id}
              realAircraftAcronym={control.aircraft?.acronym}
            />
          </CardContent>
        </Card>

        {parts.map((part) => {
          const partItems = items.filter(
            (i) => String(i.maintenance_control_part_id) === String(part.id),
          );
          return (
            <Card key={part.id}>
              <CardHeader className="flex flex-row items-center gap-2">
                <CardTitle className="text-xl">
                  {part.aircraft_part?.part_name || part.aircraft_part?.part_number || "Parte"}
                </CardTitle>
                {part.aircraft_part?.type && <Badge variant="outline">{part.aircraft_part.type}</Badge>}
              </CardHeader>
              <CardContent>
                <MaintenanceItemsTable
                  items={partItems}
                  showProvider
                  // Las horas/ciclos "actuales" de un servicio de parte son
                  // los de la PARTE (TSN/CSN), no los totales de la
                  // aeronave — una parte más nueva que el avión no puede
                  // medirse contra las horas de éste. El ritmo de vuelo
                  // (dailyAverage) sí es el mismo, porque avión y parte
                  // instalada acumulan horas juntos por vuelo.
                  aircraft={{
                    flight_hours: part.aircraft_part?.time_since_new ?? 0,
                    flight_cycles: part.aircraft_part?.cycles_since_new ?? 0,
                  }}
                  dailyAverage={dailyAverage}
                  remainingPercentage={remainingPercentage}
                  emptyLabel="Esta parte no tiene servicios registrados."
                  company={company}
                  controlId={control.id}
                  realAircraftId={control.aircraft.id}
                  realAircraftAcronym={control.aircraft?.acronym}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ContentLayout>
  );
};

export default MaintenanceControlDetailPage;
