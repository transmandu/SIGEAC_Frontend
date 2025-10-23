"use client"

import { useMemo, useRef, useState } from "react"
import { format, parseISO, getYear, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { useGetAverageCyclesAndHours } from "@/hooks/aerolinea/vuelos/useGetAverageCyclesAndHours"
import { Plane, Hash, Calendar as CalendarIcon, Layers, Search, PackageCheck, CircleDot, Clock, RotateCcw, ChevronRight, Component, Package, Edit, Cog, Zap, Fan } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MaintenanceAircraft, MaintenanceAircraftPart } from "@/types"
import { Button } from "@/components/ui/button"
import { useCompanyStore } from "@/stores/CompanyStore"
import Link from "next/link"

// Tipo local para assignments (estructura extendida para UI)
type AircraftAssignment = {
  id: string
  removed_date: string | null
  assigned_date: string
  hours_at_installation: string
  cycles_at_installation: string
  aircraft_part: MaintenanceAircraftPart & {
    total_flight_hours?: number
    total_flight_cycles?: number
    parent_part_id?: string | null
  }
}

// =========================
// Utilidades
// =========================
const fmtDate = (d?: string | Date | null) => {
  if (!d) return "—"
  try {
    const date = typeof d === "string" ? parseISO(d) : d
  return format(date, "PPP", { locale: es })
  } catch {
    return "—"
  }
}

// Formatear números con máximo 2 decimales, eliminando ceros innecesarios
const fmtNumber = (n: unknown): string => {
  if (n === null || n === undefined || n === "") return "—"
  const num = typeof n === "number" ? n : Number(n)
  if (isNaN(num)) return "—"
  // Redondear a 2 decimales y convertir a string, eliminando ceros innecesarios
  return Number(num.toFixed(2)).toString()
}

const asNum = (n: unknown) => (typeof n === "number" ? n : Number(n))

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0)

// =========================
// Construcción del árbol a partir de assignments
// - Soporta dos escenarios:
//   1) El backend ya rellena sub_parts → usamos eso.
//   2) Viene plano, con parent_part_id → armamos el árbol aquí.
// - parent_part_id debe referenciar un identificador único del padre.
//   Si tu parte no tiene id, se usa part_number como clave.
// =========================
export type PartNode = {
  key: string
  assignment_id: number
  assigned_date: string
  hours_at_installation: string
  cycles_at_installation: string
  part: MaintenanceAircraftPart
  children: PartNode[]
}

function buildTreeFromAssignments(assignments: AircraftAssignment[]): PartNode[] {
  // Si el primer assignment ya tiene sub_parts, asumimos árbol completo
  const anyHasSub = assignments.some((a) => a.aircraft_part?.sub_parts?.length)
  if (anyHasSub) {
    // Map recursivo directo desde sub_parts
    const mapFromPart = (part: MaintenanceAircraftPart, meta: Pick<AircraftAssignment, "id" | "assigned_date" | "hours_at_installation" | "cycles_at_installation">): PartNode => ({
      key: part.part_number,
      assignment_id: typeof meta.id === 'string' ? parseInt(meta.id) : meta.id,
      assigned_date: meta.assigned_date,
      hours_at_installation: meta.hours_at_installation,
      cycles_at_installation: meta.cycles_at_installation,
      part,
      children: (part.sub_parts ?? []).map((sp) => mapFromPart(sp, meta)),
    })
    return assignments
      .filter((a) => a.removed_date === null)
      .map((a) => mapFromPart(a.aircraft_part, a))
  }

  // Si viene plano, ensamblamos usando parent_part_id (que referencia al id del padre)
  const current = assignments.filter((a) => a.removed_date === null)
  const nodes: PartNode[] = current.map((a) => ({
    key: a.id, // Usar el ID como key
    assignment_id: typeof a.id === 'string' ? parseInt(a.id) : a.id,
    assigned_date: a.assigned_date,
    hours_at_installation: a.hours_at_installation,
    cycles_at_installation: a.cycles_at_installation,
    part: a.aircraft_part,
    children: [],
  }))

  const byKey = new Map(nodes.map((n) => [n.key, n]))

  const roots: PartNode[] = []
  for (const n of nodes) {
    const extendedPart = n.part as MaintenanceAircraftPart & { parent_part_id?: string | null }
    const parentId = extendedPart.parent_part_id
    // Match por parent_part_id (debe coincidir con el id de otra parte)
    if (parentId && byKey.has(String(parentId))) {
      byKey.get(String(parentId))!.children.push(n)
    } else {
      roots.push(n)
    }
  }
  return roots
}

// =========================
// Configuración de tipos de partes
// =========================
const PART_TYPE_CONFIG = [
  { 
    type: "ENGINE",
    icon: Cog,
    color: "blue",
    label: "Motor"
  },
  {
    type: "APU",
    icon: Zap,
    color: "amber",
    label: "APU"
  },
  {
    type: "PROPELLER",
    icon: Fan,
    color: "green",
    label: "Hélice"
  }
] as const;

// =========================
// Componente de estadísticas mensuales
// =========================
function MonthlyFlightStats({ acronym }: { acronym: string }) {
  // Obtener el primer y último día del mes actual
  const currentDate = new Date();
  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);

  const dateRange = {
    first_date: format(firstDay, 'yyyy-MM-dd'),
    second_date: format(lastDay, 'yyyy-MM-dd')
  };

  const { selectedCompany } = useCompanyStore();
  const { data, isLoading } = useGetAverageCyclesAndHours(selectedCompany?.slug, acronym, dateRange);

  if (isLoading) {
    return (
      <div className="grid gap-1">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> Promedio de horas
          </span>
          <span className="text-muted-foreground">Cargando...</span>
        </div>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> Promedio de ciclos
          </span>
          <span className="text-muted-foreground">Cargando...</span>
        </div>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> Total de vuelos
          </span>
          <span className="text-muted-foreground">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4" /> Promedio de horas
        </span>
        <span>
          {data ? fmtNumber(data.average_flight_hours) : '—'}
        </span>
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4" /> Promedio de ciclos
        </span>
        <span>
          {data ? fmtNumber(data.average_flight_cycles) : '—'}
        </span>
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4" /> Total de vuelos
        </span>
        <span>
          {data ? data.total_flights || '0' : '—'}
        </span>
      </div>
    </div>
  );
}

// =========================
// Componente de fila de parte
// =========================
function PartTableRow({ 
  assignment, 
  typeConfig 
}: { 
  assignment: AircraftAssignment; 
  typeConfig: typeof PART_TYPE_CONFIG[number];
}) {
  return (
    <TableRow key={assignment.id}>
      <TableCell>
        <div className="flex items-center gap-1">
          <typeConfig.icon className={`h-4 w-4 text-${typeConfig.color}-500`} />
          <span className={`text-xs text-${typeConfig.color}-600`}>{typeConfig.label}</span>
        </div>
      </TableCell>
      <TableCell className="font-medium">{assignment.aircraft_part.part_name}</TableCell>
      <TableCell className="hidden sm:table-cell">{assignment.aircraft_part.part_number}</TableCell>
      <TableCell className="hidden md:table-cell">
        {fmtNumber(assignment.aircraft_part.time_since_new ?? assignment.aircraft_part.part_hours)} / {fmtNumber(assignment.aircraft_part.time_since_overhaul ?? 0)}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {fmtNumber(assignment.aircraft_part.cycles_since_new ?? assignment.aircraft_part.part_cycles)} / {fmtNumber(assignment.aircraft_part.cycles_since_overhaul ?? 0)}
      </TableCell>
      <TableCell className="hidden lg:table-cell">{fmtDate(assignment.assigned_date)}</TableCell>
      <TableCell className="text-right">{fmtNumber(assignment.hours_at_installation)} / {fmtNumber(assignment.cycles_at_installation)}</TableCell>
    </TableRow>
  );
}

// =========================
// UI del nodo (recursivo)
// =========================
function TreeNode({ node, depth = 0 }: { node: PartNode; depth?: number }) {
  const p = node.part
  const hasChildren = node.children && node.children.length > 0
  return (
    <details
      className={`group relative ${depth > 0 ? 'before:absolute before:left-3 before:top-0 before:bottom-0 before:border-l before:border-border/40' : ''}`}
      open={depth === 0}
    >
      <summary
        className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer select-none"
        style={{ paddingLeft: Math.min(depth, 6) * 16 + 8 }}
      >
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
        {hasChildren ? (
          <Component className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Package className="h-4 w-4 text-muted-foreground" />
        )}
        <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{p.part_name || "(Sin nombre)"}</div>
            <div className="truncate text-xs text-muted-foreground">
              PN: <span className="font-mono tracking-tight">{p.part_number || "—"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
              <span>TSN: {fmtNumber(p.time_since_new ?? p.part_hours)}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>TSO: {fmtNumber(p.time_since_overhaul ?? 0)}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>CSN: {fmtNumber(p.cycles_since_new ?? p.part_cycles)}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>CSO: {fmtNumber(p.cycles_since_overhaul ?? 0)}</span>
            </div>
          </div>
        </div>
      </summary>
      <div className="ml-8 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" /> Instalado: <span className="ml-1 text-foreground">{fmtDate(node.assigned_date)}</span></div>
        <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Horas al instalar: <span className="ml-1 text-foreground">{fmtNumber(node.hours_at_installation)}</span></div>
        <div className="flex items-center gap-1"><RotateCcw className="h-3.5 w-3.5" /> Ciclos al instalar: <span className="ml-1 text-foreground">{fmtNumber(node.cycles_at_installation)}</span></div>
      </div>
      {hasChildren && (
        <div className="mt-1 space-y-1">
          {node.children.map((child) => (
            <TreeNode key={child.key} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </details>
  )
}

// =========================
// Componente principal
// =========================
export function PlanificationAircraftTab({ aircraft }: { aircraft: MaintenanceAircraft }) {
  const [q, setQ] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const { selectedCompany } = useCompanyStore()

  // Convertir aircraft_parts al formato de assignments para el UI
  const currentAssignments = useMemo(() => {
    // Si tenemos aircraft_parts, convertirlos al formato de assignments
    if (aircraft.aircraft_parts && aircraft.aircraft_parts.length > 0) {
      const assignments: AircraftAssignment[] = [];
      
      // Convertir las horas de vuelo de la aeronave (vienen como string "4,324.00")
      const aircraftHours = parseFloat(String(aircraft.flight_hours).replace(/,/g, '')) || 0;
      const aircraftCycles = parseFloat(String(aircraft.flight_cycles).replace(/,/g, '')) || 0;

      aircraft.aircraft_parts.forEach((part: any) => {
        // Convertir strings a números
        const partHours = parseFloat(part.time_since_new || part.part_hours || 0);
        const partCycles = parseFloat(part.cycles_since_new || part.part_cycles || 0);
        
        const assignment: AircraftAssignment = {
          id: String(part.id),
          removed_date: null,
          assigned_date: aircraft.fabricant_date || new Date().toISOString(),
          // Mostrar directamente las horas/ciclos de la parte sin calcular
          hours_at_installation: String(partHours.toFixed(1)),
          cycles_at_installation: String(partCycles.toFixed(1)),
          aircraft_part: {
            ...part,
            total_flight_hours: partHours,
            total_flight_cycles: partCycles,
            parent_part_id: part.aircraft_part_id, // Usar el ID del padre directamente
          }
        };
        
        assignments.push(assignment);
      });

      return assignments;
    }
    return [];
  }, [aircraft.aircraft_parts, aircraft.fabricant_date, aircraft.flight_hours, aircraft.flight_cycles])

  // Resumen rápido de partes
  const totalParts = currentAssignments.length

  const totals = useMemo(() => {
    const hours = sum(currentAssignments.map((a: AircraftAssignment) => asNum(a.aircraft_part?.total_flight_hours || 0)))
    const cycles = sum(currentAssignments.map((a: AircraftAssignment) => asNum(a.aircraft_part?.total_flight_cycles || 0)))
    return { hours, cycles }
  }, [currentAssignments])

  // Árbol agrupado por categorías
  const tree = useMemo(() => buildTreeFromAssignments(currentAssignments), [currentAssignments])
  
  // Agrupar partes por categorías basándose en part_type
  const partsByCategory = useMemo(() => {
    const categories = {
      ENGINE: [] as PartNode[],
      APU: [] as PartNode[],
      PROPELLER: [] as PartNode[]
    };
    
    console.log('========== DEBUG: Agrupación de Partes ==========');
    console.log('Total de nodos en el árbol:', tree.length);
    
    tree.forEach(node => {
      const part = node.part as any;
      
      // Log detallado de cada parte
      console.log('\n--- Parte ---');
      console.log('Nombre:', part.part_name);
      console.log('Part Number:', part.part_number);
      console.log('Part Type (del backend):', part.part_type);
      console.log('Objeto completo:', part);
      
      // Normalizar part_type a mayúsculas para la comparación
      const partType = part.part_type?.toUpperCase();
      
      if (partType === "ENGINE") {
        console.log('✅ Clasificado como: ENGINE (por part_type)');
        categories.ENGINE.push(node);
      } else if (partType === "APU") {
        console.log('✅ Clasificado como: APU (por part_type)');
        categories.APU.push(node);
      } else if (partType === "PROPELLER") {
        console.log('✅ Clasificado como: PROPELLER (por part_type)');
        categories.PROPELLER.push(node);
      } else {
        // Fallback: detectar por nombre
        const partName = part.part_name?.toLowerCase() || "";
        console.log('⚠️ part_type no reconocido, usando fallback por nombre:', partName);
        
        if (partName.includes('engine') || partName.includes('motor')) {
          console.log('✅ Clasificado como: ENGINE (por nombre)');
          categories.ENGINE.push(node);
        } else if (partName.includes('apu')) {
          console.log('✅ Clasificado como: APU (por nombre)');
          categories.APU.push(node);
        } else if (partName.includes('propeller') || partName.includes('hélice') || partName.includes('helice')) {
          console.log('✅ Clasificado como: PROPELLER (por nombre)');
          categories.PROPELLER.push(node);
        } else {
          console.log('⚠️ No se pudo clasificar, usando DEFAULT: ENGINE');
          categories.ENGINE.push(node); // Default a ENGINE
        }
      }
    });
    
    console.log('\n========== Resumen de Clasificación ==========');
    console.log('ENGINE (Plantas de Poder):', categories.ENGINE.length);
    console.log('APU:', categories.APU.length);
    console.log('PROPELLER (Hélices):', categories.PROPELLER.length);
    console.log('==============================================\n');
    
    return categories;
  }, [tree])

  // Filtro de búsqueda por nombre/PN (sobre el listado plano para la pestaña "Partes")
  const flat = useMemo(() => currentAssignments, [currentAssignments])
  const filteredFlat = useMemo(() => {
    if (!q) return flat
    const qq = q.toLowerCase()
    return flat.filter((a: AircraftAssignment) => {
      const p = a.aircraft_part
      return (
        p.part_name?.toLowerCase().includes(qq) ||
        p.part_number?.toLowerCase().includes(qq)
      )
    })
  }, [flat, q])

  // Agrupar partes filtradas por categorías para la tabla
  const filteredPartsByCategory = useMemo(() => {
    const categories = {
      ENGINE: [] as AircraftAssignment[],
      APU: [] as AircraftAssignment[],
      PROPELLER: [] as AircraftAssignment[]
    };
    
    filteredFlat.forEach(assignment => {
      const part = assignment.aircraft_part as any;
      // Normalizar part_type a mayúsculas para la comparación
      const partType = part.part_type?.toUpperCase();
      
      if (partType === "ENGINE") {
        categories.ENGINE.push(assignment);
      } else if (partType === "APU") {
        categories.APU.push(assignment);
      } else if (partType === "PROPELLER") {
        categories.PROPELLER.push(assignment);
      } else {
        // Fallback: detectar por nombre
        const partName = part.part_name?.toLowerCase() || "";
        if (partName.includes('engine') || partName.includes('motor')) {
          categories.ENGINE.push(assignment);
        } else if (partName.includes('apu')) {
          categories.APU.push(assignment);
        } else if (partName.includes('propeller') || partName.includes('hélice') || partName.includes('helice')) {
          categories.PROPELLER.push(assignment);
        } else {
          categories.ENGINE.push(assignment); // Default a ENGINE
        }
      }
    });
    
    return categories;
  }, [filteredFlat])

  const expandAll = (open: boolean) => {
    const el = listRef.current
    if (!el) return
    el.querySelectorAll<HTMLDetailsElement>("details").forEach((d) => (d.open = open))
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              <Plane className="h-6 w-6" /> {aircraft.acronym}
            </h1>
            <Link href={`/${selectedCompany?.slug}/planificacion/aeronaves/editar/${aircraft.acronym}`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </Link>
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
                  <div className="font-medium">{aircraft.model || "—"}</div>

                  <div className="flex items-center gap-2 text-muted-foreground"><Hash className="h-4 w-4" /> Serial</div>
                  <div className="font-medium">{aircraft.serial || "—"}</div>

                  <div className="flex items-center gap-2 text-muted-foreground"><CalendarIcon className="h-4 w-4" /> Fabricación</div>
                  <div className="font-medium">{aircraft.fabricant_date ? getYear(parseISO(aircraft.fabricant_date)) : "—"}</div>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-muted-foreground">Horas de vuelo</div>
                  <div className="font-medium">{aircraft.flight_hours?.toLocaleString?.() ?? aircraft.flight_hours}</div>
                  <div className="text-muted-foreground">Ciclos</div>
                  <div className="font-medium">{aircraft.flight_cycles?.toLocaleString?.() ?? aircraft.flight_cycles}</div>
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
                      <span>{aircraft.flight_hours?.toLocaleString?.() ?? aircraft.flight_hours} / {aircraft.flight_cycles?.toLocaleString?.() ?? aircraft.flight_cycles}</span>
                    </div>
                  </div>

                  {/* Estadísticas del Mes */}
                  <div className="rounded-md border">
                    <div className="flex items-center justify-between border-b px-3 py-2 text-sm">
                      <span className="text-muted-foreground">Estadísticas del mes</span>
                      <span className="text-muted-foreground">Valor</span>
                    </div>
                    <MonthlyFlightStats acronym={aircraft.acronym} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Árbol de partes por categorías */}
          <Card className="border-muted/40">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-base">Partes por Categoría</CardTitle>
              <div className="text-xs text-muted-foreground">{totalParts} partes instaladas</div>
            </CardHeader>
            <CardContent>
              {tree.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">Sin partes instaladas.</div>
              ) : (
                <div ref={listRef} className="space-y-4">
                  {/* Plantas de Poder */}
                  {/* Plantas de Poder */}
                  {partsByCategory.ENGINE.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                        <Cog className="h-4 w-4" />
                        Plantas de Poder ({partsByCategory.ENGINE.length})
                        Plantas de Poder ({partsByCategory.ENGINE.length})
                      </div>
                      <div className="ml-4 space-y-1">
                        {partsByCategory.ENGINE.map((node) => (
                          <TreeNode key={node.key} node={node} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* APU */}
                  {partsByCategory.APU.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                        <Zap className="h-4 w-4" />
                        APU ({partsByCategory.APU.length})
                      </div>
                      <div className="ml-4 space-y-1">
                        {partsByCategory.APU.map((node) => (
                          <TreeNode key={node.key} node={node} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Hélices */}
                  {partsByCategory.PROPELLER.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                        <Fan className="h-4 w-4" />
                        Hélices ({partsByCategory.PROPELLER.length})
                      </div>
                      <div className="ml-4 space-y-1">
                        {partsByCategory.PROPELLER.map((node) => (
                          <TreeNode key={node.key} node={node} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <button onClick={() => expandAll(true)} className="underline-offset-2 hover:underline">Expandir todo</button>
                <span>•</span>
                <button onClick={() => expandAll(false)} className="underline-offset-2 hover:underline">Colapsar todo</button>
              </div>
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
                <div className="space-y-6">
                  {/* Plantas de Poder */}
                  {filteredPartsByCategory.ENGINE.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                        <Cog className="h-4 w-4" />
                        Plantas de Poder ({filteredPartsByCategory.ENGINE.length})
                      </div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                          <TableHead>Tipo</TableHead>
                              <TableHead>Parte</TableHead>
                              <TableHead className="hidden sm:table-cell">PN</TableHead>
                          <TableHead className="hidden md:table-cell">TSN / TSO</TableHead>
                          <TableHead className="hidden md:table-cell">CSN / CSO</TableHead>
                              <TableHead className="hidden lg:table-cell">Instalada</TableHead>
                          <TableHead className="text-right">H/C al instalar</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                        {PART_TYPE_CONFIG.flatMap(typeConfig => 
                          filteredPartsByCategory[typeConfig.type].map(assignment => (
                            <PartTableRow 
                              key={assignment.id} 
                              assignment={assignment} 
                              typeConfig={typeConfig} 
                            />
                          ))
                        )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}