// src/hooks/mantenimiento/planificacion/useAutoScheduleGenerator.ts
import { WorkOrderTask } from "@/types"
import { addDays, addHours, format } from "date-fns"
import { useEffect } from "react"
import { UseFormSetValue } from "react-hook-form"



interface Scheduling {
  totalHours: number
  hoursPerDay: number
  startDate: Date
}

interface Event {
  title: string
  start: string
  end: string
  description: string
}

export const useAutoScheduleGenerator = (
  scheduling: Scheduling,
  selectedTask: WorkOrderTask,
  setValue: UseFormSetValue<any>
) => {
  useEffect(() => {
    if (!scheduling) return

    const { totalHours, hoursPerDay, startDate } = scheduling
    if (!totalHours || !hoursPerDay || !startDate) return

    let remainingHours = totalHours
    let currentDate = new Date(startDate)
    let dayCount = 1
    const events: Event[] = []

    while (remainingHours > 0) {
      const hoursToday = Math.min(hoursPerDay, remainingHours)
      const endDate = addHours(currentDate, hoursToday)

      events.push({
        title: `Tarea NRO: ${selectedTask?.task_number || "TASK"} - DÍA ${dayCount}`,
        start: format(currentDate, "yyyy-MM-dd HH:mm"),
        end: format(endDate, "yyyy-MM-dd HH:mm"),
        description: selectedTask?.description_task || ""
      })

      remainingHours -= hoursToday
      dayCount++
      currentDate = addDays(currentDate, 1)
    }

    setValue("scheduling.events", events)
  }, [
    scheduling?.startDate,
    scheduling?.totalHours,
    scheduling?.hoursPerDay,
    selectedTask,
    setValue
  ])
}
