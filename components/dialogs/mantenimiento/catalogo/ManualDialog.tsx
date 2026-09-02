"use client";

import { useEffect, useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { CalendarDateField } from "@/components/misc/CalendarDateField";
import {
  fieldClass,
  labelClass,
  textareaClass,
  selectTriggerClass,
  SectionTitle,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import {
  useCreateCatalogManual,
  useUpdateCatalogManual,
} from "@/actions/mantenimiento/catalogo/manuales/actions";
import { STATUS_LABELS } from "@/lib/maintenanceCatalogLabels";
import { parseCalendarDate, toCalendarPayload } from "@/lib/date";
import { CatalogManual, CatalogStatus } from "@/types/maintenanceCatalog";
import { useCompanyStore } from "@/stores/CompanyStore";

interface ManualDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manual?: CatalogManual;
}

const emptyState = {
  name: "",
  manual_code: "",
  revision: "",
  // Fecha de calendario: se guarda como Date y se envía con toCalendarPayload.
  effective_date: undefined as Date | undefined,
  description: "",
  is_physical: false,
  status: "ACTIVE" as CatalogStatus,
};

export function ManualDialog({ open, onOpenChange, manual }: ManualDialogProps) {
  const { selectedCompany } = useCompanyStore();
  const { createCatalogManual } = useCreateCatalogManual();
  const { updateCatalogManual } = useUpdateCatalogManual();
  const [form, setForm] = useState(emptyState);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(
      manual
        ? {
            name: manual.name,
            manual_code: manual.manual_code ?? "",
            revision: manual.revision ?? "",
            effective_date: parseCalendarDate(manual.effective_date),
            description: manual.description ?? "",
            is_physical: manual.is_physical,
            status: manual.status,
          }
        : emptyState,
    );
    setFile(null);
  }, [open, manual]);

  const isPending = createCatalogManual.isPending || updateCatalogManual.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany?.slug) return;

    const data = { ...form, effective_date: toCalendarPayload(form.effective_date), file };

    // Solo se cierra si guardó: ante un error el toast ya avisa y lo escrito
    // debe seguir en pantalla para corregirlo.
    try {
      if (manual) {
        await updateCatalogManual.mutateAsync({ id: manual.id, data, company: selectedCompany.slug });
      } else {
        await createCatalogManual.mutateAsync({ data, company: selectedCompany.slug });
      }
      onOpenChange(false);
    } catch {
      // El hook de la mutación ya notificó el fallo.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle asChild>
            <SectionTitle
              icon={BookOpen}
              title={manual ? "Editar Manual" : "Nuevo Manual"}
              hint="AMM, MPD, CMM, o la Gaceta de una Directiva de Aeronavegabilidad."
            />
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-1 py-1">
          <div className="space-y-1.5">
            <Label className={labelClass}>Nombre</Label>
            <Input
              required
              className={fieldClass}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ej: MPD Bell 407"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className={labelClass}>Código</Label>
              <Input
                className={fieldClass}
                value={form.manual_code}
                onChange={(e) => setForm((f) => ({ ...f, manual_code: e.target.value }))}
                placeholder="Ej: MPD"
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Revisión</Label>
              <Input
                className={fieldClass}
                value={form.revision}
                onChange={(e) => setForm((f) => ({ ...f, revision: e.target.value }))}
                placeholder="Ej: Rev. 12"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className={labelClass}>Vigente desde</Label>
              <CalendarDateField
                value={form.effective_date}
                onChange={(date) => setForm((f) => ({ ...f, effective_date: date }))}
              />
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
              id="is_physical"
              checked={form.is_physical}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, is_physical: !!checked }))}
            />
            <Label htmlFor="is_physical" className={labelClass}>
              Solo se tiene el documento físico (sin archivo digital)
            </Label>
          </div>

          {/* Un manual nuevo siempre nace vigente; el estado solo se ajusta
              después, cuando una revisión posterior lo deja atrás. */}
          {manual && (
            <div className="space-y-1.5">
              <Label className={labelClass}>Estado</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as CatalogStatus }))}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!form.is_physical && (
            <div className="space-y-1.5">
              <Label className={labelClass}>Archivo (PDF/imagen)</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className={fieldClass}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {manual?.file_url && !file && (
                <p className="text-xs text-muted-foreground">
                  Ya tiene un archivo adjunto; suba uno nuevo solo para reemplazarlo.
                </p>
              )}
            </div>
          )}

          <DialogFooter className="mt-2">
            <ActionTriggerButton type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {manual ? "Guardar Cambios" : "Crear Manual"}
            </ActionTriggerButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
