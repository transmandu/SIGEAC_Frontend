'use client'
import { Progress } from "@/components/ui/progress"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useCheckWorkOrderArticles } from "@/hooks/planificacion/useCheckWorkOrderArticles"
import { cn } from "@/lib/utils"
import { WorkOrder } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { NonRoutineTasksList } from "./NoRoutineTasksList"
import { RoutineTasksList } from "./RoutineTasksList"
import { TaskDetailsDialog } from "./TaskDetailsDialog"
import PrelimInspecTable from "./PrelimInspecTable"
// Esquema del formulario para asignar técnicos/inspectores
const assignmentFormSchema = z.object({
  task_id: z.number(),
  technician_responsable: z.string().min(1, "Debe seleccionar un técnico"),
  inspector_responsable: z.string().optional()
})

interface ArticleAvailability {
  article: string;
  available: boolean;
  location?: string;
  warehouse?: string;
}

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>

// Tipo para las tareas de la orden de trabajo
type WorkOrderTask = WorkOrder["work_order_tasks"][0]

const WorkOrderTasksDetails = ({ work_order }: { work_order: WorkOrder }) => {
  const [selectedTask, setSelectedTask] = useState<WorkOrderTask | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [articleAvailability, setArticleAvailability] = useState<ArticleAvailability[]>([]);
  const { data, mutateAsync: check_mutate, isPending: isCheckLoading } = useCheckWorkOrderArticles()

  // Formulario para asignación de personal
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema)
  })

  // Calcula estadísticas de progreso
  const { completedCount, totalCount, progressValue } = useMemo(() => {
    const total = work_order.work_order_tasks.length
    const completed = work_order.work_order_tasks.filter(task => task.status === "CERRADO").length
    return {
      completedCount: completed,
      totalCount: total,
      progressValue: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }, [work_order])


  const handleCheckTaskItems = async () => {
    try {
      const taskIds = work_order.work_order_tasks.map(task => task.id);
      const result = await check_mutate(taskIds);
      setArticleAvailability(result);
      // Mostrar notificación o alerta con los resultados
      const availableCount = result.filter(item => item.available).length;
      if (availableCount > 0) {
        toast.success(`${availableCount} artículo(s) disponibles en almacén.`);
      } else {
        toast.warning("Ningún artículo disponible en almacén");
      }
    } catch (error) {
      toast.error("Error al verificar artículos");
    }
  };

  const openTaskDetails = (task: WorkOrderTask) => {
    setSelectedTask(task)
    setIsDetailsOpen(true)
    form.reset({
      task_id: task.id,
      technician_responsable: task.technician_responsable || "",
      inspector_responsable: task.inspector_responsable || ""
    })
  }

  return (
    <div className="space-y-4">
      {/* Encabezado y progreso */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-center">Progreso de Orden de Trabajo</h1>
        <p className="text-center text-muted-foreground italic">
          {completedCount} de {totalCount} tarea(s) completada(s).</p>
        <Progress
          value={progressValue}
          className={cn(
            "w-full",
            progressValue === 100 ? "bg-green-500" : ""
          )}
        />
      </div>
      <Tabs defaultValue="rut">
        <TabsList>
          <TabsTrigger value="insp">Insp. Preliminar</TabsTrigger>
          <TabsTrigger value="rut">Rutinarias</TabsTrigger>
          <TabsTrigger value="norut">No Rutinarias</TabsTrigger>
        </TabsList>
        <TabsContent value="insp" className="space-y-4">
          <PrelimInspecTable work_order={work_order} />
        </TabsContent>
        <TabsContent value="rut" className="space-y-4">
          <RoutineTasksList
            tasks={work_order.work_order_tasks}
            onTaskClick={openTaskDetails}
            onCheckArticles={handleCheckTaskItems}
            isCheckLoading={isCheckLoading}
          />
          <TaskDetailsDialog selectedTask={selectedTask} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} />
        </TabsContent>
        <TabsContent value="norut">
          <NonRoutineTasksList
            tasks={work_order.work_order_tasks}
            onCreateNew={() => setIsCreateOpen(true)}
          />
        </TabsContent>
      </Tabs>
    </div >
  )
}

export default WorkOrderTasksDetails
