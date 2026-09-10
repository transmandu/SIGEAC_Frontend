import { TaskFormData } from "@/actions/mantenimiento/catalogo/tareas/actions";
import { RevisionServiceFormData } from "@/actions/mantenimiento/catalogo/manuales/actions";
import { CatalogService, CatalogTask } from "@/types/maintenanceCatalog";

/**
 * Pasa una tarea guardada al formato del formulario: los nulos de la API se
 * vuelven cadenas vacías porque un <input> controlado con `null` pasa a no
 * controlado y React avisa por consola.
 */
export function toTaskFormData(task: CatalogTask): TaskFormData {
  return {
    task_number: task.task_number ?? "",
    ata: task.ata ?? "",
    msg3_type: task.msg3_type,
    description: task.description,
    reference: task.reference ?? "",
    estimated_man_hours: task.estimated_man_hours,
    required_skill: task.required_skill ?? "",
    intervals: task.intervals.map((i) => ({
      counting_method: i.counting_method,
      interval_value: i.interval_value,
    })),
    requirements: task.requirements.map((r) => ({
      id: r.id,
      requirement_type: r.requirement_type,
      part_number: r.part_number ?? "",
      description: r.description,
      quantity: r.quantity,
      unit_id: r.unit_id,
      is_mandatory: r.is_mandatory,
      notes: r.notes ?? "",
    })),
  };
}

/**
 * Precarga un servicio existente como candidato a copiarse en una revisión
 * nueva. El `id` de cada requisito se descarta: la copia crea filas propias y
 * mandar el id del original haría que el backend intentara reutilizarlo.
 */
export function toRevisionServiceFormData(service: CatalogService): RevisionServiceFormData {
  return {
    source_service_id: service.id,
    category: service.category,
    name: service.name,
    code: service.code ?? "",
    description: service.description ?? "",
    intervals: service.intervals.map((i) => ({
      counting_method: i.counting_method,
      interval_value: i.interval_value,
    })),
    aircraft_ids: service.aircrafts?.map((a) => a.id) ?? [],
    // Sin los ids de requisito: la copia crea filas propias y reenviar el id
    // del original haría que el backend intentara reutilizarlo.
    tasks: (service.tasks ?? []).map((task) => {
      const form = toTaskFormData(task);
      return { ...form, requirements: form.requirements.map(({ id, ...req }) => req) };
    }),
  };
}
