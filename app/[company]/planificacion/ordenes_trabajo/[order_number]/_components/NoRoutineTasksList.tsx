'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { WorkOrderTask } from "@/types"
import { ChevronDown, ChevronRight, CircleEllipsis, EyeIcon, LayoutGrid, Plus, ScanEye, Table2 } from "lucide-react"
import { useState } from "react"
import TaskCard from "./TaskCard"
import { TaskDetailsDialog } from "./TaskDetailsDialog"
import { cn } from "@/lib/utils"

interface NonRoutineTasksListProps {
  tasks: WorkOrderTask[]
  onCreateNew: () => void
}

export const NonRoutineTasksList = ({
  tasks,
}: NonRoutineTasksListProps) => {
  const [selectedTask, setSelectedTask] = useState<WorkOrderTask | null>(null)
  const [mainTask, setMainTask] = useState<WorkOrderTask | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [expandedNonRoutines, setExpandedNonRoutines] = useState<Record<number, boolean>>({})
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  // Filtrar solo las tareas principales no rutinarias
  const nonRoutineMainTasks = tasks.filter(task => task.non_routine)

  const toggleExpand = (taskId: number) => {
    setExpandedNonRoutines(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }))
  }

  const handleTaskClick = (task: WorkOrderTask, mainTask?: WorkOrderTask) => {
    if (mainTask) {
      setMainTask(mainTask)
    }
    setSelectedTask(task)
    setIsDetailsOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
          className="gap-2"
        >
          {viewMode === 'cards' ? (
            <>
              <Table2 className="h-4 w-4" />
              <span>Vista tabla</span>
            </>
          ) : (
            <>
              <LayoutGrid className="h-4 w-4" />
              <span>Vista tarjetas</span>
            </>
          )}
        </Button>
      </div>

      {viewMode === 'cards' ? (
        <div className="space-y-2">
          {nonRoutineMainTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay tareas no rutinarias registradas
            </div>
          ) : (
            nonRoutineMainTasks.map(mainTask => {
              const nonRoutine = mainTask.non_routine!
              const subtasks = nonRoutine.no_routine_task || []
              const isExpanded = expandedNonRoutines[mainTask.id]
              const taskOrigin = mainTask.task_number || 'Directa'
              return (
                <Card key={mainTask.id} className="overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleExpand(mainTask.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <div>
                        <CardTitle className="text-lg flex items-center mb-2">
                          NR: {taskOrigin}
                          <Badge className={cn("ml-2", mainTask.status === "ABIERTA" ? "" : "bg-red-500")}>
                            {nonRoutine.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {nonRoutine.description}
                        </CardDescription>
                        <div className="text-sm text-muted-foreground">
                          ATA: {nonRoutine.ata} | Origen: {taskOrigin}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTaskClick(mainTask)
                      }}
                    >
                      <ScanEye className="h-8 w-8" />
                    </Button>
                  </div>

                  {isExpanded && (
                    <CardContent className="p-0 border-t">
                      <div className="p-4">
                        <h4 className="font-medium mb-2">Acción tomada:</h4>
                        <p className="text-sm">{nonRoutine.action || 'Sin acción especificada'}</p>
                      </div>

                      {subtasks.length > 0 && (
                        <div className="p-4 pt-0">
                          <h4 className="font-medium mb-2">Tareas a realizar:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subtasks.map(subtask => (
                              <TaskCard
                                task={subtask}
                                key={subtask.id}
                                onClick={() => handleTaskClick(subtask, mainTask)}
                                isNonRoutine
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              )
            })
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table className="tasks-table">
            <TableHeader>
              <TableRow>
                {/* Nueva columna para el botón de expansión */}
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="min-w-[300px]">Descripción</TableHead>
                <TableHead className="w-[100px]">ATA</TableHead>
                <TableHead className="w-[120px]">Origen</TableHead>
                <TableHead className="min-w-[200px]">Acción</TableHead>
                <TableHead className="w-[100px]">Estado</TableHead>
                <TableHead className="w-[120px]">Tareas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nonRoutineMainTasks.map(mainTask => {
                const nonRoutine = mainTask.non_routine!
                const subtasks = nonRoutine.no_routine_task || []
                const isExpanded = expandedNonRoutines[mainTask.id]
                const taskOrigin = mainTask.task_number || 'Directa'

                return (
                  <div key={mainTask.id}>
                    {/* Fila principal */}
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleTaskClick(mainTask)}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpand(mainTask.id)
                          }}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {nonRoutine.description}
                      </TableCell>
                      <TableCell>{nonRoutine.ata}</TableCell>
                      <TableCell>{taskOrigin}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {nonRoutine.action || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={mainTask.status === "ABIERTO" ? "default" : "secondary"}>
                          {mainTask.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {subtasks.length > 0 ? (
                          <Badge variant="outline">{subtasks.length} tareas</Badge>
                        ) : (
                          <span className="text-muted-foreground">Ninguna</span>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Subtareas */}
                    {isExpanded && subtasks.map(subtask => (
                      <TableRow
                        key={`sub-${subtask.id}`}
                        className="bg-muted/10 hover:bg-muted/25 cursor-pointer"
                        onClick={() => handleTaskClick(subtask, mainTask)}
                      >
                        <TableCell></TableCell> {/* Celda vacía para alineación */}
                        <TableCell className="pl-8 font-medium">
                          <span className="text-muted-foreground mr-2">↳</span>
                          {subtask.description_task}
                        </TableCell>
                        <TableCell>{subtask.ata}</TableCell>
                        <TableCell>Subtarea</TableCell>
                        <TableCell>N/A</TableCell>
                        <TableCell>
                          <Badge variant={subtask.status === "ABIERTO" ? "default" : "secondary"}>
                            {subtask.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {subtask.task_items?.length || 0} artículos
                        </TableCell>
                      </TableRow>
                    ))}
                  </div>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <TaskDetailsDialog
        selectedTask={selectedTask!}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        mainTask={mainTask!}
        isNonRoutine={!!mainTask}
      />
    </div>
  )
}
