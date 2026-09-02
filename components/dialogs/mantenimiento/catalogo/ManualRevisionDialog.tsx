"use client";

import { useEffect, useState } from "react";
import { History, Loader2 } from "lucide-react";

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
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { CalendarDateField } from "@/components/misc/CalendarDateField";
import {
  fieldClass,
  labelClass,
  textareaClass,
  SectionTitle,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import {
  useCreateManualRevision,
  ManualRevisionFormData,
} from "@/actions/mantenimiento/catalogo/manuales/actions";
import { toCalendarPayload } from "@/lib/date";
import { CatalogManual } from "@/types/maintenanceCatalog";
import { useCompanyStore } from "@/stores/CompanyStore";

interface ManualRevisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manual: CatalogManual;
}

const emptyState: ManualRevisionFormData = {
  revision: "",
  description: "",
  is_physical: false,
};

export function ManualRevisionDialog({ open, onOpenChange, manual }: ManualRevisionDialogProps) {
  const { selectedCompany } = useCompanyStore();
  const { createManualRevision } = useCreateManualRevision();
  const [form, setForm] = useState<ManualRevisionFormData>(emptyState);
  // Fecha de calendario: se lleva como Date y se serializa al enviar.
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({ ...emptyState, description: manual.description ?? "" });
    setEffectiveDate(undefined);
    setFile(null);
  }, [open, manual]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany?.slug) return;

    // Solo se cierra si guardó: ante un error el toast ya avisa y lo escrito
    // debe seguir en pantalla para corregirlo.
    try {
      await createManualRevision.mutateAsync({
        id: manual.id,
        data: { ...form, effective_date: toCalendarPayload(effectiveDate), file },
        company: selectedCompany.slug,
      });
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
            <SectionTitle icon={History} title="Registrar Nueva Revisión" />
          </DialogTitle>
          <DialogDescription>
            Crea un nuevo manual ({manual.name}) con la revisión indicada y marca &quot;{manual.revision || "esta"}
            &quot; como superada. Los servicios que hoy declaran este manual no se mueven automáticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-1 py-1">
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
