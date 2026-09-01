"use client";

import { useEffect, useState } from "react";
import { Loader2, Wrench } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useGetCatalogManuals } from "@/hooks/mantenimiento/catalogo/useGetCatalogManuals";
import { useGetAircrafts } from "@/hooks/general/aeronaves/useGetAircrafts";
import { CATEGORY_LABELS, COUNTING_METHOD_LABELS } from "@/lib/maintenanceCatalogLabels";
import { CatalogCategory, CatalogCountingMethod, CatalogService } from "@/types/maintenanceCatalog";
import { ServiceFormData } from "@/actions/mantenimiento/catalogo/servicios/actions";
import { useCompanyStore } from "@/stores/CompanyStore";

interface ServiceFormProps {
  service?: CatalogService;
  isPending: boolean;
  onSubmit: (data: ServiceFormData) => void | Promise<void>;
  submitLabel: string;
  /** Dentro de un diálogo las tarjetas de sección anidan cristal sobre cristal. */
  flat?: boolean;
}

const emptyState: ServiceFormData = {
  maintenance_catalog_manual_id: null,
  category: "SERVICE",
  name: "",
  code: "",
  description: "",
  counting_method: null,
  interval_value: null,
  aircraft_ids: [],
};

export function ServiceForm({ service, isPending, onSubmit, submitLabel, flat }: ServiceFormProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: manuals = [] } = useGetCatalogManuals(selectedCompany?.slug);
  const { data: aircrafts = [] } = useGetAircrafts(selectedCompany?.slug);
  const [form, setForm] = useState<ServiceFormData>(emptyState);

  useEffect(() => {
    if (!service) return;
    setForm({
      maintenance_catalog_manual_id: service.maintenance_catalog_manual_id,
      category: service.category,
      name: service.name,
      code: service.code ?? "",
      description: service.description ?? "",
      counting_method: service.counting_method,
      interval_value: service.interval_value,
      aircraft_ids: service.aircrafts?.map((a) => a.id) ?? [],
    });
  }, [service]);

  const toggleAircraft = (id: number, checked: boolean) => {
    setForm((f) => ({
      ...f,
      aircraft_ids: checked ? [...f.aircraft_ids, id] : f.aircraft_ids.filter((x) => x !== id),
    }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="flex flex-col gap-5"
    >
      <section className={flat ? undefined : sectionClass}>
        {!flat && <SectionTitle icon={Wrench} title="Datos del Servicio/Certificado" />}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className={labelClass}>Categoría</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v as CatalogCategory }))}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Manual de referencia</Label>
            <Select
              value={form.maintenance_catalog_manual_id ? String(form.maintenance_catalog_manual_id) : "none"}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, maintenance_catalog_manual_id: v === "none" ? null : Number(v) }))
              }
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Sin manual" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin manual</SelectItem>
                {manuals.map((manual) => (
                  <SelectItem key={manual.id} value={String(manual.id)}>
                    {manual.name}
                    {manual.revision ? ` (${manual.revision})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Nombre</Label>
            <Input
              required
              className={fieldClass}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Inspección 100 Horas"
            />
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Código (opcional)</Label>
            <Input
              className={fieldClass}
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="Ej: N° de AD/SB"
            />
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Método de conteo</Label>
            <Select
              value={form.counting_method ?? "none"}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, counting_method: v === "none" ? null : (v as CatalogCountingMethod) }))
              }
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Sin intervalo (certificado estático)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin intervalo</SelectItem>
                {Object.entries(COUNTING_METHOD_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Intervalo</Label>
            <Input
              type="number"
              min={0}
              disabled={!form.counting_method}
              className={fieldClass}
              value={form.interval_value ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, interval_value: e.target.value ? Number(e.target.value) : null }))}
              placeholder="Ej: 100"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className={labelClass}>Descripción</Label>
            <Textarea
              rows={2}
              className={textareaClass}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>
      </section>

      <section className={flat ? undefined : sectionClass}>
        {flat ? (
          <div className="mb-2 space-y-1">
            <Label className={labelClass}>Aeronaves aplicables</Label>
            <p className="text-[13px] text-muted-foreground">
              Solo las aeronaves marcadas verán este servicio/certificado en su Control de Mantenimiento.
            </p>
          </div>
        ) : (
          <SectionTitle
            icon={Wrench}
            title="Aeronaves aplicables"
            hint="Solo las aeronaves marcadas verán este servicio/certificado en su Control de Mantenimiento."
          />
        )}
        <div className="grid max-h-64 grid-cols-2 gap-x-4 gap-y-2 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
          {aircrafts.map((aircraft) => (
            <label key={aircraft.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.aircraft_ids.includes(aircraft.id)}
                onCheckedChange={(checked) => toggleAircraft(aircraft.id, !!checked)}
              />
              {aircraft.acronym}
            </label>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <ActionTriggerButton type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {submitLabel}
        </ActionTriggerButton>
      </div>
    </form>
  );
}
