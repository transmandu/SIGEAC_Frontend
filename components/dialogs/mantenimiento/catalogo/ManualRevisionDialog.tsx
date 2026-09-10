"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, History, Loader2, Wrench } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { CalendarDateField } from "@/components/misc/CalendarDateField";
import {
  fieldClass,
  labelClass,
  textareaClass,
  SectionTitle,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { RevisionServiceEditor } from "@/components/forms/mantenimiento/catalogo/RevisionServiceEditor";
import {
  useCreateManualRevision,
  ManualRevisionFormData,
  RevisionServiceFormData,
} from "@/actions/mantenimiento/catalogo/manuales/actions";
import { toRevisionServiceFormData } from "@/lib/maintenanceCatalogForm";
import { toCalendarPayload } from "@/lib/date";
import { CATEGORY_LABELS } from "@/lib/maintenanceCatalogLabels";
import { CatalogManual } from "@/types/maintenanceCatalog";
import { useCompanyStore } from "@/stores/CompanyStore";

interface ManualRevisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manual: CatalogManual;
}

const emptyState: Omit<ManualRevisionFormData, "services"> = {
  revision: "",
  description: "",
  is_physical: false,
};

export function ManualRevisionDialog({ open, onOpenChange, manual }: ManualRevisionDialogProps) {
  const { selectedCompany } = useCompanyStore();
  const { createManualRevision } = useCreateManualRevision();
  const [form, setForm] = useState(emptyState);
  // Fecha de calendario: se lleva como Date y se serializa al enviar.
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>();
  const [file, setFile] = useState<File | null>(null);

  // El contenido arrastrado se lleva aparte de la selección: destildar un
  // servicio no debe perder las correcciones que ya se le hicieron.
  const [services, setServices] = useState<RevisionServiceFormData[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState<number | null>(null);

  // Un servicio ya superado en la revisión vigente no se arrastra: se retiró a
  // propósito y reponerlo en la revisión nueva lo revive sin quererlo.
  const sourceServices = useMemo(
    () => (manual.services ?? []).filter((service) => service.status === "ACTIVE"),
    [manual.services],
  );

  useEffect(() => {
    if (!open) return;
    setForm({ ...emptyState, description: manual.description ?? "" });
    setEffectiveDate(undefined);
    setFile(null);
    setServices(sourceServices.map(toRevisionServiceFormData));
    setSelected(Object.fromEntries(sourceServices.map((service) => [service.id, true])));
    setExpanded(null);
  }, [open, manual, sourceServices]);

  const selectedCount = services.filter((s) => selected[s.source_service_id!]).length;

  const updateService = (index: number, patch: Partial<RevisionServiceFormData>) => {
    setServices((current) => current.map((service, i) => (i === index ? { ...service, ...patch } : service)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany?.slug) return;

    // Solo se cierra si guardó: ante un error el toast ya avisa y lo escrito
    // debe seguir en pantalla para corregirlo.
    try {
      await createManualRevision.mutateAsync({
        id: manual.id,
        data: {
          ...form,
          effective_date: toCalendarPayload(effectiveDate),
          file,
          services: services.filter((s) => selected[s.source_service_id!]),
        },
        company: selectedCompany.slug,
      });
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
            <SectionTitle icon={History} title="Registrar Nueva Revisión" />
          </DialogTitle>
          <DialogDescription>
            Crea un nuevo manual ({manual.name}) con la revisión indicada y marca &quot;
            {manual.revision || "esta"}&quot; como superada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto px-1 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className={labelClass}>Nueva revisión</Label>
              <Input
                className={fieldClass}
                value={form.revision}
                onChange={(e) => setForm((f) => ({ ...f, revision: e.target.value }))}
                placeholder="Ej: Rev. 13"
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Vigente desde</Label>
              <CalendarDateField value={effectiveDate} onChange={setEffectiveDate} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Descripción</Label>
            <Textarea
              rows={2}
              className={textareaClass}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="revision_is_physical"
              checked={form.is_physical}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, is_physical: !!checked }))}
            />
            <Label htmlFor="revision_is_physical" className={labelClass}>
              Solo se tiene el documento físico (sin archivo digital)
            </Label>
          </div>

          {!form.is_physical && (
            <div className="space-y-1.5">
              <Label className={labelClass}>Archivo (PDF/imagen)</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className={fieldClass}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          {services.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Label className={labelClass}>Contenido que pasa a la revisión nueva</Label>
                  <p className="text-xs text-muted-foreground">
                    Ajuste aquí lo que cambió en esta revisión. Lo que destilde no pasa: queda superado y
                    deja de ofrecerse para nuevos controles y órdenes de trabajo.
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {selectedCount} de {services.length}
                </Badge>
              </div>

              {selectedCount < services.length && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500" />
                  <p>
                    {services.length - selectedCount} servicio(s) no pasan a {form.revision || "la revisión nueva"}
                    : quedarán superados y no podrán usarse en nuevos controles ni órdenes de trabajo. Los que ya
                    se ejecutaron conservan su historial.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {services.map((service, index) => {
                  const sourceId = service.source_service_id!;
                  const isSelected = !!selected[sourceId];
                  const isExpanded = expanded === sourceId;

                  return (
                    <div
                      key={sourceId}
                      className="rounded-xl border border-slate-400/40 bg-gradient-to-br from-background/70 to-background/40 backdrop-blur-md dark:border-slate-600/40"
                    >
                      <div className="flex items-center gap-2 p-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            setSelected((current) => ({ ...current, [sourceId]: !!checked }))
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{service.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {CATEGORY_LABELS[service.category]}
                            {` · ${service.tasks.length} tarea(s)`}
                            {service.aircraft_ids.length > 0
                              ? ` · ${service.aircraft_ids.length} aeronave(s)`
                              : ""}
                          </p>
                        </div>

                        {isSelected && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="shrink-0 gap-1 text-xs"
                            onClick={() => setExpanded(isExpanded ? null : sourceId)}
                          >
                            {isExpanded ? "Cerrar" : "Revisar"}
                            <ChevronDown
                              className={`size-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </Button>
                        )}
                      </div>

                      {isSelected && isExpanded && (
                        <div className="border-t border-slate-400/30 p-3 dark:border-slate-600/30">
                          <RevisionServiceEditor
                            value={service}
                            onChange={(patch) => updateService(index, patch)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {services.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-400/40 py-8 text-center dark:border-slate-600/40">
              <Wrench className="size-5 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">
                Este manual no tiene servicios vigentes que arrastrar.
              </p>
            </div>
          )}

          <DialogFooter className="mt-2">
            <ActionTriggerButton type="submit" disabled={createManualRevision.isPending}>
              {createManualRevision.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Registrar Revisión
            </ActionTriggerButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
