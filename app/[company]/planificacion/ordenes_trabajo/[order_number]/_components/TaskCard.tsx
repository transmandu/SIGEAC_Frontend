import { WorkOrder } from '@/types'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from '@/components/ui/badge'

type WorkOrderTask = WorkOrder["work_order_tasks"][0]

const TaskCard = ({
  task,
  onClick,
  isNonRoutine = false
}: {
  task: WorkOrderTask,
  isNonRoutine?: boolean,
  onClick: () => void
}) => {
  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer h-full"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className='flex gap-2 items-center'>
          {isNonRoutine ? 'No Rutinaria' : `Tarea: ${task.task_number}`}
          <Badge className={task.status === "ABIERTO" ? "bg-primary" : "bg-red-500"}>{task.status}</Badge>
        </CardTitle>
        {isNonRoutine && task.non_routine && (
          <CardDescription>
            Origen: {task.non_routine.work_order_task ?
              `Tarea ${task.non_routine.work_order_task.task_number}` :
              'Directa'}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm line-clamp-3">
          {task.description_task}
        </p>
        <div>
          <h4 className="text-sm font-medium mb-1">Artículos:</h4>
          {task.task_items.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {task.task_items.map((item, idx) => (
                <Badge key={idx} variant="outline" className="truncate max-w-24">
                  {item.article_part_number}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No se requieren artículos</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Técnico:</p>
            <p className="truncate">
              {task.technician_responsable || "No asignado"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Inspector:</p>
            <p className="truncate">
              {task.inspector_responsable || "No asignado"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TaskCard
