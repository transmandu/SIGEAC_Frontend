"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Loader2, Plus, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import {
  fieldClass,
  labelClass,
  textareaClass,
  selectTriggerClass,
  sectionClass,
  SectionTitle,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { MSG3_TYPE_LABELS, REQUIREMENT_TYPE_LABELS } from "@/lib/maintenanceCatalogLabels";
import { CatalogRequirementType, CatalogTask, Msg3TaskType } from "@/types/maintenanceCatalog";
import {
  TaskFormData,
  TaskRequirementFormData,
  useCreateCatalogTask,
  useUpdateCatalogTask,
} from "@/actions/mantenimiento/catalogo/tareas/actions";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { useCompanyStore } from "@/stores/CompanyStore";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: number;
  task?: CatalogTask;
}

const emptyRequirement: TaskRequirementFormData = {
  requirement_type: "PART",
  part_number: "",
  description: "",
  quantity: null,
  unit_id: null,
  is_mandatory: true,
  notes: "",
};

const emptyState: TaskFormData = {
  task_number: "",
  ata: "",
  msg3_type: "GENERAL_VISUAL_INSPECTION",
  description: "",
  reference: "",
  estimated_man_hours: null,
  required_skill: "",
  requirements: [],
};

export function TaskDialog({ open, onOpenChange, serviceId, task }: TaskDialogProps) {
  const { selectedCompany } = useCompanyStore();
  const { createCatalogTask } = useCreateCatalogTask();
  const { updateCatalogTask } = useUpdateCatalogTask();
  const { data: units = [] } = useGetUnits(selectedCompany?.slug);
  const [form, setForm] = useState<TaskFormData>(emptyState);

  useEffect(() => {
    if (!open) return;
    setForm(
      task
        ? {
            task_number: task.task_number ?? "",
            ata: task.ata ?? "",
            msg3_type: task.msg3_type,
            description: task.description,
            reference: task.reference ?? "",
            estimated_man_hours: task.estimated_man_hours,
            required_skill: task.required_skill ?? "",
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
          }
        : emptyState,
    );
  }, [open, task]);

  const isPending = createCatalogTask.isPending || updateCatalogTask.isPending;

  const updateRequirement = (index: number, patch: Partial<TaskRequirementFormData>) => {
    setForm((f) => ({
      ...f,
      requirements: f.requirements.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    }));
  };

  const removeRequirement = (index: number) => {
    setForm((f) => ({ ...f, requirements: f.requirements.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany?.slug) return;

    // Solo se cierra si guardó: ante un error el toast ya avisa y los
    // requisitos cargados deben seguir en pantalla para corregirlos.
    try {
      if (task) {
        await updateCatalogTask.mutateAsync({
          serviceId,
          taskId: task.id,
          data: form,
          company: selectedCompany.slug,
        });
      } else {
        await createCatalogTask.mutateAsync({ serviceId, data: form, company: selectedCompany.slug });
      }
      onOpenChange(false);
    } catch {
      // El hook de la mutación ya notificó el fallo.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle asChild>
            <SectionTitle
              icon={ClipboardList}
              title={task ? "Editar Tarea" : "Nueva Tarea"}
              hint="Tipificada con la taxonomía MSG-3 del programa de mantenimiento."
            />
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto px-1 py-1">
          <section className={sectionClass}>
            {/* Los rótulos largos ocupan dos líneas: cada celda estira el
                rótulo y ancla el campo abajo para que la fila quede pareja. */}
            <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 [&>div]:flex [&>div]:flex-col [&>div]:gap-1.5 [&>div>label]:flex-1">
              <div>
                <Label className={labelClass}>Tipo MSG-3</Label>
                <Select
                  value={form.msg3_type}
                  onValueChange={(v) => setForm((f) => ({ ...f, msg3_type: v as Msg3TaskType }))}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MSG3_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={labelClass}>ATA</Label>
                <Input
                  className={fieldClass}
                  value={form.ata}
                  onChange={(e) => setForm((f) => ({ ...f, ata: e.target.value }))}
                  placeholder="Ej: 25-10-00"
                />
              </div>

              <div>
                <Label className={labelClass}>N° de tarea (opcional)</Label>
                <Input
                  className={fieldClass}
                  value={form.task_number}
                  onChange={(e) => setForm((f) => ({ ...f, task_number: e.target.value }))}
                />
              </div>

              <div>
                <Label className={labelClass}>Referencia (sección/página del manual)</Label>
                <Input
                  className={fieldClass}
                  value={form.reference}
                  onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                />
              </div>

              <div>
                <Label className={labelClass}>Horas-hombre estimadas</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  className={fieldClass}
                  value={form.estimated_man_hours ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      estimated_man_hours: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  placeholder="Ej: 2.5"
                />
              </div>

              <div>
                <Label className={labelClass}>Especialidad requerida</Label>
                <Input
                  className={fieldClass}
                  value={form.required_skill}
                  onChange={(e) => setForm((f) => ({ ...f, required_skill: e.target.value }))}
                  placeholder="Ej: Mecánico A&P, Aviónico, Inspector NDT"
                />
              </div>

              <div className="md:col-span-2">
                <Label className={labelClass}>Descripción</Label>
                <Textarea
                  required
                  rows={3}
                  className={textareaClass}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <SectionTitle
              icon={ClipboardList}
              title="Requisitos"
              hint="Partes, herramientas, consumibles o mínimo general que exige el manual para esta tarea."
              action={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setForm((f) => ({ ...f, requirements: [...f.requirements, { ...emptyRequirement }] }))
                  }
                >
                  <Plus className="mr-1 size-4" />
                  Agregar
                </Button>
              }
            />

            {form.requirements.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-400/40 py-8 text-center dark:border-slate-600/40">
                <ClipboardList className="size-5 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">Sin requisitos agregados.</p>
                <p className="text-xs text-muted-foreground/70">
                  Use &quot;Agregar&quot; para registrar partes, herramientas o consumibles.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {form.requirements.map((req, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-400/40 bg-background/40 p-4 dark:border-slate-600/40"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Requisito {index + 1}
                      </span>
                      <TooltipProvider delayDuration={120}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeRequirement(index)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Quitar requisito</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-6 [&>div]:flex [&>div]:flex-col [&>div]:gap-1.5 [&>div>label]:flex-1">
                      <div className="sm:col-span-2">
                        <Label className={labelClass}>Tipo</Label>
                        <Select
                          value={req.requirement_type}
                          onValueChange={(v) =>
                            updateRequirement(index, { requirement_type: v as CatalogRequirementType })
                          }
                        >
                          <SelectTrigger className={selectTriggerClass}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(REQUIREMENT_TYPE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="sm:col-span-4">
                        <Label className={labelClass}>Descripción</Label>
                        <Input
                          required
                          className={fieldClass}
                          placeholder="Ej: Filtro de aceite"
                          value={req.description}
                          onChange={(e) => updateRequirement(index, { description: e.target.value })}
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <Label className={labelClass}>N° de parte (referencial)</Label>
                        <Input
                          className={fieldClass}
                          placeholder="Ej: P/N 1234-56"
                          value={req.part_number}
                          onChange={(e) => updateRequirement(index, { part_number: e.target.value })}
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <Label className={labelClass}>Cantidad</Label>
                        <Input
                          type="number"
                          min={0}
                          className={fieldClass}
                          placeholder="Ej: 2"
                          value={req.quantity ?? ""}
                          onChange={(e) =>
                            updateRequirement(index, { quantity: e.target.value ? Number(e.target.value) : null })
                          }
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label className={labelClass}>Unidad</Label>
                        <Select
                          value={req.unit_id ? String(req.unit_id) : "none"}
                          onValueChange={(v) =>
                            updateRequirement(index, { unit_id: v === "none" ? null : Number(v) })
                          }
                        >
                          <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder="Sin unidad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sin unidad</SelectItem>
                            {units.map((unit) => (
                              <SelectItem key={unit.id} value={String(unit.id)}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="sm:col-span-6">
                        <Label className={labelClass}>Notas (opcional)</Label>
                        <Input
                          className={fieldClass}
                          placeholder="Ej: Sustituir solo con sello nuevo"
                          value={req.notes}
                          onChange={(e) => updateRequirement(index, { notes: e.target.value })}
                        />
                      </div>
                    </div>

                    <label className="mt-4 flex w-fit items-center gap-2 text-sm text-muted-foreground">
                      <Checkbox
                        checked={req.is_mandatory}
                        onCheckedChange={(checked) => updateRequirement(index, { is_mandatory: !!checked })}
                      />
                      Obligatorio para cerrar la tarea
                    </label>
                  </div>
                ))}
              </div>
            )}
          </section>

          <DialogFooter>
            <ActionTriggerButton type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {task ? "Guardar Cambios" : "Crear Tarea"}
            </ActionTriggerButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
