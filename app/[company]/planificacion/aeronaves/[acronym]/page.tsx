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
import type { MaintenanceAircraft, MaintenanceAircraftPart } from "@/types";

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
    return format(date, 'PPP', { locale: es });
  } catch {
    return String(iso);
  }
};

// Formatear números con máximo 2 decimales, eliminando ceros innecesarios
const fmtNumber = (n: unknown): string => {
  if (n == null || n === "") return "—"
  
  const str = String(n).trim()
  if (!str) return "—"
  
  const lastDot = str.lastIndexOf(".")
  const lastComma = str.lastIndexOf(",")
  
  // Determinar locale y parsear según posición de separadores
  const isEuropean = lastComma > lastDot || (lastComma !== -1 && lastDot === -1)
  const num = isEuropean 
    ? Number(str.replace(/\./g, "").replace(",", "."))
    : Number(str.replace(/,/g, ""))
  
  if (isNaN(num)) return "—"
  
  // Redondear a 2 decimales para evitar problemas de precisión de punto flotante
  const rounded = Math.round(num * 100) / 100
  
  return rounded.toLocaleString(isEuropean ? "de-DE" : "en-US", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
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

const PartRow = ({ p, depth = 0, index = 0 }: { p: MaintenanceAircraftPart; depth?: number; index?: number }) => {
  const hasChildren = p.sub_parts && p.sub_parts.length > 0;
  return (
    <AccordionItem value={`${p.part_number}-${depth}-${index}`} className="border-none">
      <AccordionTrigger className="px-0 hover:no-underline">
        <div className="flex items-start gap-3 w-full">
          <div className="min-w-4 mt-1" style={{ paddingLeft: depth * 12 }}>
            <ChevronRight className="h-4 w-4 opacity-60" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Puzzle className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium truncate">{p.part_name}</span>
              <Badge variant="outline" className="font-mono text-[10px]">PN: {p.part_number}</Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex gap-3 flex-wrap">
              <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> TSN: {fmtNumber(p.time_since_new ?? p.part_hours)}</span>
              <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> CSN: {fmtNumber(p.cycles_since_new ?? p.part_cycles)}</span>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-7">
        {hasChildren ? (
          <Accordion type="multiple" className="w-full">
            {(p.sub_parts ?? []).map((sp, idx) => (
              <PartRow key={`${sp.part_number}-${idx}`} p={sp} depth={(depth ?? 0) + 1} index={idx} />
            ))}
          </Accordion>
        ) : (
          <div className="text-xs text-muted-foreground py-1">Sin subcomponentes</div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};


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
                    <Stat icon={Gauge} label="Flight Hours" value={fmtNumber(aircraft.flight_hours)} />
                    <Stat icon={Layers} label="Flight Cycles" value={fmtNumber(aircraft.flight_cycles)} />
                    <Stat icon={Calendar} label="Fabricación" value={formatDate(aircraft.fabricant_date)} />
                    <Stat icon={Puzzle} label="Partes Instaladas" value={aircraft.aircraft_parts?.length ?? 0} />
                  </div>
                </CardContent>
              </Card>

              {/* Body */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Parts tree */}
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2"><Puzzle className="h-4 w-4" /> Partes instaladas</CardTitle>
                      <CardDescription className="text-xs">Estructura jerárquica de partes y subpartes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px] pr-4">
                        {aircraft.aircraft_parts?.length ? (
                          <Accordion type="multiple" className="w-full">
                            {aircraft.aircraft_parts.map((root, idx) => (
                              <PartRow key={`${root.part_number}-${idx}`} p={root} index={idx} />
                            ))}
                          </Accordion>
                        ) : (
                          <div className="text-sm text-muted-foreground text-center py-8">
                            Sin partes registradas
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
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
