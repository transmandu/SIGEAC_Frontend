"use client";

import { useMemo, useState } from "react";
import { GitMerge, Loader2, TriangleAlert } from "lucide-react";

import { useMergeDepartment } from "@/actions/ajustes/departamento/actions";
import { textareaClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { OptionCombobox } from "@/components/forms/general/OptionCombobox";
import { PanelSection, PanelStaticLabel } from "@/components/forms/PanelSection";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Department } from "@/types";
import { DialogShell } from "./DialogShell";

const REASON_MAX = 500;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: Department;
  candidates: Department[];
  onMerged: (targetId: number) => void;
}

export function MergeDepartmentDialog({
  open,
  onOpenChange,
  source,
  candidates,
  onMerged,
}: Props) {
  const { selectedCompany } = useCompanyStore();
  const { mergeDepartment } = useMergeDepartment();

  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");

  const options = useMemo(
    () =>
      candidates
        .filter((candidate) => candidate.id !== source.id)
        .map((candidate) => ({
          id: String(candidate.id),
          label: candidate.full_name,
        })),
    [candidates, source.id],
  );
  const target = candidates.find((candidate) => String(candidate.id) === targetId);

  const close = (next: boolean) => {
    if (!next) {
      setTargetId("");
      setReason("");
    }
    onOpenChange(next);
  };

  const submit = async () => {
    if (!selectedCompany?.slug || !targetId) return;

    try {
      await mergeDepartment.mutateAsync({
        company: selectedCompany.slug,
        id: source.id,
        target_id: Number(targetId),
        reason: reason.trim() || undefined,
      });
    } catch {
      return;
    }

    onMerged(Number(targetId));
    close(false);
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={close}
      icon={GitMerge}
      title="Fusionar departamento"
      eyebrow={source.full_name}
      description="Todo lo que apunta a este departamento pasa al destino, y este se elimina."
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={mergeDepartment.isPending}
            onClick={() => close(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="min-w-35"
            disabled={!targetId || mergeDepartment.isPending}
            onClick={submit}
          >
            {mergeDepartment.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Fusionar"
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-foreground/80">
            Pasan al destino el personal, las solicitudes, los documentos, las
            sedes y los dependientes. Esta acción no se puede deshacer.
          </p>
        </div>

        <PanelSection
          icon={GitMerge}
          title="Destino"
          hint="El departamento que absorbe al actual."
        >
          <div className="space-y-4">
            <div>
              <PanelStaticLabel>Departamento destino</PanelStaticLabel>
              <OptionCombobox
                value={targetId}
                onChange={setTargetId}
                options={options}
                placeholder="Seleccione el departamento que lo absorbe"
                searchPlaceholder="Buscar departamento..."
              />
              {target && (
                <p className="mt-1.5 text-[13px] text-muted-foreground">
                  «{source.full_name}» desaparece y su información queda en «
                  {target.full_name}».
                </p>
              )}
            </div>

            <div>
              <PanelStaticLabel>Motivo (opcional)</PanelStaticLabel>
              <Textarea
                id="merge-reason"
                className={textareaClass}
                rows={3}
                maxLength={REASON_MAX}
                placeholder="Por qué se fusionan"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </div>
          </div>
        </PanelSection>
      </div>
    </DialogShell>
  );
}
