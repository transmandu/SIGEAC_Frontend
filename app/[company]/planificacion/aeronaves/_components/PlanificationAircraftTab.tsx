"use client"

import { useMemo, useState } from "react"
import { format, parseISO, getYear, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { useGetAverageCyclesAndHours } from "@/hooks/aerolinea/vuelos/useGetAverageCyclesAndHours"
import { Badge } from "@/components/ui/badge"
import { 
  Plane, Hash, Calendar as CalendarIcon, Layers, Search, 
  Clock, ChevronRight, Edit, Package, Download, Loader2
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MaintenanceAircraft, MaintenanceAircraftPart } from "@/types"
import { Button } from "@/components/ui/button"
import { useCompanyStore } from "@/stores/CompanyStore"
import Link from "next/link"
import axios from "axios" // Asegúrate de tener axios instalado
import axiosInstance from '@/lib/axios';
import { toast } from "sonner"

// =========================
// Tipos y Utilidades
// =========================
type AircraftAssignment = {
  id: number | string
  assigned_date: string
  hours_at_installation: string
  cycles_at_installation: string
  removed_date: string | null
  aircraft_part: MaintenanceAircraftPart & {
    aircraft_part_id?: number | null
    sub_parts?: any[]
    description?: string | null
    type?: string | null
    document?: string | null
  }
}

const fmtNumber = (n: any) => {
  if (n === null || n === undefined) return "0"
  const num = Number(n)
  return isNaN(num) ? "0" : num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 })
}

const fmtDate = (d?: string | null | Date) => {
  if (!d) return "—"
  const date = typeof d === 'string' ? parseISO(d) : d
  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: es })
}

// =========================
// Sub-componentes Visuales
// =========================

function TreeNode({ part, depth = 0 }: { part: any; depth?: number }) {
  const [isOpen, setIsOpen] = useState(depth < 1)
  const hasChildren = part.sub_parts && part.sub_parts.length > 0

  return (
    <div className="flex flex-col">
      <div 
        className="flex items-center gap-2 py-2 px-2 hover:bg-accent/50 rounded-lg cursor-pointer transition-colors"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div style={{ marginLeft: `${depth * 20}px` }} className="flex items-center gap-2">
            {hasChildren ? (
            <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            ) : (
            <div className="w-4" />
            )}
            
            <Package className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex flex-1 items-center justify-between ml-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{part.part_name}</span>
            {part.condition_type && (
              <Badge variant="outline" className="text-[10px] px-1.5 h-5 font-semibold bg-primary/5 uppercase">
                {part.condition_type}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">PN: {part.part_number}</span>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground font-mono">
            <div className="flex gap-3">
              <span><span className="text-[10px] font-sans font-bold opacity-70">TSN:</span> {fmtNumber(part.time_since_new)}</span>
              <span><span className="text-[10px] font-sans font-bold opacity-70">TSO:</span> {fmtNumber(part.time_since_overhaul)}</span>
            </div>
            <div className="flex gap-3 border-l pl-6">
              <span><span className="text-[10px] font-sans font-bold opacity-70">CSN:</span> {fmtNumber(part.cycles_since_new)}</span>
              <span><span className="text-[10px] font-sans font-bold opacity-70">CSO:</span> {fmtNumber(part.cycles_since_overhaul)}</span>
            </div>
          </div>
        </div>
      </div>

      {isOpen && hasChildren && (
        <div className="border-l border-muted ml-4">
          {part.sub_parts.map((sub: any) => (
            <TreeNode key={sub.id} part={sub} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// =========================
// Componente Principal
// =========================
export function PlanificationAircraftTab({ aircraft }: { aircraft: MaintenanceAircraft & { aircraft_assignments?: any[], id: number } }) {
  const [q, setQ] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)
  const { selectedCompany } = useCompanyStore()

  // Lógica de descarga de Excel
  const handleDownloadTraceability = async () => {
    if (!selectedCompany?.slug || !aircraft?.id) {
        toast.error("Datos de aeronave o empresa no disponibles");
        return;
    }
    
    setIsDownloading(true);
    
    try {
        // Observa qué limpio queda: no hay URL base manual ni headers de Token
        const response = await axiosInstance.get(
            `/${selectedCompany.slug}/aircrafts/traceability-export`, 
            {
                params: { aircraft_id: aircraft.id },
                responseType: 'blob', 
            }
        );

        const blob = new Blob([response.data], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Trazabilidad_${aircraft.acronym}_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success("Archivo generado correctamente");
    } catch (error: any) {
        // Manejo de errores con el fix de TypeScript que aplicamos antes
        if (error.response?.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result;
                if (typeof result === 'string') {
                    try {
                        const parsed = JSON.parse(result);
                        toast.error(parsed.error || "Error en el servidor");
                    } catch (e) {
                        toast.error("Error al procesar la respuesta del servidor");
                    }
                }
            };
            reader.readAsText(error.response.data);
        } else {
            toast.error("Error al conectar con el servidor");
        }
    } finally {
        setIsDownloading(false);
    }
  };

  // Solo assignments activos
  const assignments = useMemo(() => {
    return (aircraft.aircraft_assignments || []).filter(a => a.removed_date === null) as AircraftAssignment[]
  }, [aircraft.aircraft_assignments])

  // Lista plana para la pestaña de búsqueda (incluye hijos recursivamente)
  const filteredFlat = useMemo(() => {
    const flat: AircraftAssignment[] = [];
    
    const flatten = (items: any[]) => {
      items.forEach(a => {
        flat.push(a);
        const part = a.aircraft_part || a; 
        if (part.sub_parts && part.sub_parts.length > 0) {
          part.sub_parts.forEach((sub: any) => {
            flatten([{ 
                ...a, 
                id: `sub-${sub.id}-${Math.random()}`, 
                aircraft_part: sub 
            }]);
          });
        }
      });
    };

    flatten(assignments);

    if (!q) return flat;
    return flat.filter(a => 
      a.aircraft_part.part_name?.toLowerCase().includes(q.toLowerCase()) || 
      a.aircraft_part.part_number?.toLowerCase().includes(q.toLowerCase())
    )
  }, [assignments, q])

  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              <Plane className="h-6 w-6" /> {aircraft.acronym}
            </h1>
            <div className="flex items-center gap-2">
                <Link href={`/${selectedCompany?.slug}/planificacion/aeronaves/editar/${aircraft.acronym}`}>
                <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                </Button>
                </Link>
                
                {/* BOTÓN DE DESCARGA AÑADIDO */}
                <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleDownloadTraceability}
                    disabled={isDownloading}
                    className="bg-green-700 hover:bg-green-800 text-white"
                >
                    {isDownloading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4 mr-2" />
                    )}
                    Generar Excel
                </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Serial <span className="font-medium text-foreground">{aircraft.serial}</span></p>
        </div>
        <div className="text-sm text-muted-foreground">Actualizado: {fmtDate(new Date())}</div>
      </div>

      <Separator className="my-4" />

      <Tabs defaultValue="resumen" className="w-full">
        <div className="flex w-full items-center justify-between">
          <TabsList className="h-10">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="partes" className="inline-flex items-center gap-1">
              <Layers className="h-4 w-4" /> Partes (desglosadas)
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ===== Resumen ===== */}
        <TabsContent value="resumen" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="border-muted/40">
              <CardHeader>
                <CardTitle className="text-base">Datos de la aeronave</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground"><Hash className="h-4 w-4" /> Matrícula</div>
                  <div className="font-medium">{aircraft.acronym || "—"}</div>

                  <div className="flex items-center gap-2 text-muted-foreground"><Hash className="h-4 w-4" /> Serial</div>
                  <div className="font-medium">{aircraft.serial || "—"}</div>

                  <div className="flex items-center gap-2 text-muted-foreground"><CalendarIcon className="h-4 w-4" /> Fabricación</div>
                  <div className="font-medium">{aircraft.fabricant_date ? getYear(parseISO(aircraft.fabricant_date)) : "—"}</div>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-muted-foreground">Horas de vuelo</div>
                  <div className="font-medium">{fmtNumber(aircraft.flight_hours)}</div>
                  <div className="text-muted-foreground">Ciclos</div>
                  <div className="font-medium">{fmtNumber(aircraft.flight_cycles)}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-muted/40">
              <CardHeader>
                <CardTitle className="text-base">Resumen de Vuelo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-md border">
                    <div className="flex items-center justify-between border-b px-3 py-2 text-sm">
                      <span className="text-muted-foreground">Totales estimados</span>
                      <span className="text-muted-foreground">H / C</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> Horas / Ciclos</span>
                      <span>{fmtNumber(aircraft.flight_hours)} / {fmtNumber(aircraft.flight_cycles)}</span>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <div className="flex items-center justify-between border-b px-3 py-2 text-sm">
                      <span className="text-muted-foreground">Estadísticas del mes</span>
                      <span className="text-muted-foreground">Valor</span>
                    </div>
                    <MonthlyFlightStats aircraft={aircraft} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-muted/40">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-base">Resumen de Partes</CardTitle>
              <div className="text-xs text-muted-foreground">{assignments.length} partes instaladas</div>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">Sin partes instaladas.</div>
              ) : (
                <div className="space-y-4">
                   <div className="ml-4 space-y-1">
                    {assignments.map((a) => (
                      <TreeNode key={a.id} part={a.aircraft_part} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== Partes (desglosadas) ===== */}
        <TabsContent value="partes" className="mt-4 space-y-4">
          <Card className="border-muted/40">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="inline-flex items-center gap-2 text-base">
                <Layers className="h-4 w-4" /> Partes instaladas (lista)
              </CardTitle>
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por nombre o PN"
                  className="pl-8 h-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredFlat.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">Sin resultados</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parte / Descripción</TableHead>
                        <TableHead className="hidden sm:table-cell">PN / Serial</TableHead>
                        <TableHead className="hidden md:table-cell text-center">Tipo</TableHead>
                        <TableHead className="hidden md:table-cell">TSN / TSO</TableHead>
                        <TableHead className="hidden md:table-cell">CSN / CSO</TableHead>
                        <TableHead className="hidden lg:table-cell">Instalada</TableHead>
                        <TableHead className="text-right">H/C al instalar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFlat.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{a.aircraft_part.part_name}</span>
                                    {a.aircraft_part.condition_type && (
                                        <Badge variant="secondary" className="text-[9px] uppercase tracking-wider px-1 h-4">
                                            {a.aircraft_part.condition_type}
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-[10px] text-muted-foreground line-clamp-1">
                                    {a.aircraft_part.description || "Sin descripción"}
                                </span>
                            </div>
                          </TableCell>

                          <TableCell className="hidden sm:table-cell">
                            <div className="flex flex-col">
                                <span className="text-xs">{a.aircraft_part.part_number}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                    {a.aircraft_part.serial || "S/N"}
                                </span>
                            </div>
                          </TableCell>

                          <TableCell className="hidden md:table-cell text-center">
                            {a.aircraft_part.type ? (
                                <Badge variant="outline" className="text-[9px] uppercase font-bold bg-muted/20">
                                    {a.aircraft_part.type}
                                </Badge>
                            ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          
                          <TableCell className="hidden md:table-cell text-sm font-mono">
                            <div className="flex items-center gap-3">
                              <span>{fmtNumber(a.aircraft_part.time_since_new)}</span>
                              <span className="text-muted-foreground/50">/</span>
                              <span className="text-muted-foreground">{fmtNumber(a.aircraft_part.time_since_overhaul)}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell className="hidden md:table-cell text-sm font-mono">
                            <div className="flex items-center gap-3">
                              <span>{fmtNumber(a.aircraft_part.cycles_since_new)}</span>
                              <span className="text-muted-foreground/50">/</span>
                              <span className="text-muted-foreground">{fmtNumber(a.aircraft_part.cycles_since_overhaul)}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                            {fmtDate(a.assigned_date)}
                          </TableCell>
                          <TableCell className="text-right text-xs font-mono">
                            {fmtNumber(a.hours_at_installation)} / {fmtNumber(a.cycles_at_installation)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MonthlyFlightStats({ aircraft }: { aircraft: MaintenanceAircraft }) {
  const currentDate = new Date()
  const dateRange = {
    first_date: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
    second_date: format(endOfMonth(currentDate), 'yyyy-MM-dd')
  }
  const { selectedCompany } = useCompanyStore()
  const { data, isLoading } = useGetAverageCyclesAndHours(selectedCompany?.slug, aircraft.acronym, dateRange)

  return (
    <div className="divide-y">
      {[
        { label: "Promedio de horas", value: data?.average_flight_hours },
        { label: "Promedio de ciclos", value: data?.average_flight_cycles },
        { label: "Total de vuelos", value: data?.total_flights }
      ].map((stat, i) => (
        <div key={i} className="flex justify-between px-3 py-2 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" /> {stat.label}
          </span>
          <span className="font-medium">
            {isLoading ? "..." : fmtNumber(stat.value)}
          </span>
        </div>
      ))}
    </div>
  )
}