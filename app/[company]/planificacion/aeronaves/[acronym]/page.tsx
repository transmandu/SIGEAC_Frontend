"use client"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";
import React from "react";

import { useGetMaintenanceAircraftByAcronym } from "@/hooks/planificacion/useGetMaitenanceAircraftByAcronym";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  Calendar,
  ChevronRight,
  Factory,
  FileText,
  Gauge,
  Hash,
  Layers,
  MapPin,
  Plane,
  Puzzle,
  Wrench,
} from "lucide-react";
import { useParams } from "next/navigation";
import LoadingPage from "@/components/misc/LoadingPage";
import { ContentLayout } from "@/components/layout/ContentLayout";

// Types are assumed to be available in your project:
// import type { MaintenanceAircraft, MaintenanceAircraftPart, AircraftAssigment } from "@/types";

type MaintenanceAircraft = {
  id: number;
  client: any; // Minimal typing for UI safety
  manufacturer: any;
  serial: string;
  acronym: string;
  flight_hours: number;
  flight_cycles: number;
  fabricant_date: string;
  aircraft_assignments: AircraftAssigment[];
  location: any;
  comments: string;
};

type AircraftAssigment = {
  id: number;
  hours_at_installation: string;
  cycles_at_installation: string;
  removed_date: string | null;
  assigned_date: string;
  aircraft_part: MaintenanceAircraftPart;
};

type MaintenanceAircraftPart = {
  part_number: string;
  part_name: string;
  condition_type: string;
  total_flight_hours: number;
  total_flight_cycles: number;
  sub_parts: MaintenanceAircraftPart[];
  parent_part_id: string | null;
};

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
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString();
};

const Stat = ({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) => (
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

const ConditionBadge = ({ condition }: { condition: string }) => {
  const variant =
    condition?.toLowerCase() === "serviceable" || condition?.toLowerCase() === "serviciable"
      ? "default"
      : condition?.toLowerCase().includes("overhauled")
        ? "secondary"
        : condition?.toLowerCase().includes("repair") || condition?.toLowerCase().includes("unserviceable")
          ? "destructive"
          : "outline";
  return <Badge variant={variant as any}>{condition || "—"}</Badge>;
};

const PartRow = ({ p, depth = 0 }: { p: MaintenanceAircraftPart; depth?: number }) => {
  const hasChildren = p.sub_parts && p.sub_parts.length > 0;
  return (
    <AccordionItem value={`${p.part_number}-${depth}`} className="border-none">
      <AccordionTrigger className="px-0 hover:no-underline">
        <div className="flex items-start gap-3 w-full">
          <div className="min-w-4 mt-1" style={{ paddingLeft: depth * 12 }}>
            <ChevronRight className="h-4 w-4 opacity-60" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Puzzle className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium truncate">{p.part_name}</span>
              <Badge variant="outline" className="font-mono text-[10px]">{p.part_number}</Badge>
              <ConditionBadge condition={p.condition_type} />
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex gap-3">
              <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> FH {p.total_flight_hours}</span>
              <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> FC {p.total_flight_cycles}</span>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-7">
        {hasChildren ? (
          <Accordion type="multiple" className="w-full">
            {p.sub_parts.map((sp, idx) => (
              <PartRow key={`${p.part_number}-${idx}`} p={sp} depth={(depth ?? 0) + 1} />
            ))}
          </Accordion>
        ) : (
          <div className="text-xs text-muted-foreground py-1">Sin subcomponentes</div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

const AssignmentsTable = ({ rows }: { rows: AircraftAssigment[] }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2"><Wrench className="h-4 w-4" /> Historial de instalaciones</CardTitle>
      <CardDescription className="text-xs">Partes instaladas/retiradas para esta aeronave</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[28%]">Parte</TableHead>
              <TableHead>PN</TableHead>
              <TableHead className="hidden md:table-cell">FH @Instalación</TableHead>
              <TableHead className="hidden md:table-cell">FC @Instalación</TableHead>
              <TableHead>Asignada</TableHead>
              <TableHead>Retirada</TableHead>
              <TableHead className="hidden md:table-cell">Condición</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows?.length ? (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.aircraft_part.part_name}</TableCell>
                  <TableCell className="font-mono text-xs">{r.aircraft_part.part_number}</TableCell>
                  <TableCell className="hidden md:table-cell">{r.hours_at_installation}</TableCell>
                  <TableCell className="hidden md:table-cell">{r.cycles_at_installation}</TableCell>
                  <TableCell>{formatDate(r.assigned_date)}</TableCell>
                  <TableCell>{formatDate(r.removed_date)}</TableCell>
                  <TableCell className="hidden md:table-cell"><ConditionBadge condition={r.aircraft_part.condition_type} /></TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">Sin registros</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
);

// ---------- Main component ----------
export default function AircraftDetailsPage() {
  const { acronym } = useParams<{ acronym: string }>();
  const { selectedCompany } = useCompanyStore();
  const { data: aircraft, isLoading } = useGetMaintenanceAircraftByAcronym(acronym, selectedCompany?.slug);

  if (isLoading) return <LoadingPage />

  return (
    <ContentLayout title={`Detalles de Aeronave: ${acronym}`}>
      <TooltipProvider>
        {
          aircraft && (
            <div className="max-w-7xl mx-auto space-y-4">
              {/* Breadcrumb-ish chips */}
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="gap-1"><Plane className="h-3.5 w-3.5" /> Aeronave</Badge>
                <span className="opacity-50">→</span>
                <Badge variant="outline" className="gap-1"><FileText className="h-3.5 w-3.5" /> Detalle</Badge>
              </div>

              {/* Header */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Plane className="h-5 w-5" /> {aircraft.acronym}
                        <Badge variant="secondary" className="font-mono text-[10px]">
                          <Hash className="h-3 w-3 mr-1" /> {aircraft.serial}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1"><Factory className="h-4 w-4" /> {labelFor(aircraft.manufacturer)}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {labelFor(aircraft.location)}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> Cliente: {labelFor(aircraft.client)}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Stat icon={Gauge} label="Flight Hours" value={aircraft.flight_hours} />
                    <Stat icon={Layers} label="Flight Cycles" value={aircraft.flight_cycles} />
                    <Stat icon={Calendar} label="Fabricación" value={formatDate(aircraft.fabricant_date)} />
                    <Stat icon={Wrench} label="Asignaciones" value={aircraft.aircraft_assignments?.length ?? 0} />
                  </div>
                </CardContent>
              </Card>

              {/* Body */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Parts tree */}
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2"><Puzzle className="h-4 w-4" /> Árbol de componentes</CardTitle>
                      <CardDescription className="text-xs">Estructura jerárquica de partes y subpartes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[360px] pr-4">
                        {aircraft.aircraft_assignments?.length ? (
                          <Accordion type="multiple" className="w-full">
                            {Array.from(
                              new Map(
                                aircraft.aircraft_assignments.map((a) => [a.aircraft_part.part_number, a.aircraft_part])
                              ).values()
                            ).map((root, idx) => (
                              <PartRow key={`${root.part_number}-${idx}`} p={root} />
                            ))}
                          </Accordion>
                        ) : (
                          <div className="text-sm text-muted-foreground">No hay partes asociadas.</div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <AssignmentsTable rows={aircraft.aircraft_assignments || []} />
                </div>

                {/* Right: Notes & meta */}
                <div className="flex flex-col-reverse gap-4">
                  <Card className="h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Notas</CardTitle>
                      <CardDescription className="text-xs">Comentarios y observaciones</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {aircraft.comments?.trim() ? (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{aircraft.comments}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Sin comentarios.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Acciones rápidas</CardTitle>
                      <CardDescription className="text-xs">Buscar en asignaciones</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Input placeholder="Buscar por PN o nombre de parte…" className="h-9" />
                      <p className="text-xs text-muted-foreground">(Wire up a un estado/filtro si deseas hacerlo interactivo).</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )
        }
      </TooltipProvider>
    </ContentLayout>
  );
}
