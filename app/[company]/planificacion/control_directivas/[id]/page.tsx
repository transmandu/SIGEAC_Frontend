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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RegisterDirectiveComplianceDialog } from "@/components/dialogs/mantenimiento/planificacion/RegisterDirectiveComplianceDialog";
import { useGetDirectiveControl } from "@/hooks/mantenimiento/planificacion/useGetDirectiveControl";
import { useCompanyStore } from "@/stores/CompanyStore";
import { computeMaintenanceItem, fmtNumber, ItemStatus, STATUS_META } from "@/lib/maintenanceControlCalc";
import { DIRECTIVE_APPLICABILITY_LABELS, DIRECTIVE_AUTHORITY_LABELS, DIRECTIVE_COMPLIANCE_TYPE_LABELS } from "@/lib/directiveControlLabels";
import { partTypeLabel, partTypeRank } from "@/lib/maintenancePartTypes";
import { FormSection, selectTriggerClass } from "@/components/forms/mantenimiento/planificacion/_theme";
import { DirectiveApplicability, DirectiveControlItem, MaintenanceAircraftPart } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock, Info, Search, ShieldAlert, SquarePen, Wrench } from "lucide-react";

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

const APPLICABILITY_BADGE: Record<DirectiveApplicability, string> = {
  PENDING_ANALYSIS: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  APPLICABLE: "border-primary/30 bg-primary/10 text-primary",
  NOT_APPLICABLE: "border-slate-400/40 bg-muted/60 text-muted-foreground",
  SUPERSEDED: "border-slate-400/40 bg-muted/60 text-muted-foreground line-through",
};

/**
 * Mismo ciclo que los otros controles. Una AD aplicable sin plazo también
 * puede registrar cumplimiento (el backend solo exige que sea aplicable y no
 * esté cerrada).
 */
function ItemActionCell({
  item,
  status,
  company,
  controlId,
  aircraftId,
  aircraftAcronym,
  currentHours,
  currentCycles,
}: {
  item: DirectiveControlItem;
  status: ItemStatus | null;
  company: string;
  controlId: string | number;
  aircraftId: number | string;
  aircraftAcronym?: string;
  currentHours: number;
  currentCycles: number;
}) {
  if (!item.id || item.applicability !== "APPLICABLE" || item.complied_at) return null;

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

  if ((status === "CRITICAL" || status === "OVERDUE") && !pendingWorkOrder) {
    const params = new URLSearchParams({
      aircraft_id: String(aircraftId),
      directive_control_item_id: String(item.id),
      directive_control_id: String(controlId),
      task_description: `AD ${item.ad_number}${item.revision ? ` ${item.revision}` : ""} (${DIRECTIVE_AUTHORITY_LABELS[item.authority]})${aircraftAcronym ? ` — ${aircraftAcronym}` : ""}: ${item.description}${item.compliance_method ? `. Método: ${item.compliance_method}` : ""}.`,
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
    <RegisterDirectiveComplianceDialog
      itemId={item.id}
      itemName={`AD ${item.ad_number} — ${item.description}`}
      defaultMethod={item.compliance_method}
      aircraftId={aircraftId}
      defaultHours={currentHours}
      defaultCycles={currentCycles}
      pendingWorkOrder={pendingWorkOrder ?? null}
    />
  );
}

const COL = {
  parent: "w-[130px]",
  applicability: "w-[150px]",
  type: "w-[95px]",
  limit: "w-[110px]",
  applied: "w-[125px]",
  next: "w-[115px]",
  remaining: "w-[150px]",
  provider: "w-[140px]",
  workOrder: "w-[110px]",
  actions: "w-[44px]",
};

const DirectiveControlDetailPage = () => {
  const { id, company } = useParams<{ id: string; company: string }>();
  const { selectedCompany } = useCompanyStore();
  const { data: control, isLoading, isError } = useGetDirectiveControl(selectedCompany?.slug, id);

  const [search, setSearch] = useState("");
  const [applicability, setApplicability] = useState("all");
  const [authority, setAuthority] = useState("all");
  const [status, setStatus] = useState("all");

  const items = useMemo(() => control?.items ?? [], [control]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((item) => {
      if (applicability !== "all" && item.applicability !== applicability) return false;
      if (authority !== "all" && item.authority !== authority) return false;
      if (status === "COMPLIED" && !item.complied_at) return false;
      if (status !== "all" && status !== "COMPLIED" && item.computed?.status !== status) return false;
      if (needle) {
        const haystack = [item.ad_number, item.description, item.reference_document, item.applicability_notes].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [items, applicability, authority, status, search]);

  if (isLoading) return <LoadingPage />;

  if (isError || !control) {
    return (
      <ContentLayout title="Control de Directivas">
        <PageHeader className="mb-6" />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No se pudo cargar el control de directivas.</AlertDescription>
        </Alert>
      </ContentLayout>
    );
  }

  const remainingPercentage = Number(control.remaining_percentage);
  const aircraftHours = Number(control.aircraft?.flight_hours ?? 0);
  const aircraftCycles = Number(control.aircraft?.flight_cycles ?? 0);

  // Conjuntos presentes entre las AD, numerados por tipo ("Motor 1 - serial")
  // igual que en los otros controles.
  const parentsById = new Map<string, MaintenanceAircraftPart>();
  items.forEach((item) => {
    if (item.parent_aircraft_part && item.parent_aircraft_part_id) {
      parentsById.set(String(item.parent_aircraft_part_id), item.parent_aircraft_part);
    }
  });
  const counters: Record<string, number> = {};
  const parentLabels = new Map<string, string>();
  Array.from(parentsById.entries())
    .sort(([, a], [, b]) => partTypeRank(a.type) - partTypeRank(b.type))
    .forEach(([partId, part]) => {
      const type = (part.type ?? "").toUpperCase();
      counters[type] = (counters[type] ?? 0) + 1;
      parentLabels.set(partId, `${partTypeLabel(part.type)} ${counters[type]}${part.serial ? ` - ${part.serial}` : ""}`);
    });

  const applicableCount = items.filter((i) => i.applicability === "APPLICABLE").length;
  const pendingAnalysisCount = items.filter((i) => i.applicability === "PENDING_ANALYSIS").length;
  const compliedCount = items.filter((i) => i.complied_at).length;

  return (
    <ContentLayout title={control.title}>
      <div className="flex flex-col gap-6">
        <PageHeader currentLabel={control.title} />

        <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col">
            <h1 className="text-3xl font-semibold tracking-tight">{control.title}</h1>
            {control.description && <p className="text-sm text-muted-foreground">{control.description}</p>}
          </div>
          <ActionTriggerButton asChild>
            <Link href={`/${company}/planificacion/control_directivas/editar/${control.id}`}>
              <SquarePen className="mr-2 size-4" />
              Editar
            </Link>
          </ActionTriggerButton>
        </div>

        <FormSection icon={Info} title="Información General">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-6">
            <InfoItem label="Matrícula" value={control.aircraft?.acronym} />
            <InfoItem label="Marca" value={control.aircraft?.manufacturer?.name} />
            <InfoItem label="Modelo" value={control.aircraft?.model} />
            <InfoItem label="Serial" value={control.aircraft?.serial} />
            <InfoItem label="Horas Totales" value={`${fmtNumber(aircraftHours)} hrs`} />
            <InfoItem label="Ciclos Totales" value={fmtNumber(aircraftCycles)} />
            <InfoItem label="% Remanente para Alerta" value={`${remainingPercentage}%`} />
            <InfoItem label="Manual de Referencia" value={control.has_reference_manual ? control.reference_manual ?? undefined : undefined} />
            <InfoItem label="AD evaluadas" value={items.length} />
            <InfoItem label="Aplicables" value={applicableCount} />
            <InfoItem label="Cumplidas (única vez)" value={compliedCount} />
            <InfoItem label="Pendientes de análisis" value={pendingAnalysisCount} />
          </div>
        </FormSection>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por N° de AD o asunto..." className="h-10 pl-9 text-sm" />
          </div>
          <Select value={applicability} onValueChange={setApplicability}>
            <SelectTrigger className={cn(selectTriggerClass, "w-full sm:w-52")}>
              <SelectValue placeholder="Aplicabilidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda aplicabilidad</SelectItem>
              {Object.entries(DIRECTIVE_APPLICABILITY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={authority} onValueChange={setAuthority}>
            <SelectTrigger className={cn(selectTriggerClass, "w-full sm:w-40")}>
              <SelectValue placeholder="Autoridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda autoridad</SelectItem>
              {Object.entries(DIRECTIVE_AUTHORITY_LABELS).map(([value, label]) => (
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
              <SelectItem value="COMPLIED">Cumplidas</SelectItem>
              {(Object.keys(STATUS_META) as ItemStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FormSection icon={ShieldAlert} title="Directivas de Aeronavegabilidad" hint="Una fila por AD y conjunto; las no aplicables y supersedidas quedan registradas con su motivo (Formulario INAC 39-001).">
          {!filtered.length ? (
            <p className="text-sm italic text-muted-foreground">Ninguna directiva coincide con el filtro.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-400/40 dark:border-slate-600/40">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="bg-muted/40 font-semibold">Directiva</TableHead>
                    <TableHead className={cn(COL.parent, "bg-muted/40 font-semibold")}>Conjunto</TableHead>
                    <TableHead className={cn(COL.applicability, "bg-muted/40 font-semibold")}>Aplicabilidad</TableHead>
                    <TableHead className={cn(COL.type, "bg-muted/40 font-semibold")}>Tipo</TableHead>
                    <TableHead className={cn(COL.limit, "bg-muted/40 font-semibold")}>Plazo</TableHead>
                    <TableHead className={cn(COL.applied, "bg-muted/40 font-semibold")}>Último Cump.</TableHead>
                    <TableHead className={cn(COL.next, "bg-muted/40 font-semibold")}>Próximo</TableHead>
                    <TableHead className={cn(COL.remaining, "bg-muted/40 font-semibold")}>Remanente</TableHead>
                    <TableHead className={cn(COL.provider, "bg-muted/40 font-semibold")}>Realizado Por</TableHead>
                    <TableHead className={cn(COL.workOrder, "bg-muted/40 font-semibold")}>OT en curso</TableHead>
                    <TableHead className={cn(COL.actions, "bg-muted/40")} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => {
                    const computed = item.computed ? computeMaintenanceItem(item) : null;
                    const meta = computed ? STATUS_META[computed.status] : null;
                    const pending = item.pending_work_order;
                    const lastCompliance = item.latest_compliance;
                    const lastWorkOrder = lastCompliance?.work_order?.order_number;
                    const parentLabel = item.parent_aircraft_part_id ? parentLabels.get(String(item.parent_aircraft_part_id)) ?? "Parte" : "Fuselaje";
                    const isApplicable = item.applicability === "APPLICABLE";

                    // Los contadores del reloj son los del conjunto afectado, no siempre los de la aeronave.
                    const currentHours = item.parent_aircraft_part ? Number(item.parent_aircraft_part.time_since_new ?? 0) : aircraftHours;
                    const currentCycles = item.parent_aircraft_part ? Number(item.parent_aircraft_part.cycles_since_new ?? 0) : aircraftCycles;

                    return (
                      <TableRow key={item.id} className={cn(meta?.row, "transition-colors hover:bg-primary/[0.03]")}>
                        <TableCell className="align-top font-medium">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate">AD {item.ad_number}{item.revision ? ` ${item.revision}` : ""}</span>
                            <Badge variant="outline" className="shrink-0 text-[10px]">{DIRECTIVE_AUTHORITY_LABELS[item.authority]}</Badge>
                          </span>
                          <TruncatedText>{item.description}</TruncatedText>
                          {item.reference_document && <span className="block truncate text-xs text-muted-foreground">{item.reference_document}</span>}
                          {item.compliance_method && <span className="block truncate text-xs text-muted-foreground">Método: {item.compliance_method}</span>}
                        </TableCell>
                        <TableCell className={cn(COL.parent, "align-top")}>
                          <TruncatedText>{parentLabel}</TruncatedText>
                        </TableCell>
                        <TableCell className={cn(COL.applicability, "align-top")}>
                          <Badge variant="outline" className={cn("rounded-md text-[10px] shadow-none", APPLICABILITY_BADGE[item.applicability])}>
                            {DIRECTIVE_APPLICABILITY_LABELS[item.applicability]}
                          </Badge>
                          {item.applicability_notes && (
                            <span className="mt-1 block text-xs text-muted-foreground">
                              <TruncatedText>{item.applicability_notes}</TruncatedText>
                            </span>
                          )}
                        </TableCell>
                        <TableCell className={cn(COL.type, "truncate align-top")}>{DIRECTIVE_COMPLIANCE_TYPE_LABELS[item.compliance_type]}</TableCell>

                        {computed ? (
                          <>
                            <TableCell className={cn(COL.limit, "truncate")}>
                              <span className="block truncate">{computed.frequency}</span>
                              {computed.extras.map((extra, i) => (
                                <span key={i} className="block truncate text-xs text-muted-foreground">Ó {extra.frequency}</span>
                              ))}
                            </TableCell>
                            <TableCell className={COL.applied}>
                              <span className="block truncate">{computed.applied}</span>
                              {item.compliance_type === "ONE_TIME" && <span className="block truncate text-xs italic text-muted-foreground">Fecha de referencia</span>}
                              {lastWorkOrder && (
                                <Link href={`/${company}/planificacion/ordenes_trabajo/${lastWorkOrder}`} className="block truncate text-xs text-primary hover:underline">
                                  {lastWorkOrder}
                                </Link>
                              )}
                            </TableCell>
                            <TableCell className={cn(COL.next, "truncate")}>
                              <span className="block truncate">{computed.next}</span>
                              {computed.extras.map((extra, i) => (
                                <span key={i} className="block truncate text-xs text-muted-foreground">{extra.next}</span>
                              ))}
                            </TableCell>
                            <TableCell className={cn(COL.remaining, "truncate")}>
                              <span className={cn("inline-flex items-center gap-1.5 font-semibold", meta!.text)}>
                                <span className={cn("size-1.5 shrink-0 rounded-full", meta!.dot)} />
                                {computed.remaining}
                              </span>
                              {computed.extras.map((extra, i) => (
                                <span key={i} className={cn("block truncate text-xs", extra.status ? STATUS_META[extra.status].text : "text-muted-foreground")}>
                                  {extra.remaining}
                                </span>
                              ))}
                            </TableCell>
                            <TableCell className={COL.provider}>
                              <TruncatedText>{computed.providerName}</TruncatedText>
                            </TableCell>
                          </>
                        ) : item.complied_at ? (
                          <>
                            <TableCell className={cn(COL.limit, "text-sm text-muted-foreground")}>—</TableCell>
                            <TableCell className={COL.applied}>
                              <span className="block truncate">{formatDate(item.complied_at)}</span>
                              {lastWorkOrder && (
                                <Link href={`/${company}/planificacion/ordenes_trabajo/${lastWorkOrder}`} className="block truncate text-xs text-primary hover:underline">
                                  {lastWorkOrder}
                                </Link>
                              )}
                            </TableCell>
                            <TableCell colSpan={2} className="text-sm">
                              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="size-3.5 shrink-0" />
                                Cumplida
                              </span>
                              {lastCompliance?.compliance_method && <span className="block truncate text-xs text-muted-foreground">{lastCompliance.compliance_method}</span>}
                            </TableCell>
                            <TableCell className={COL.provider}>
                              <TruncatedText>{lastCompliance?.maintenance_provider?.name ?? "—"}</TruncatedText>
                            </TableCell>
                          </>
                        ) : (
                          <TableCell colSpan={5} className="text-sm text-muted-foreground">
                            {isApplicable
                              ? "Aplicable sin plazo definido — registre el cumplimiento cuando se ejecute."
                              : item.applicability === "PENDING_ANALYSIS"
                                ? "Pendiente de evaluar si aplica a esta aeronave/conjunto."
                                : "Sin seguimiento — queda registrada con su motivo para el 39-001."}
                          </TableCell>
                        )}

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
                            status={computed?.status ?? null}
                            company={company}
                            controlId={control.id}
                            aircraftId={control.aircraft.id}
                            aircraftAcronym={control.aircraft?.acronym}
                            currentHours={currentHours}
                            currentCycles={currentCycles}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </FormSection>
      </div>
    </ContentLayout>
  );
};

export default DirectiveControlDetailPage;
