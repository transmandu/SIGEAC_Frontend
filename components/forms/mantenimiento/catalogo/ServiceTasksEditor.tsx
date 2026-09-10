"use client";

import { useState } from "react";
import { ChevronDown, ClipboardList, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TaskFieldsEditor, emptyTask } from "@/components/forms/mantenimiento/catalogo/TaskFieldsEditor";
import { labelClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { MSG3_TYPE_LABELS } from "@/lib/maintenanceCatalogLabels";
import { TaskFormData } from "@/actions/mantenimiento/catalogo/tareas/actions";

interface ServiceTasksEditorProps {
  tasks: TaskFormData[];
  onChange: (tasks: TaskFormData[]) => void;
}

/**
 * Lista de tareas editables dentro del formulario de un servicio. Cada tarea
 * se pliega a una línea de resumen y solo la que se está editando queda
 * abierta: son siete campos más intervalos y N requisitos cada una, y con dos
 * o tres desplegadas a la vez el diálogo deja de ser legible.
 */
export function ServiceTasksEditor({ tasks, onChange }: ServiceTasksEditorProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const addTask = () => {
    onChange([...tasks, { ...emptyTask }]);
    setOpenIndex(tasks.length);
  };

  const removeTask = (index: number) => {
    onChange(tasks.filter((_, i) => i !== index));
    setOpenIndex((current) => {
      if (current === index) return null;
      // Los índices por encima del borrado se corren una posición.
      return current !== null && current > index ? current - 1 : current;
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <Label className={labelClass}>Tareas</Label>
          <p className="text-xs text-muted-foreground">
            Las tareas que se ejecutan cuando este servicio genera una orden de trabajo.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={addTask}>
          <Plus className="size-3.5" />
          Agregar tarea
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-400/40 py-8 text-center dark:border-slate-600/40">
          <ClipboardList className="size-5 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">Sin tareas todavía.</p>
          <p className="text-xs text-muted-foreground/70">
            Un certificado puede no tener ninguna; un servicio de inspección normalmente sí.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((task, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="rounded-xl border border-slate-400/40 bg-background/40 dark:border-slate-600/40"
              >
                <div className="flex items-center gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <ChevronDown
                      className={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {task.description || <span className="text-muted-foreground">Tarea sin descripción</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {MSG3_TYPE_LABELS[task.msg3_type]}
                        {task.ata ? ` · ATA ${task.ata}` : ""}
                        {task.estimated_man_hours != null ? ` · ${task.estimated_man_hours} H-H` : ""}
                        {task.requirements.length > 0 ? ` · ${task.requirements.length} requisito(s)` : ""}
                      </p>
                    </div>
                  </button>

                  <TooltipProvider delayDuration={120}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeTask(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Quitar tarea</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-400/30 p-3 dark:border-slate-600/30">
                    <TaskFieldsEditor
                      value={task}
                      onChange={(next) => onChange(tasks.map((t, i) => (i === index ? next : t)))}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
