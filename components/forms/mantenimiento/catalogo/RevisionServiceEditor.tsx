"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IntervalListEditor } from "@/components/misc/IntervalListEditor";
import { ServiceTasksEditor } from "@/components/forms/mantenimiento/catalogo/ServiceTasksEditor";
import {
  fieldClass,
  labelClass,
  textareaClass,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { CATEGORY_LABELS } from "@/lib/maintenanceCatalogLabels";
import { CatalogCategory } from "@/types/maintenanceCatalog";
import { RevisionServiceFormData } from "@/actions/mantenimiento/catalogo/manuales/actions";
import { useGetAircrafts } from "@/hooks/general/aeronaves/useGetAircrafts";
import { useCompanyStore } from "@/stores/CompanyStore";

interface RevisionServiceEditorProps {
  value: RevisionServiceFormData;
  onChange: (patch: Partial<RevisionServiceFormData>) => void;
}

/**
 * Un servicio arrastrado a la revisión nueva, abierto para corregirlo antes
 * de copiarlo. No lleva estado propio: lo que cambia el manual entre una
 * revisión y otra son estos campos, no la vigencia (la copia nace ACTIVE).
 */
export function RevisionServiceEditor({ value, onChange }: RevisionServiceEditorProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: aircrafts = [] } = useGetAircrafts(selectedCompany?.slug);

  const toggleAircraft = (id: number, checked: boolean) => {
    onChange({
      aircraft_ids: checked
        ? [...value.aircraft_ids, id]
        : value.aircraft_ids.filter((x) => x !== id),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className={labelClass}>Categoría</Label>
          <Select
            value={value.category}
            onValueChange={(v) => onChange({ category: v as CatalogCategory })}
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className={labelClass}>Código (opcional)</Label>
          <Input
            className={fieldClass}
            value={value.code}
            onChange={(e) => onChange({ code: e.target.value })}
            placeholder="Ej: N° de AD/SB"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label className={labelClass}>Nombre</Label>
          <Input
            required
            className={fieldClass}
            value={value.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <IntervalListEditor
            intervals={value.intervals}
            onChange={(intervals) => onChange({ intervals })}
            fieldClass={fieldClass}
            selectTriggerClass={selectTriggerClass}
            labelClass={labelClass}
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label className={labelClass}>Descripción</Label>
          <Textarea
            rows={2}
            className={textareaClass}
            value={value.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className={labelClass}>Aeronaves aplicables</Label>
        <div className="grid max-h-40 grid-cols-2 gap-x-4 gap-y-2 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
          {aircrafts.map((aircraft) => (
            <label key={aircraft.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={value.aircraft_ids.includes(aircraft.id)}
                onCheckedChange={(checked) => toggleAircraft(aircraft.id, !!checked)}
              />
              {aircraft.acronym}
            </label>
          ))}
        </div>
      </div>

      <ServiceTasksEditor tasks={value.tasks} onChange={(tasks) => onChange({ tasks })} />
    </div>
  );
}
