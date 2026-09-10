"use client";

import { ClipboardList, Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { IntervalListEditor } from "@/components/misc/IntervalListEditor";
import {
  fieldClass,
  labelClass,
  textareaClass,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { MSG3_TYPE_LABELS, REQUIREMENT_TYPE_LABELS } from "@/lib/maintenanceCatalogLabels";
import { CatalogRequirementType, Msg3TaskType } from "@/types/maintenanceCatalog";
import { TaskFormData, TaskRequirementFormData } from "@/actions/mantenimiento/catalogo/tareas/actions";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { useCompanyStore } from "@/stores/CompanyStore";

export const emptyRequirement: TaskRequirementFormData = {
  requirement_type: "PART",
  part_number: "",
  description: "",
  quantity: null,
  unit_id: null,
  is_mandatory: true,
  notes: "",
};

export const emptyTask: TaskFormData = {
  task_number: "",
  ata: "",
  msg3_type: "GENERAL_VISUAL_INSPECTION",
  description: "",
  reference: "",
  estimated_man_hours: null,
  required_skill: "",
  intervals: [],
  requirements: [],
};

interface TaskFieldsEditorProps {
  value: TaskFormData;
  onChange: (task: TaskFormData) => void;
}

/**
 * Los campos de una tarea del catálogo (sin su propio <form> ni botón de
 * guardado): el mismo bloque lo usan el diálogo de tarea suelta, el alta
 * encadenada de un servicio y el arrastre de contenido a una nueva revisión,
 * que guardan de maneras distintas.
 */
export function TaskFieldsEditor({ value, onChange }: TaskFieldsEditorProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: units = [] } = useGetUnits(selectedCompany?.slug);

  const patch = (changes: Partial<TaskFormData>) => onChange({ ...value, ...changes });

  const updateRequirement = (index: number, changes: Partial<TaskRequirementFormData>) => {
    patch({ requirements: value.requirements.map((r, i) => (i === index ? { ...r, ...changes } : r)) });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Los rótulos largos ocupan dos líneas: cada celda estira el rótulo y
          ancla el campo abajo para que la fila quede pareja. */}
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 [&>div]:flex [&>div]:flex-col [&>div]:gap-1.5 [&>div>label]:flex-1">
        <div>
          <Label className={labelClass}>Tipo MSG-3</Label>
          <Select value={value.msg3_type} onValueChange={(v) => patch({ msg3_type: v as Msg3TaskType })}>
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MSG3_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
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
            value={value.ata}
            onChange={(e) => patch({ ata: e.target.value })}
            placeholder="Ej: 25-10-00"
          />
        </div>

        <div>
          <Label className={labelClass}>N° de tarea (opcional)</Label>
          <Input
            className={fieldClass}
            value={value.task_number}
            onChange={(e) => patch({ task_number: e.target.value })}
          />
        </div>

        <div>
          <Label className={labelClass}>Referencia (sección/página del manual)</Label>
          <Input
            className={fieldClass}
            value={value.reference}
            onChange={(e) => patch({ reference: e.target.value })}
          />
        </div>

        <div>
          <Label className={labelClass}>Horas-hombre estimadas</Label>
          <Input
            type="number"
            min={0}
            step={0.5}
            className={fieldClass}
            value={value.estimated_man_hours ?? ""}
            onChange={(e) => patch({ estimated_man_hours: e.target.value ? Number(e.target.value) : null })}
            placeholder="Ej: 2.5"
          />
        </div>

        <div>
          <Label className={labelClass}>Especialidad requerida</Label>
          <Input
            className={fieldClass}
            value={value.required_skill}
            onChange={(e) => patch({ required_skill: e.target.value })}
            placeholder="Ej: Mecánico A&P, Aviónico, Inspector NDT"
          />
        </div>

        <div className="md:col-span-2">
          <Label className={labelClass}>Descripción</Label>
          <Textarea
            required
            rows={3}
            className={textareaClass}
            value={value.description}
            onChange={(e) => patch({ description: e.target.value })}
          />
        </div>
      </div>

      <div>
        <IntervalListEditor
          intervals={value.intervals}
          onChange={(intervals) => patch({ intervals })}
          fieldClass={fieldClass}
          selectTriggerClass={selectTriggerClass}
          labelClass={labelClass}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Vacío = la tarea hereda la periodicidad del servicio que la agrupa.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <Label className={labelClass}>Requisitos</Label>
            <p className="text-xs text-muted-foreground">
              Partes, herramientas, consumibles o mínimo general que exige el manual para esta tarea.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => patch({ requirements: [...value.requirements, { ...emptyRequirement }] })}
          >
            <Plus className="size-3.5" />
            Agregar
          </Button>
        </div>

        {value.requirements.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-400/40 py-8 text-center dark:border-slate-600/40">
            <ClipboardList className="size-5 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">Sin requisitos agregados.</p>
            <p className="text-xs text-muted-foreground/70">
              Use &quot;Agregar&quot; para registrar partes, herramientas o consumibles.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {value.requirements.map((req, index) => (
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
                          onClick={() =>
                            patch({ requirements: value.requirements.filter((_, i) => i !== index) })
                          }
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
                        {Object.entries(REQUIREMENT_TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
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
                      onValueChange={(v) => updateRequirement(index, { unit_id: v === "none" ? null : Number(v) })}
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
      </div>
    </div>
  );
}
