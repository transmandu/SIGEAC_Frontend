"use client"

import { useMemo, useRef, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Plane, Hash, MapPin, Calendar as CalendarIcon, Layers, Search, PackageCheck, CircleDot, Clock, RotateCcw, ChevronRight, Component, Package } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AircraftAssigment, MaintenanceAircraft, MaintenanceAircraftPart } from "@/types"


// =========================
// Utilidades
// =========================
const fmtDate = (d?: string | Date | null) => {
  if (!d) return "—"
  const date = typeof d === "string" ? new Date(d) : d
  if (isNaN(date.getTime())) return "—"
  return format(date, "PPP", { locale: es })
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

function buildTreeFromAssignments(assignments: AircraftAssigment[]): PartNode[] {
  // Si el primer assignment ya tiene sub_parts, asumimos árbol completo
  const anyHasSub = assignments.some((a) => a.aircraft_part?.sub_parts?.length)
  if (anyHasSub) {
    // Map recursivo directo desde sub_parts
    const mapFromPart = (part: MaintenanceAircraftPart, meta: Pick<AircraftAssigment, "id" | "assigned_date" | "hours_at_installation" | "cycles_at_installation">): PartNode => ({
      key: (part as any).id ? String((part as any).id) : part.part_number,
      assignment_id: meta.id,
      assigned_date: meta.assigned_date,
      hours_at_installation: meta.hours_at_installation,
      cycles_at_installation: meta.cycles_at_installation,
      part,
      children: (part.sub_parts || []).map((sp) => mapFromPart(sp, meta)),
    })
    return assignments
      .filter((a) => a.removed_date === null)
      .map((a) => mapFromPart(a.aircraft_part, a))
  }

  // Si viene plano, ensamblamos usando parent_part_id
  const current = assignments.filter((a) => a.removed_date === null)
  const nodes: PartNode[] = current.map((a) => ({
    key: (a.aircraft_part as any).id ? String((a.aircraft_part as any).id) : a.aircraft_part.part_number,
    assignment_id: a.id,
    assigned_date: a.assigned_date,
    hours_at_installation: a.hours_at_installation,
    cycles_at_installation: a.cycles_at_installation,
    part: a.aircraft_part,
    children: [],
  }))

  const byKey = new Map(nodes.map((n) => [n.key, n]))

  const roots: PartNode[] = []
  for (const n of nodes) {
    const parentId = n.part.parent_part_id
    // Intento 1: match por id si existe
    if (parentId && byKey.has(parentId)) {
      byKey.get(parentId)!.children.push(n)
      continue
    }
    // Intento 2: match por part_number
    if (parentId && byKey.has(parentId)) {
      byKey.get(parentId)!.children.push(n)
    } else {
      roots.push(n)
    }
  }
  return roots
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
            <Badge variant="outline" className="capitalize">{p.condition_type || "—"}</Badge>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span>H: {p.total_flight_hours ?? "—"}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>C: {p.total_flight_cycles ?? "—"}</span>
            </div>
          </div>
        </div>
      </summary>
      <div className="ml-8 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" /> Instalado: <span className="ml-1 text-foreground">{fmtDate(node.assigned_date)}</span></div>
        <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Horas al instalar: <span className="ml-1 text-foreground">{node.hours_at_installation || "—"}</span></div>
        <div className="flex items-center gap-1"><RotateCcw className="h-3.5 w-3.5" /> Ciclos al instalar: <span className="ml-1 text-foreground">{node.cycles_at_installation || "—"}</span></div>
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

  const currentAssignments = useMemo(
    () => (aircraft.aircraft_assignments || []).filter((a) => a.removed_date === null),
    [aircraft.aircraft_assignments]
  )

  // Resumen rápido de partes
  const totalParts = currentAssignments.length
  const byCondition = useMemo(() => {
    const m = new Map<string, number>()
    for (const a of currentAssignments) {
      const c = a.aircraft_part?.condition_type || "—"
      m.set(c, (m.get(c) || 0) + 1)
    }
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1])
  }, [currentAssignments])

  const totals = useMemo(() => {
    const hours = sum(currentAssignments.map((a) => asNum(a.aircraft_part?.total_flight_hours || 0)))
    const cycles = sum(currentAssignments.map((a) => asNum(a.aircraft_part?.total_flight_cycles || 0)))
    return { hours, cycles }
  }, [currentAssignments])

  // Árbol
  const tree = useMemo(() => buildTreeFromAssignments(currentAssignments), [currentAssignments])

  // Filtro de búsqueda por nombre/PN/condición (sobre el listado plano para la pestaña "Partes")
  const flat = useMemo(() => currentAssignments, [currentAssignments])
  const filteredFlat = useMemo(() => {
    if (!q) return flat
    const qq = q.toLowerCase()
    return flat.filter((a) => {
      const p = a.aircraft_part
      return (
        p.part_name?.toLowerCase().includes(qq) ||
        p.part_number?.toLowerCase().includes(qq) ||
        p.condition_type?.toLowerCase().includes(qq)
      )
    })
  }, [flat, q])

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
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            <Plane className="h-6 w-6" /> {aircraft.acronym}
          </h1>
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
                  <div className="flex items-center gap-2 text-muted-foreground"><Hash className="h-4 w-4" /> Acrónimo</div>
                  <div className="font-medium">{aircraft.acronym || "—"}</div>

                  <div className="flex items-center gap-2 text-muted-foreground"><Hash className="h-4 w-4" /> Serial</div>
                  <div className="font-medium">{aircraft.serial || "—"}</div>

                  <div className="flex items-center gap-2 text-muted-foreground"><CalendarIcon className="h-4 w-4" /> Fabricación</div>
                  <div className="font-medium">{fmtDate(aircraft.fabricant_date)}</div>

                  <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> Ubicación</div>
                  <div className="font-medium">{aircraft?.location?.address ?? aircraft?.location?.name ?? "—"}</div>
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
                <CardTitle className="text-base">Resumen de partes instaladas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><PackageCheck className="h-4 w-4" /> Partes instaladas</div>
                    <div className="text-base font-semibold">{totalParts}</div>
                  </div>

                  <div className="rounded-md border">
                    <div className="flex items-center justify-between border-b px-3 py-2 text-sm">
                      <span className="text-muted-foreground">Totales estimados</span>
                      <span className="text-muted-foreground">H / C</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="flex items-center gap-2"><CircleDot className="h-4 w-4" /> Horas / Ciclos</span>
                      <span className="font-medium">{totals.hours.toLocaleString()} / {totals.cycles.toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-xs text-muted-foreground">Por condición</div>
                    <div className="flex flex-wrap gap-2">
                      {byCondition.map(([cond, n]) => (
                        <Badge key={cond} variant="secondary" className="capitalize">{cond}: {n}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Árbol rápido (opcional en resumen) */}
          <Card className="border-muted/40">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-base">Árbol de partes (actual)</CardTitle>
              <div className="text-xs text-muted-foreground">{totalParts} asignaciones</div>
            </CardHeader>
            <CardContent>
              {tree.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">Sin partes instaladas.</div>
              ) : (
                <div ref={listRef} className="space-y-1">
                  {tree.map((n) => (
                    <TreeNode key={n.key} node={n} />
                  ))}
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
                  placeholder="Buscar por nombre, PN o condición"
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
                        <TableHead>Parte</TableHead>
                        <TableHead className="hidden sm:table-cell">PN</TableHead>
                        <TableHead className="hidden md:table-cell">Condición</TableHead>
                        <TableHead className="hidden md:table-cell">H / C (parte)</TableHead>
                        <TableHead className="hidden lg:table-cell">Instalada</TableHead>
                        <TableHead className="text-right">Horas/Ciclos al instalar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFlat.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.aircraft_part.part_name}</TableCell>
                          <TableCell className="hidden sm:table-cell">{a.aircraft_part.part_number}</TableCell>
                          <TableCell className="hidden md:table-cell"><Badge variant="secondary" className="capitalize">{a.aircraft_part.condition_type}</Badge></TableCell>
                          <TableCell className="hidden md:table-cell">{a.aircraft_part.total_flight_hours} / {a.aircraft_part.total_flight_cycles}</TableCell>
                          <TableCell className="hidden lg:table-cell">{fmtDate(a.assigned_date)}</TableCell>
                          <TableCell className="text-right">{a.hours_at_installation} / {a.cycles_at_installation}</TableCell>
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
