"use client";

import { useMemo, useState } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RegisterComponentComplianceDialog } from "@/components/dialogs/mantenimiento/planificacion/RegisterComponentComplianceDialog";
import { useGetComponentControl } from "@/hooks/mantenimiento/planificacion/useGetComponentControl";
import { useGetAircraftDailyAverage } from "@/hooks/mantenimiento/planificacion/useGetAircraftDailyAverage";
import { useCompanyStore } from "@/stores/CompanyStore";
import { computeMaintenanceItem, fmtNumber, ItemStatus, STATUS_META } from "@/lib/maintenanceControlCalc";
import { partTypeLabel, partTypeRank } from "@/lib/maintenancePartTypes";
import { COMPONENT_ACTION_LABELS, COMPONENT_CATEGORY_LABELS, COMPONENT_LIMIT_KIND_LABELS } from "@/lib/componentControlLabels";
import { FormSection, selectTriggerClass } from "@/components/forms/mantenimiento/planificacion/_theme";
import { ComponentControlItem, MaintenanceAircraftPart } from "@/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, Cog, Info, Plane, Search, SquarePen, Wrench } from "lucide-react";

function InfoItem({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold leading-tight">
        {value || <span className="font-normal italic text-muted-foreground">No especificado</span>}
      </p>
    </div>
  );
}

function InfoSection({ title, bordered = false, children }: { title: string; bordered?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn(bordered && "border-t border-slate-400/30 pt-3 dark:border-slate-600/30")}>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">{title}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-6">{children}</div>
    </div>
  );
}

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

const UNIT_SHORT: Record<string, string> = { HOURS: "hrs", CYCLES: "cic", DAYS: "días" };

/**
 * Mismo ciclo que el Control de Mantenimiento: crítico/vencido sin OT →
 * crear OT (queda atada al componente); OT abierta → bloqueado; si no,
 * registrar cumplimiento (con la OT pendiente precargada si la hubo).
 */
function ItemActionCell({
  item,
  status,
  company,
  controlId,
  aircraftId,
  aircraftAcronym,
  parentHours,
  parentCycles,
}: {
  item: ComponentControlItem;
  status: ItemStatus;
  company: string;
  controlId: string | number;
  aircraftId: number | string;
  aircraftAcronym?: string;
  parentHours: number;
  parentCycles: number;
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
        <TooltipContent>Bloqueado hasta que se cierre la Orden de Trabajo {pendingWorkOrder!.order_number}.</TooltipContent>
      </Tooltip>
    );
  }

  const needsWorkOrder = (status === "CRITICAL" || status === "OVERDUE") && !pendingWorkOrder;

  if (needsWorkOrder) {
    const params = new URLSearchParams({
      aircraft_id: String(aircraftId),
      component_control_item_id: String(item.id),
      component_control_id: String(controlId),
      task_description: `${item.description} (P/N ${item.part_number}, S/N ${item.serial})${aircraftAcronym ? ` — ${aircraftAcronym}` : ""}: ${COMPONENT_ACTION_LABELS[item.action].toLowerCase()} por vencimiento del Control de Componentes.`,
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
    <RegisterComponentComplianceDialog
      itemId={item.id}
      itemName={`${item.description} — P/N ${item.part_number} · S/N ${item.serial}`}
      aircraftId={aircraftId}
      defaultAction={item.action}
      defaultHours={parentHours}
      defaultCycles={parentCycles}
      pendingWorkOrder={pendingWorkOrder ?? null}
    />
  );
}

const COL = {
  limit: "w-[120px]",
  applied: "w-[125px]",
  since: "w-[110px]",
  next: "w-[120px]",
  remaining: "w-[150px]",
  estimate: "w-[115px]",
  provider: "w-[140px]",
  workOrder: "w-[110px]",
  actions: "w-[44px]",
};

function ComponentsTable({
  items,
  parentHours,
  parentCycles,
  emptyLabel,
  company,
  controlId,
  aircraftId,
  aircraftAcronym,
}: {
  items: ComponentControlItem[];
  parentHours: number;
  parentCycles: number;
  emptyLabel: string;
  company: string;
  controlId: string | number;
  aircraftId: number | string;
  aircraftAcronym?: string;
}) {
  if (!items.length) {
    return <p className="text-sm italic text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-400/40 dark:border-slate-600/40">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="bg-muted/40 font-semibold">Componente</TableHead>
            <TableHead className={cn(COL.limit, "bg-muted/40 font-semibold")}>Límite</TableHead>
            <TableHead className={cn(COL.applied, "bg-muted/40 font-semibold")}>Último Cump.</TableHead>
            <TableHead className={cn(COL.since, "bg-muted/40 font-semibold")}>Desde OH</TableHead>
            <TableHead className={cn(COL.next, "bg-muted/40 font-semibold")}>Próximo</TableHead>
            <TableHead className={cn(COL.remaining, "bg-muted/40 font-semibold")}>Remanente</TableHead>
            <TableHead className={cn(COL.estimate, "bg-muted/40 font-semibold")}>Estimación</TableHead>
            <TableHead className={cn(COL.provider, "bg-muted/40 font-semibold")}>Realizado Por</TableHead>
            <TableHead className={cn(COL.workOrder, "bg-muted/40 font-semibold")}>OT en curso</TableHead>
            <TableHead className={cn(COL.actions, "bg-muted/40")} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const computed = computeMaintenanceItem(item);
            const meta = STATUS_META[computed.status];
            const pending = item.pending_work_order;
            const lastWorkOrder = item.latest_compliance?.work_order?.order_number;
            return (
              <TableRow key={item.id} className={cn(meta.row, "transition-colors hover:bg-primary/[0.03]")}>
                <TableCell className="font-medium">
                  <TruncatedText>{item.description}</TruncatedText>
                  <span className="block truncate text-xs text-muted-foreground">
                    P/N {item.part_number} · S/N {item.serial}
                    {item.position ? ` · ${item.position}` : ""}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-1">
                    <Badge variant="outline" className="text-[10px]">{COMPONENT_CATEGORY_LABELS[item.category]}</Badge>
                    <Badge variant="outline" className="text-[10px]">{COMPONENT_ACTION_LABELS[item.action]}</Badge>
                    {item.is_hazardous && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center rounded border border-amber-500/40 bg-amber-500/10 px-1 text-[10px] text-amber-700 dark:text-amber-400">
                            <AlertTriangle className="mr-0.5 size-3" />
                            MP
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Mercancía peligrosa</TooltipContent>
                      </Tooltip>
                    )}
                  </span>
                </TableCell>
                <TableCell className={cn(COL.limit, "truncate")}>
                  <span className="block truncate">{computed.frequency}</span>
                  {computed.extras.map((extra, i) => (
                    <span key={i} className="block truncate text-xs text-muted-foreground">Ó {extra.frequency}</span>
                  ))}
                  <span className="block truncate text-[10px] text-muted-foreground/70">
                    {item.intervals.map((iv) => COMPONENT_LIMIT_KIND_LABELS[iv.limit_kind]).filter((v, i, a) => a.indexOf(v) === i).join(" · ")}
                  </span>
                </TableCell>
                <TableCell className={COL.applied}>
                  <span className="block truncate">{computed.applied}</span>
                  {computed.appliedSub && <span className="block truncate text-xs text-muted-foreground">Padre: {computed.appliedSub}</span>}
                  {lastWorkOrder && (
                    <Link
                      href={`/${company}/planificacion/ordenes_trabajo/${lastWorkOrder}`}
                      className="block truncate text-xs text-primary hover:underline"
                    >
                      {lastWorkOrder}
                    </Link>
                  )}
                </TableCell>
                <TableCell className={cn(COL.since, "truncate")}>
                  {(item.computed?.intervals ?? []).map((iv, i) => (
                    <span key={i} className={cn("block truncate", i > 0 && "text-xs text-muted-foreground")}>
                      {iv.since_event_value !== null ? `${fmtNumber(iv.since_event_value)} ${UNIT_SHORT[iv.counting_method]}` : "—"}
                    </span>
                  ))}
                </TableCell>
                <TableCell className={cn(COL.next, "truncate")}>
                  <span className="block truncate">{computed.next}</span>
                  {computed.extras.map((extra, i) => (
                    <span key={i} className="block truncate text-xs text-muted-foreground">{extra.next}</span>
                  ))}
                </TableCell>
                <TableCell className={cn(COL.remaining, "truncate")}>
                  <span className={cn("inline-flex items-center gap-1.5 font-semibold", meta.text)}>
                    <span className={cn("size-1.5 shrink-0 rounded-full", meta.dot)} />
                    {computed.remaining}
                  </span>
                  {computed.extras.map((extra, i) => (
                    <span key={i} className={cn("block truncate text-xs", extra.status ? STATUS_META[extra.status].text : "text-muted-foreground")}>
                      {extra.remaining}
                    </span>
                  ))}
                </TableCell>
                <TableCell className={COL.estimate}>
                  <TruncatedText>{computed.estimate}</TruncatedText>
                  {computed.extras.map((extra, i) => (
                    <span key={i} className="block truncate text-xs text-muted-foreground">{extra.estimate}</span>
                  ))}
                </TableCell>
                <TableCell className={COL.provider}>
                  <TruncatedText>{computed.providerName}</TruncatedText>
                </TableCell>
                <TableCell className={COL.workOrder}>
                  {pending && pending.status !== "CLOSED" ? (
                    <Link href={`/${company}/planificacion/ordenes_trabajo/${pending.order_number}`} className="truncate text-primary hover:underline">
                      {pending.order_number}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className={COL.actions}>
                  <ItemActionCell
                    item={item}
                    status={computed.status}
                    company={company}
                    controlId={controlId}
                    aircraftId={aircraftId}
                    aircraftAcronym={aircraftAcronym}
                    parentHours={parentHours}
                    parentCycles={parentCycles}
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

const ComponentControlDetailPage = () => {
  const { id, company } = useParams<{ id: string; company: string }>();
  const { selectedCompany } = useCompanyStore();
  const { data: control, isLoading, isError } = useGetComponentControl(selectedCompany?.slug, id);
  const { data: dailyAverage } = useGetAircraftDailyAverage(selectedCompany?.slug, control?.aircraft?.acronym);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [onlyHazardous, setOnlyHazardous] = useState(false);

  const activeItems = useMemo(() => (control?.items ?? []).filter((i) => i.status === "ACTIVE"), [control]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return activeItems.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (onlyHazardous && !item.is_hazardous) return false;
      if (status !== "all" && computeMaintenanceItem(item).status !== status) return false;
      if (needle) {
        const haystack = [item.description, item.part_number, item.serial, item.position].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [activeItems, category, onlyHazardous, status, search]);

  if (isLoading) return <LoadingPage />;

  if (isError || !control) {
    return (
      <ContentLayout title="Control de Componentes">
        <PageHeader className="mb-6" />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No se pudo cargar el control de componentes.</AlertDescription>
        </Alert>
      </ContentLayout>
    );
  }

  const remainingPercentage = Number(control.remaining_percentage);

  // Padres presentes entre los componentes, ordenados motor → hélice → resto y
  // numerados por tipo ("Motor 1 - serial"), igual que el Control de Mantenimiento.
  const parentsById = new Map<string, MaintenanceAircraftPart>();
  activeItems.forEach((item) => {
    if (item.parent_aircraft_part && item.parent_aircraft_part_id) {
      parentsById.set(String(item.parent_aircraft_part_id), item.parent_aircraft_part);
    }
  });
  const counters: Record<string, number> = {};
  const parents = Array.from(parentsById.entries())
    .sort(([, a], [, b]) => partTypeRank(a.type) - partTypeRank(b.type))
    .map(([partId, part]) => {
      const type = (part.type ?? "").toUpperCase();
      counters[type] = (counters[type] ?? 0) + 1;
      return { id: partId, part, label: `${partTypeLabel(part.type)} ${counters[type]}${part.serial ? ` - ${part.serial}` : ""}` };
    });

  const fuselageItems = filtered.filter((i) => !i.parent_aircraft_part_id);
  const aircraftHours = Number(control.aircraft?.flight_hours ?? 0);
  const aircraftCycles = Number(control.aircraft?.flight_cycles ?? 0);

  return (
    <ContentLayout title={control.title}>
      <div className="flex flex-col gap-6">
        <PageHeader currentLabel={control.title} />

        <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col">
            <h1 className="text-3xl font-semibold tracking-tight">{control.title}</h1>
            {control.description && <p className="text-sm text-muted-foreground">{control.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <StatusLegend remainingPercentage={remainingPercentage} />
            <ActionTriggerButton asChild>
              <Link href={`/${company}/planificacion/control_componentes/editar/${control.id}`}>
                <SquarePen className="mr-2 size-4" />
                Editar
              </Link>
            </ActionTriggerButton>
          </div>
        </div>

        <FormSection icon={Info} title="Información General">
          <div className="space-y-3">
            <InfoSection title="Control">
              <InfoItem label="% Remanente para Alerta" value={`${remainingPercentage}%`} />
              <InfoItem label="Manual de Referencia" value={control.has_reference_manual ? control.reference_manual ?? undefined : undefined} />
              <InfoItem label="Componentes activos" value={activeItems.length} />
            </InfoSection>

            <InfoSection title="Aeronave" bordered>
              <InfoItem label="Matrícula" value={control.aircraft?.acronym} />
              <InfoItem label="Marca" value={control.aircraft?.manufacturer?.name} />
              <InfoItem label="Modelo" value={control.aircraft?.model} />
              <InfoItem label="Serial" value={control.aircraft?.serial} />
              <InfoItem label="Horas Totales" value={`${fmtNumber(aircraftHours)} hrs`} />
              <InfoItem label="Ciclos Totales" value={fmtNumber(aircraftCycles)} />
              <InfoItem
                label={`Promedio Horas/Día (${dailyAverage?.days_considered ?? 30}d)`}
                value={dailyAverage ? `${fmtNumber(dailyAverage.daily_average_hours)} hrs` : undefined}
              />
              <InfoItem
                label={`Promedio Ciclos/Día (${dailyAverage?.days_considered ?? 30}d)`}
                value={dailyAverage ? fmtNumber(dailyAverage.daily_average_cycles) : undefined}
              />
            </InfoSection>

            {parents.map(({ id: partId, part, label }) => (
              <InfoSection key={partId} title={label} bordered>
                <InfoItem label="Tipo" value={partTypeLabel(part.type)} />
                <InfoItem label="Número de Parte" value={part.part_number} />
                <InfoItem label="Serial" value={part.serial} />
                <InfoItem label="TSN" value={part.time_since_new != null ? `${fmtNumber(Number(part.time_since_new))} hrs` : undefined} />
                <InfoItem label="CSN" value={part.cycles_since_new != null ? fmtNumber(Number(part.cycles_since_new)) : undefined} />
              </InfoSection>
            ))}
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
            <SelectTrigger className={cn(selectTriggerClass, "w-full sm:w-56")}>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {Object.entries(COMPONENT_CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className={cn(selectTriggerClass, "w-full sm:w-48")}>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {(Object.keys(STATUS_META) as ItemStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
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

        <FormSection icon={Plane} title="Fuselaje" hint="Componentes medidos contra las horas/ciclos de la aeronave.">
          <ComponentsTable
            items={fuselageItems}
            parentHours={aircraftHours}
            parentCycles={aircraftCycles}
            emptyLabel="Ningún componente del fuselaje coincide con el filtro."
            company={company}
            controlId={control.id}
            aircraftId={control.aircraft.id}
            aircraftAcronym={control.aircraft?.acronym}
          />
        </FormSection>

        {parents.map(({ id: partId, part, label }) => (
          <FormSection key={partId} icon={Cog} title={label} hint={`Componentes medidos contra el TSN/CSN de ${label}.`}>
            <ComponentsTable
              items={filtered.filter((i) => String(i.parent_aircraft_part_id) === partId)}
              parentHours={Number(part.time_since_new ?? 0)}
              parentCycles={Number(part.cycles_since_new ?? 0)}
              emptyLabel="Ningún componente de esta parte coincide con el filtro."
              company={company}
              controlId={control.id}
              aircraftId={control.aircraft.id}
              aircraftAcronym={control.aircraft?.acronym}
            />
          </FormSection>
        ))}
      </div>
    </ContentLayout>
  );
};

export default ComponentControlDetailPage;
