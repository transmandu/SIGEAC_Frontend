"use client";

import { useMergeDepartment } from "@/actions/ajustes/departamento/actions";
import {
  labelClass,
  selectTriggerClass,
  textareaClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Department } from "@/types";
import { GitMerge, Loader2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { DialogShell } from "./DialogShell";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: Department;
  candidates: Department[];
  onMerged: (targetId: number) => void;
}

export function MergeDepartmentDialog({ open, onOpenChange, source, candidates, onMerged }: Props) {
  const { selectedCompany } = useCompanyStore();
  const { mergeDepartment } = useMergeDepartment();

  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");

  const submit = async () => {
    if (!selectedCompany?.slug || !targetId) return;

    await mergeDepartment.mutateAsync({
      company: selectedCompany.slug,
      id: source.id,
      target_id: Number(targetId),
      reason: reason.trim() || undefined,
    });

    onMerged(Number(targetId));
    onOpenChange(false);
    setTargetId("");
    setReason("");
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      icon={GitMerge}
      title="Fusionar departamento"
      eyebrow={source.full_name}
      description="Todo lo que apunta a este departamento pasa al destino, y este se elimina."
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="text-muted-foreground">
            Pasan al destino el personal, las solicitudes, los documentos, las sedes y los
            dependientes. Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Departamento destino</label>
          <Select value={targetId} onValueChange={setTargetId}>
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Selecciona el departamento que lo absorbe" />
            </SelectTrigger>
            <SelectContent>
              {candidates
                .filter((d) => d.id !== source.id)
                .map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.full_name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="merge-reason">
            Motivo
          </label>
          <Textarea
            id="merge-reason"
            className={textareaClass}
            rows={3}
            placeholder="Opcional"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="min-w-35"
            disabled={!targetId || mergeDepartment.isPending}
            onClick={submit}
          >
            {mergeDepartment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fusionar"}
          </Button>
        </div>
      </div>
    </DialogShell>
  );
}
