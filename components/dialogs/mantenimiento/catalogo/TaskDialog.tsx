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
  is_mandatory: true,
  notes: "",
};

const emptyState: TaskFormData = {
  task_number: "",
  ata: "",
  msg3_type: "GENERAL_VISUAL_INSPECTION",
  description: "",
  reference: "",
  requirements: [],
};

export function TaskDialog({ open, onOpenChange, serviceId, task }: TaskDialogProps) {
  const { selectedCompany } = useCompanyStore();
  const { createCatalogTask } = useCreateCatalogTask();
  const { updateCatalogTask } = useUpdateCatalogTask();
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
            requirements: task.requirements.map((r) => ({
              id: r.id,
              requirement_type: r.requirement_type,
              part_number: r.part_number ?? "",
              description: r.description,
              quantity: r.quantity,
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl sm:max-w-2xl">
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
                <Label className={labelClass}>ATA</Label>
                <Input
                  className={fieldClass}
                  value={form.ata}
                  onChange={(e) => setForm((f) => ({ ...f, ata: e.target.value }))}
                  placeholder="Ej: 25-10-00"
                />
              </div>

              <div className="space-y-1.5">
                <Label className={labelClass}>N° de tarea (opcional)</Label>
                <Input
                  className={fieldClass}
                  value={form.task_number}
                  onChange={(e) => setForm((f) => ({ ...f, task_number: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className={labelClass}>Referencia (sección/página del manual)</Label>
                <Input
                  className={fieldClass}
                  value={form.reference}
                  onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
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
              <p className="text-sm text-muted-foreground">Sin requisitos agregados.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {form.requirements.map((req, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 gap-2 rounded-lg border border-slate-400/40 p-3 dark:border-slate-600/40 sm:grid-cols-[1fr_1fr_1fr_auto_auto]"
                  >
                    <Select
                      value={req.requirement_type}
                      onValueChange={(v) => updateRequirement(index, { requirement_type: v as CatalogRequirementType })}
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

                    <Input
                      required
                      className={fieldClass}
                      placeholder="Descripción"
                      value={req.description}
                      onChange={(e) => updateRequirement(index, { description: e.target.value })}
                    />

                    <Input
                      className={fieldClass}
                      placeholder="N° de parte (ref.)"
                      value={req.part_number}
                      onChange={(e) => updateRequirement(index, { part_number: e.target.value })}
                    />

                    <Input
                      type="number"
                      min={0}
                      className={fieldClass}
                      placeholder="Cant."
                      value={req.quantity ?? ""}
                      onChange={(e) =>
                        updateRequirement(index, { quantity: e.target.value ? Number(e.target.value) : null })
                      }
                    />

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
                        <Checkbox
                          checked={req.is_mandatory}
                          onCheckedChange={(checked) => updateRequirement(index, { is_mandatory: !!checked })}
                        />
                        Obligatorio
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeRequirement(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
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
