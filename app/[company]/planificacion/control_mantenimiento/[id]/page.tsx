"use client";

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
import { useGetMaintenanceControl } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceControl";
import { useGetAircraftDailyAverage } from "@/hooks/mantenimiento/planificacion/useGetAircraftDailyAverage";
import { useCompanyStore } from "@/stores/CompanyStore";
import { computeMaintenanceItem, ItemStatus } from "@/lib/maintenanceControlCalc";
import { MaintenanceControlItem } from "@/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info, SquarePen } from "lucide-react";

function InfoItem({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">
        {value || <span className="text-muted-foreground italic">No especificado</span>}
      </p>
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

function MaintenanceItemsTable({
  items,
  showProvider,
  aircraft,
  dailyAverage,
  remainingPercentage,
  emptyLabel,
}: {
  items: MaintenanceControlItem[];
  showProvider: boolean;
  aircraft: { flight_hours: number | string; flight_cycles: number | string };
  dailyAverage: ReturnType<typeof useGetAircraftDailyAverage>["data"];
  remainingPercentage: number;
  emptyLabel: string;
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
                    <TruncatedText>{item.maintenance_provider?.name ?? "—"}</TruncatedText>
                  </TableCell>
                )}
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
      <PageHeader className="mb-6" />

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
          <CardHeader>
            <CardTitle className="text-xl">Información de la Aeronave</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <InfoItem label="Matrícula" value={control.aircraft?.acronym} />
            <InfoItem label="Marca" value={control.aircraft?.manufacturer?.name} />
            <InfoItem label="Modelo" value={control.aircraft?.model} />
            <InfoItem label="Serial" value={control.aircraft?.serial} />
            <InfoItem label="Horas Totales" value={Number(control.aircraft?.flight_hours ?? 0).toLocaleString("es-VE", { maximumFractionDigits: 2 })} />
            <InfoItem label="Ciclos Totales" value={Number(control.aircraft?.flight_cycles ?? 0).toLocaleString("es-VE")} />
            <InfoItem label="% Remanente para Alerta" value={`${remainingPercentage}%`} />
            <InfoItem label="Manual de Referencia" value={control.has_reference_manual ? control.reference_manual ?? undefined : undefined} />
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
                  aircraft={control.aircraft}
                  dailyAverage={dailyAverage}
                  remainingPercentage={remainingPercentage}
                  emptyLabel="Esta parte no tiene servicios registrados."
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
