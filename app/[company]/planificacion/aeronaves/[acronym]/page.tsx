"use client";
import { RecordAuditHistory } from "@/components/planificacion/auditoria/RecordAuditHistory";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import React from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

import { useCompanyStore } from "@/stores/CompanyStore";
import {
  Calendar,
  ChevronRight,
  Factory,
  FileText,
  Archive,
  Gauge,
  Hash,
  Layers,
  MapPin,
  Plane,
  Puzzle,
} from "lucide-react";
import { useParams } from "next/navigation";
import LoadingPage from "@/components/misc/LoadingPage";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetMaintenanceAircraftByAcronym } from "@/hooks/mantenimiento/planificacion/useGetMaitenanceAircraftByAcronym";
import type { MaintenanceAircraftPart } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatNumber } from "@/lib/formatNumber";
import { partLabel } from "@/app/[company]/planificacion/aeronaves/_components/partLabel";
import { removalReadings } from "@/app/[company]/planificacion/aeronaves/_components/removalReadings";

// ---------- helpers ----------
const labelFor = (obj: any): string => {
  if (!obj) return "—";
  if (typeof obj === "string") return obj;
  const candidates = ["name", "title", "acronym", "code", "id"];
  for (const k of candidates) if (k in obj && obj[k]) return String(obj[k]);
  return JSON.stringify(obj);
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    const date = parseISO(iso);
    return format(date, "PPP", { locale: es });
  } catch {
    return String(iso);
  }
};

const fmtNumber = (n: unknown) =>
  formatNumber(n, { minDecimals: 2, maxDecimals: 2, fallback: "—" });

// 0 es un valor válido; solo null/undefined/"" significan "no aplica".
const fmtCounter = (n: unknown) =>
  n === null || n === undefined || n === ""
    ? "No aplica"
    : formatNumber(n, {
        minDecimals: 2,
        maxDecimals: 2,
        fallback: "No aplica",
      });

type InstalledPart = MaintenanceAircraftPart & {
  assigned_date?: string | Date | null;
};

const Detail = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col">
    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
    <span className="text-sm">{value || "—"}</span>
  </div>
);

const Stat = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
}) => (
  <Card className="border-dashed">
    <CardHeader className="py-3">
      <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
        <Icon className="h-4 w-4" /> {label}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
    </CardContent>
  </Card>
);

const PartRow = ({
  p,
  depth = 0,
  index = 0,
}: {
  p: InstalledPart;
  depth?: number;
  index?: number;
}) => {
  const hasChildren = p.sub_parts && p.sub_parts.length > 0;
  return (
    <AccordionItem
      value={`${p.id ?? p.part_number}-${depth}-${index}`}
      className="border-none"
    >
      <AccordionTrigger className="px-0 hover:no-underline">
        <div className="flex items-start gap-3 w-full">
          <div className="min-w-4 mt-1" style={{ paddingLeft: depth * 12 }}>
            <ChevronRight className="h-4 w-4 opacity-60" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Puzzle className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium truncate">{partLabel(p)}</span>
              {depth === 0 && p.part_order ? (
                <Badge variant="secondary" className="text-[10px]">
                  N° {p.part_order}
                </Badge>
              ) : null}
              <Badge variant="outline" className="font-mono text-[10px]">
                PN: {p.part_number}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <Gauge className="h-3 w-3" /> TSN:{" "}
                {fmtCounter(p.time_since_new)}
              </span>
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3" /> CSN:{" "}
                {fmtCounter(p.cycles_since_new)}
              </span>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-7">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-3">
          <Detail label="Serial" value={p.serial} />
          <Detail
            label="Condición"
            value={
              p.condition_type === "OVERHAULED" ? "Reacondicionada" : "Nueva"
            }
          />
          <Detail label="ATA" value={p.ata_chapter} />
          <Detail label="Posición" value={p.position} />
          <Detail label="Orden" value={p.part_order} />
          <Detail
            label="Instalada"
            value={p.assigned_date ? formatDate(String(p.assigned_date)) : null}
          />
          <Detail label="TSO" value={fmtCounter(p.time_since_overhaul)} />
          <Detail label="CSO" value={fmtCounter(p.cycles_since_overhaul)} />
        </div>
        {hasChildren ? (
          <Accordion type="multiple" className="w-full">
            {(p.sub_parts ?? []).map((sp, idx) => (
              <PartRow
                key={`${sp.id ?? sp.part_number}-${idx}`}
                p={sp}
                depth={(depth ?? 0) + 1}
                index={idx}
              />
            ))}
          </Accordion>
        ) : (
          <div className="text-xs text-muted-foreground py-1">
            Sin subcomponentes
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

// ---------- Main component ----------
export default function AircraftDetailsPage() {
  const { acronym } = useParams<{ acronym: string }>();
  const { selectedCompany } = useCompanyStore();
  const [search, setSearch] = React.useState("");
  const { data: aircraft, isLoading } = useGetMaintenanceAircraftByAcronym(
    selectedCompany?.slug,
    acronym,
  );

  // El backend entrega las partes dentro de las asignaciones vigentes
  // (`aircraft_assignments`); no existe `aircraft_parts` en la respuesta.
  const rootParts = React.useMemo<InstalledPart[]>(
    () =>
      (aircraft?.aircraft_assignments ?? [])
        .filter((a) => !a.removed_date && a.aircraft_part)
        .map((a) => ({
          ...a.aircraft_part,
          position: a.position,
          ata_chapter: a.ata_chapter,
          part_order: a.part_order,
          assigned_date: a.assigned_date,
        })),
    [aircraft],
  );

  const visibleParts = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return rootParts;
    const matches = (p: MaintenanceAircraftPart): boolean =>
      [p.type, p.description, p.part_number, p.serial].some((v) =>
        v?.toLowerCase().includes(needle),
      ) || (p.sub_parts ?? []).some(matches);
    return rootParts.filter(matches);
  }, [rootParts, search]);

  const uninstalled = aircraft?.uninstalled_parts ?? [];

  if (isLoading) return <LoadingPage />;

  return (
    <ContentLayout title={`Detalles de Aeronave: ${acronym}`}>
      <PageHeader className="mb-6" />

      <TooltipProvider>
        {aircraft && (
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Header */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Plane className="h-5 w-5" /> {aircraft.acronym}
                      <Badge
                        variant="secondary"
                        className="font-mono text-[10px]"
                      >
                        <Hash className="h-3 w-3 mr-1" /> {aircraft.serial}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Factory className="h-4 w-4" />{" "}
                        {labelFor(aircraft.manufacturer)}
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />{" "}
                        {labelFor(aircraft.location)}
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" /> Cliente:{" "}
                        {labelFor(aircraft.client)}
                      </span>
                    </CardDescription>
                  </div>
                  <RecordAuditHistory
                    subjectType="aircraft"
                    subjectId={Number(aircraft.id)}
                    filename={`historial_aeronave_${aircraft.acronym}`}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat
                    icon={Gauge}
                    label="Flight Hours"
                    value={fmtNumber(aircraft.flight_hours)}
                  />
                  <Stat
                    icon={Layers}
                    label="Flight Cycles"
                    value={fmtNumber(aircraft.flight_cycles)}
                  />
                  <Stat
                    icon={Calendar}
                    label="Fabricación"
                    value={formatDate(aircraft.fabricant_date)}
                  />
                  <Stat
                    icon={Puzzle}
                    label="Partes Instaladas"
                    value={rootParts.length}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left: Parts tree */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Puzzle className="h-4 w-4" /> Partes instaladas
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Estructura jerárquica de partes y subpartes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-125 pr-4">
                      {visibleParts.length ? (
                        <Accordion type="multiple" className="w-full">
                          {visibleParts.map((root, idx) => (
                            <PartRow
                              key={`${root.id ?? root.part_number}-${idx}`}
                              p={root}
                              index={idx}
                            />
                          ))}
                        </Accordion>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-8">
                          {rootParts.length
                            ? "Ninguna parte coincide con la búsqueda"
                            : "Sin partes registradas"}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Archive className="h-4 w-4" /> Partes desinstaladas
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Historial de remociones, con la lectura al remover
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {uninstalled.length ? (
                      <ul className="divide-y">
                        {uninstalled.map((a) => {
                          const readings = removalReadings(a);
                          return (
                            <li key={a.id} className="py-2 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">
                                  {partLabel(a.aircraft_part)}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="font-mono text-[10px]"
                                >
                                  PN: {a.aircraft_part.part_number}
                                  {a.aircraft_part.serial
                                    ? ` · ${a.aircraft_part.serial}`
                                    : ""}
                                </Badge>
                                {a.aircraft_part.parent_part && (
                                  <span className="text-xs text-muted-foreground">
                                    Subparte de{" "}
                                    {partLabel(a.aircraft_part.parent_part)} (
                                    {a.aircraft_part.parent_part.part_number})
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground flex gap-x-4 gap-y-1 flex-wrap">
                                <span>
                                  Removida: {formatDate(String(a.removed_date))}
                                </span>
                                <span>TSN {fmtCounter(readings.tsn)}</span>
                                <span>TSO {fmtCounter(readings.tso)}</span>
                                <span>CSN {fmtCounter(readings.csn)}</span>
                                <span>CSO {fmtCounter(readings.cso)}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        Sin partes desinstaladas
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right: Notes & meta */}
              <div className="flex flex-col-reverse gap-4">
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Notas
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Comentarios y observaciones
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {aircraft.comments?.trim() ? (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {aircraft.comments}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Sin comentarios.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Buscar partes</CardTitle>
                    <CardDescription className="text-xs">
                      Filtra las partes instaladas y sus subpartes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar por tipo, PN o serial…"
                      className="h-9"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </TooltipProvider>
    </ContentLayout>
  );
}
