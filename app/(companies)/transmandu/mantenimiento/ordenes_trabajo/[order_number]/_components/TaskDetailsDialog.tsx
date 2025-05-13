'use client'

import { useUpdateWorkOrderTask, useUpdateWorkOrderTaskStatus } from '@/actions/planificacion/ordenes_trabajo/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useGetWorkOrderEmployees } from '@/hooks/planificacion/useGetWorkOrderEmployees'
import { WorkOrder } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Pencil, User2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import CreateNoRutineDialog from './CreateNoRutineDialog'
import { useUpdateNoRoutineTask } from '@/actions/planificacion/ordenes_trabajo/no_rutinarios/actions'

// Esquema del formulario para asignación de responsables
const assignmentFormSchema = z.object({
  technician_responsable: z.string().min(1, "Debe seleccionar un técnico"),
  inspector_responsable: z.string().optional()
})

type TaskDetailsDialogProps = {
  selectedTask: WorkOrder["work_order_tasks"][0] | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isNonRoutine?: boolean
  mainTask?: WorkOrder["work_order_tasks"][0] | null
}

export const TaskDetailsDialog = ({
  selectedTask,
  open,
  onOpenChange,
  isNonRoutine = false,
  mainTask = null
}: TaskDetailsDialogProps) => {
  // Estados del componente
  const [isEditing, setIsEditing] = useState(false)

  // Hooks para datos y mutaciones
  const { data: technicians, isLoading: isTechniciansLoading } = useGetWorkOrderEmployees()
  const { updateWorkOrderTask } = useUpdateWorkOrderTask()
  const { updateNoRoutineTask } = useUpdateNoRoutineTask()
  const { updateTaskStatus } = useUpdateWorkOrderTaskStatus()

  // Formulario para asignación
  const form = useForm<z.infer<typeof assignmentFormSchema>>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      technician_responsable: selectedTask?.technician_responsable || "",
      inspector_responsable: selectedTask?.inspector_responsable || ""
    }
  })

  // Manejar el cierre de la tarea
  const handleCompleteTask = async () => {
    if (!selectedTask) return

    try {
      if (isNonRoutine) {
        await updateNoRoutineTask.mutateAsync({
          id: selectedTask.id.toString(),
          status: "CERRADO",
        })
      } else {
        await updateTaskStatus.mutateAsync({
          task_id: selectedTask.id.toString(),
          status: "CERRADO"
        })
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Error al cerrar la tarea:", error)
    }
  }

  // Manejar el envío del formulario
  const handleSubmit = async (values: z.infer<typeof assignmentFormSchema>) => {
    if (!selectedTask) return
    try {
      if (isNonRoutine) {
        await updateNoRoutineTask.mutateAsync({
          id: selectedTask.id.toString(),
          ...values
        })
      } else {
        await updateWorkOrderTask.mutateAsync({
          id: selectedTask.id.toString(),
          ...values
        })
      }
      setIsEditing(false)
    } catch (error) {
      console.error("Error al actualizar la tarea:", error)
    } finally {
      onOpenChange(false)
    }
  }

  // Resetear el formulario cuando cambia la tarea seleccionada
  useEffect(() => {
    if (selectedTask) {
      form.reset({
        technician_responsable: selectedTask.technician_responsable || "",
        inspector_responsable: selectedTask.inspector_responsable || ""
      })
      setIsEditing(false)
    }
  }, [selectedTask, form])

  if (!selectedTask) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isNonRoutine ? `Detalles No Rutinaria - ${mainTask?.task_number}` : 'Detalles Tarea'}
            {selectedTask?.task_number && `: ${selectedTask.task_number}`}
          </DialogTitle>
          <DialogDescription className="text-center">
            Información completa de la tarea seleccionada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 w-full">
          {/* Información básica de la tarea */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 place-content-center">
            <div>
              <h3 className="font-medium">Descripción</h3>
              <p className="text-sm text-muted-foreground">
                {selectedTask.description_task}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Manual de Origen</h3>
              <p className="text-sm text-muted-foreground">
                {selectedTask.origin_manual}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Código ATA</h3>
              <p className="text-sm text-muted-foreground">
                {mainTask ? mainTask.ata : selectedTask.ata}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Estado</h3>
              <div className='flex gap-2'>
                <Badge className={selectedTask.status === "ABIERTO" ? "cursor-pointer" : "bg-red-500 hover:bg-red-600 cursor-pointer"}>
                  {selectedTask.status}
                </Badge>
                {
                  selectedTask.non_routine && (
                    <Badge className={selectedTask.non_routine.status === "ABIERTO" ? "bg-yellow-500" : ""}>No Rutinaria - {selectedTask.non_routine.status}</Badge>
                  )
                }
              </div>
            </div>
          </div>

          {/* Sección de responsables */}
          {isEditing || (!selectedTask.technician_responsable && !selectedTask.inspector_responsable) ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="technician_responsable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Técnico Responsable</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isTechniciansLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un técnico" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isTechniciansLoading ? (
                            <div className="flex justify-center py-2">
                              <Loader2 className="animate-spin h-4 w-4" />
                            </div>
                          ) : (
                            technicians?.map((tech) => (
                              <SelectItem
                                key={tech.dni}
                                value={tech.dni}
                              >
                                {tech.first_name} {tech.last_name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inspector_responsable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inspector Responsable</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingrese inspector..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2 flex gap-2">
                  <Button
                    type="submit"
                    disabled={updateWorkOrderTask.isPending || updateNoRoutineTask.isPending}
                    className="flex-1"
                  >
                    {updateWorkOrderTask.isPending ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : null}
                    Confirmar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Técnico responsable */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Técnico Responsable</h3>
                  {selectedTask.status === "ABIERTO" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded">
                      <User2 className="h-4 w-4" />
                      <span>{selectedTask.technician_responsable}</span>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-60">
                    <h4 className="font-medium mb-2">Técnicos anteriores</h4>
                    {selectedTask.old_technician?.length ? (
                      <ul className="space-y-1">
                        {selectedTask.old_technician.map((tech, index) => (
                          <li key={index} className="text-sm">
                            {tech}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No hay técnicos anteriores
                      </p>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Inspector responsable */}
              <div className="space-y-2">
                <h3 className="font-medium">Inspector Responsable</h3>
                <div className="flex items-center gap-2 p-2">
                  <User2 className="h-4 w-4" />
                  <span>
                    {selectedTask.inspector_responsable || "No asignado"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Lista de artículos/partes */}
          {selectedTask.task_items.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Artículos Requeridos</h3>
              <ScrollArea className={selectedTask.task_items.length > 3 ? "h-[200px]" : ""}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Parte</TableHead>
                      <TableHead>Alterno</TableHead>
                      <TableHead>Serial</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTask.task_items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.article_part_number}</TableCell>
                        <TableCell>
                          {item.article_alt_part_number || "-"}
                        </TableCell>
                        <TableCell>
                          {item.article_serial || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Pie de diálogo con acciones */}
        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
          {selectedTask.status === "ABIERTO" &&
            selectedTask.technician_responsable &&
            !isEditing && (
              <div className='flex gap-2 items-center'>
                {
                  !selectedTask.non_routine && (
                    <CreateNoRutineDialog task_id={selectedTask.id.toString()} />
                  )
                }
                <Button
                  onClick={handleCompleteTask}
                  disabled={updateTaskStatus.isPending || (selectedTask.non_routine?.status === "ABIERTO") || updateNoRoutineTask.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updateTaskStatus.isPending ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  ) : null}
                  Confirmar Cierre
                </Button>
              </div>
            )
          }
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}
