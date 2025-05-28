'use client'
import { useCreateNoRutine } from '@/actions/planificacion/ordenes_trabajo/no_rutinarios/actions'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronRight, Plus, Trash } from 'lucide-react'
import { useState } from 'react'
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'
import { Switch } from '../ui/switch'
import { Textarea } from '../ui/textarea'

// Esquemas de validación
const nonRoutineSchema = z.object({
  ata: z.string().min(1, "ATA es requerido"),
  description: z.string().min(1, "Descripción es requerida"),
  action: z.string().min(1, "Acción es requerida").optional(),
  inspector_responsable: z.string().min(1, "Inspector responsable es requerido"),
  needs_task: z.boolean().default(false),
})

const taskSchema = z.object({
  description_task: z.string().min(1, "Descripción es requerida"),
  ata: z.string().min(1, "ATA es requerido"),
  origin_manual: z.string().min(1, "Manual de origen es requerido"),
  task_items: z.array(z.object({
    article_part_number: z.string().min(1, "Número de parte es requerido"),
    article_serial: z.string().optional(),
    article_alt_part_number: z.string().optional()
  })).optional()
})

type FormValues = {
  nonRoutine: z.infer<typeof nonRoutineSchema>
  tasks?: z.infer<typeof taskSchema>[]
}

const CreateNoRutineForm = ({ id, onClose }: { id: string, onClose: () => void }) => {
  const [step, setStep] = useState(1)
  const { createNoRutine } = useCreateNoRutine()

  const form = useForm<FormValues>({
    resolver: zodResolver(z.object({
      nonRoutine: nonRoutineSchema,
      tasks: z.array(taskSchema).optional()
    })),
    defaultValues: {
      nonRoutine: {
        ata: "",
        description: "",
        action: "",
        inspector_responsable: "",
        needs_task: false,
      }
    }
  })

  const needsTask = form.watch('nonRoutine.needs_task')

  const nextStep = async () => {
    // Validar el paso actual antes de avanzar
    if (step === 1) {
      const valid = await form.trigger('nonRoutine')
      if (!valid) return
    }
    setStep(step + 1)
  }

  const prevStep = () => setStep(step > 1 ? step - 1 : 1)

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data.nonRoutine,
        work_order_task_id: id,
        tasks: data.nonRoutine.needs_task ? data.tasks : undefined
      }
      await createNoRutine.mutateAsync(payload)
    } catch (error) {
      console.error(error)
    } finally {
      onClose()
    }
  }

  const addTask = () => {
    const tasks = form.getValues('tasks') || []
    form.setValue('tasks', [
      ...tasks,
      {
        description_task: '',
        ata: '',
        origin_manual: '',
        task_items: []
      }
    ])
  }

  const removeTask = (index: number) => {
    const tasks = form.getValues('tasks') || []
    form.setValue('tasks', tasks.filter((_, i) => i !== index))
  }

  const addItemToTask = (taskIndex: number) => {
    const tasks = form.getValues('tasks') || []
    const taskItems = tasks[taskIndex]?.task_items || []

    const updatedTasks = [...tasks]
    updatedTasks[taskIndex] = {
      ...updatedTasks[taskIndex],
      task_items: [...taskItems, { article_part_number: '', article_serial: '', article_alt_part_number: '' }]
    }

    form.setValue('tasks', updatedTasks)
  }

  const removeItemFromTask = (taskIndex: number, itemIndex: number) => {
    const tasks = form.getValues('tasks') || []
    const updatedTasks = [...tasks]
    updatedTasks[taskIndex].task_items = updatedTasks[taskIndex].task_items?.filter((_, i) => i !== itemIndex)
    form.setValue('tasks', updatedTasks)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Generar - No Rutinaria
          </CardTitle>
          <CardDescription>
            Complete los campos requeridos en cada paso
          </CardDescription>
        </CardHeader>

        <Separator className="mb-6" />

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Paso 1: Información básica */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nonRoutine.ata"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código ATA <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: 25-10-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nonRoutine.inspector_responsable"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inspector Responsable <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del inspector" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="nonRoutine.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describa el problema encontrado..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nonRoutine.action"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Acción Correctiva</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describa las acciones tomadas o requeridas..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nonRoutine.needs_task"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Requiere creación de tareas
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            {field.value
                              ? "Se necesitará una TASK para esta no rutinaria."
                              : "Solo se registrará como no rutinaria."}
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Paso 2: Tareas asociadas */}
              {step === 2 && needsTask && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Tareas a crear</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTask}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar tarea
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <ScrollArea className='max-h-[500px] overflow-y-auto'>
                      <div className="flex flex-col gap-4">
                        {form.watch('tasks')?.map((_, index) => (
                          <div key={index} className="space-y-4 border p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                              <Badge variant="outline">Tarea {index + 1}</Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTask(index)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>

                            <FormField
                              control={form.control}
                              name={`tasks.${index}.description_task`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Descripción*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Descripción de la tarea" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`tasks.${index}.ata`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Código ATA*</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Ej: 25-10-00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`tasks.${index}.origin_manual`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Manual de Origen*</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Manual de referencia" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}

              {/* Paso 3: Artículos por tarea */}
              {step === 3 && needsTask && (
                <div className="space-y-6">
                  {form.watch('tasks')?.map((task, taskIndex) => (
                    <div key={taskIndex} className="space-y-4 border p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Tarea {taskIndex + 1}</Badge>
                        <p className="text-sm font-medium">{task.description_task}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Artículos: </h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addItemToTask(taskIndex)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar artículo
                          </Button>
                        </div>

                        {task.task_items?.map((_, itemIndex) => (
                          <div key={itemIndex} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                            <FormField
                              control={form.control}
                              name={`tasks.${taskIndex}.task_items.${itemIndex}.article_part_number`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>N° Parte*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Número de parte" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`tasks.${taskIndex}.task_items.${itemIndex}.article_serial`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Serial</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Número de serie" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`tasks.${taskIndex}.task_items.${itemIndex}.article_alt_part_number`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Parte Alterno</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Parte alternativo" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="mb-[5px]"
                              onClick={() => removeItemFromTask(taskIndex, itemIndex)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Navegación entre pasos */}
              <div className="flex justify-end pt-4">
                {
                  form.watch('nonRoutine.needs_task') === false && (
                    <Button type='submit' disabled={createNoRutine.isPending}>Crear No Rutinario</Button>
                  )
                }
                {step < (needsTask ? 3 : 1) && (
                  <Button
                    type="button"
                    onClick={nextStep}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                {step === 3 && (
                  <Button type='submit' disabled={createNoRutine.isPending}>Crear No Rutinario</Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateNoRutineForm
