import { WorkOrderTask } from "@/types"
import { addDays, addHours, format, startOfDay } from "date-fns"
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
  // Los tres campos como valores propios: es lo que lee el efecto, y su lista de
  // dependencias dice exactamente eso (dependiendo de `scheduling` entero se
  // regeneraría la agenda cada vez que el formulario entrega un objeto nuevo).
  const totalHours = scheduling?.totalHours
  const hoursPerDay = scheduling?.hoursPerDay
  const startDate = scheduling?.startDate

  useEffect(() => {
    if (!totalHours || !hoursPerDay || !startDate) return

    let remainingHours = totalHours
    let currentDate = format(new Date(startDate), "yyyy-MM-dd 7:00")
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
      currentDate = format(addDays(currentDate, 1), "yyyy-MM-dd 7:00")
    }

    setValue("scheduling.events", events)
  }, [startDate, totalHours, hoursPerDay, selectedTask, setValue])
}
