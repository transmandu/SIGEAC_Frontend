// components/RoutineTasksList.tsx
'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { WorkOrder } from "@/types"
import { Check, Filter, Grid, List, Loader2, PackageCheck, Plus, Search } from "lucide-react"
import { useState } from "react"
import TaskCard from "./TaskCard"
import { AddRoutineTaskDialog } from "./AddRoutineTaskDialog"

type WorkOrderTask = WorkOrder["work_order_tasks"][0]

interface RoutineTasksListProps {
  work_order_id: string,
  tasks: WorkOrderTask[]
  onTaskClick: (task: WorkOrderTask) => void
  onCheckArticles: () => Promise<void>
  isCheckLoading: boolean
}

export const RoutineTasksList = ({
  work_order_id,
  tasks,
  onTaskClick,
  onCheckArticles,
  isCheckLoading,
}: RoutineTasksListProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
  const [statusFilter, setStatusFilter] = useState<"all" | "ABIERTO" | "CERRADO">("all")

  const filteredTasks = tasks
    .filter(task => {
      // Filtrado por término de búsqueda
      const matchesSearch = searchTerm === "" || [
        task.description_task,
        task.task_number,
        task.ata,
        task.technician_responsable,
        task.inspector_responsable,
        ...(task.old_technician || [])
      ].some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = statusFilter === "all" || task.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "ABIERTO" ? -1 : 1
      }
      return a.id - b.id
    })

  return (
    <div className="space-y-4">
      {/* Controles de filtrado y vista */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tareas..."
            className="pl-9 w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                <span>Filtrar: {statusFilter === "all" ? "Todos" : statusFilter}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {["all", "ABIERTO", "CERRADO"].map((filter) => (
                <DropdownMenuItem
                  key={filter}
                  onClick={() => setStatusFilter(filter as "all" | "ABIERTO" | "CERRADO")}
                  className="flex items-center gap-2"
                >
                  <Check className={cn(
                    "h-4 w-4",
                    statusFilter !== filter && "invisible"
                  )} />
                  {filter === "all" ? "Todos" : filter === "ABIERTO" ? "Abiertas" : "Cerradas"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === "cards" ? "table" : "cards")}
            className="gap-2"
          >
            {viewMode === "cards" ? (
              <>
                <List className="h-4 w-4" />
                <span>Vista tabla</span>
              </>
            ) : (
              <>
                <Grid className="h-4 w-4" />
                <span>Vista tarjetas</span>
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onCheckArticles}
            className="flex items-center gap-2"
          >
            {isCheckLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <p className="flex gap-2 items-center text-sm"><PackageCheck className="h-4 w-4" /> Verificar Articulos</p>
            )}
          </Button>
          <AddRoutineTaskDialog work_order_id={work_order_id}   />
        </div>
      </div>

      {/* Listado de tareas */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
          <Search className="h-8 w-8" />
          <p>No se encontraron tareas</p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>ATA</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Artículos</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow
                  key={task.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onTaskClick(task)}
                >
                  <TableCell className="font-medium">{task.id}</TableCell>
                  <TableCell>{task.ata}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {task.description_task}
                  </TableCell>
                  <TableCell>
                    {task.task_items.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {task.task_items.map((item, idx) => (
                          <Badge key={idx} variant="outline" className="truncate max-w-24">
                            {item.article_part_number}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.technician_responsable || (
                      <span className="text-muted-foreground">No asignado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.inspector_responsable || (
                      <span className="text-muted-foreground">No asignado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={task.status === "ABIERTO" ? "default" : "secondary"}>
                      {task.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
