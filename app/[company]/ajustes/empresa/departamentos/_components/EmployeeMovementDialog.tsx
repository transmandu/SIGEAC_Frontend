"use client";

import {
  DepartmentMovementAction,
  useRegisterDepartmentMovement,
} from "@/actions/ajustes/empleados/movements";
import {
  fieldClass,
  hintClass,
  labelClass,
  selectTriggerClass,
  textareaClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useGetJobTitles } from "@/hooks/ajustes/cargo/useGetJobTitles";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Department } from "@/types";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { DialogShell } from "./DialogShell";

const KEEP = "keep";

const nowForDatetimeLocal = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

export interface MovementEmployee {
  id: number;
  name: string;
  departmentId: number;
  jobTitleId: number | null;
  isHead: boolean;
}

interface Props {
  employee: MovementEmployee | null;
  departments: Department[];
  onClose: () => void;
}

const ACTION_LABELS: Record<Exclude<DepartmentMovementAction, "rehire">, string> = {
  transfer: "Trasladar a otro departamento",
  change_role: "Cambiar cargo o jefatura",
  retire: "Retirar de la empresa",
};

export function EmployeeMovementDialog({ employee, departments, onClose }: Props) {
  if (!employee) return null;

  return (
    <MovementForm key={employee.id} employee={employee} departments={departments} onClose={onClose} />
  );
}

function MovementForm({
  employee,
  departments,
  onClose,
}: {
  employee: MovementEmployee;
  departments: Department[];
  onClose: () => void;
}) {
  const { selectedCompany } = useCompanyStore();
  const { data: jobTitles } = useGetJobTitles(selectedCompany?.slug);
  const { data: locations } = useGetLocationsByCompany(selectedCompany?.slug);
  const { registerMovement } = useRegisterDepartmentMovement();

  const [action, setAction] = useState<Exclude<DepartmentMovementAction, "rehire">>("transfer");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [locationId, setLocationId] = useState<string>(KEEP);
  const [jobTitleId, setJobTitleId] = useState<string>(KEEP);
  const [isHead, setIsHead] = useState(employee.isHead);
  const [effectiveAt, setEffectiveAt] = useState("");
  const [reason, setReason] = useState("");

  const needsReason = action === "retire";
  const canSubmit =
    (action !== "transfer" || departmentId !== "") && (!needsReason || reason.trim() !== "");

  const submit = async () => {
    if (!selectedCompany?.slug) return;

    await registerMovement.mutateAsync({
      company: selectedCompany.slug,
      employeeId: employee.id,
      action,
      department_id: action === "transfer" ? Number(departmentId) : undefined,
      location_id: locationId === KEEP ? undefined : Number(locationId),
      job_title_id: jobTitleId === KEEP ? undefined : Number(jobTitleId),
      is_head: action === "retire" ? undefined : isHead,
      effective_at: effectiveAt ? new Date(effectiveAt).toISOString() : undefined,
      reason: reason.trim() || undefined,
    });

    onClose();
  };

  return (
    <DialogShell
      open
      onOpenChange={(open) => !open && onClose()}
      icon={ArrowRightLeft}
      title="Movimiento de personal"
      eyebrow={employee.name}
      description="Queda en el historial del empleado y del departamento."
    >
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className={labelClass}>Movimiento</label>
          <Select value={action} onValueChange={(value) => setAction(value as typeof action)}>
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ACTION_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {action === "transfer" && (
          <div className="space-y-1.5">
            <label className={labelClass}>Departamento destino</label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Selecciona un departamento" />
              </SelectTrigger>
              <SelectContent>
                {departments
                  .filter((d) => d.is_active && d.id !== employee.departmentId)
                  .map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.full_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {action !== "retire" && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className={labelClass}>Sede</label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={KEEP}>Mantener la actual</SelectItem>
                    {(locations ?? []).map((location) => (
                      <SelectItem key={location.id} value={String(location.id)}>
                        {location.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Cargo</label>
                <Select value={jobTitleId} onValueChange={setJobTitleId}>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={KEEP}>Mantener el actual</SelectItem>
                    {(jobTitles ?? []).map((title) => (
                      <SelectItem key={title.id} value={String(title.id)}>
                        {title.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-400/50 p-3 dark:border-slate-600/50">
              <label className={labelClass} htmlFor="movement-is-head">
                Jefe del departamento
              </label>
              <Switch id="movement-is-head" checked={isHead} onCheckedChange={setIsHead} />
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="movement-date">
            Fecha efectiva
          </label>
          <Input
            id="movement-date"
            type="datetime-local"
            className={fieldClass}
            value={effectiveAt}
            max={nowForDatetimeLocal()}
            onChange={(event) => setEffectiveAt(event.target.value)}
          />
          <p className={hintClass}>Vacío = ahora.</p>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="movement-reason">
            Motivo{needsReason ? "" : " (opcional)"}
          </label>
          <Textarea
            id="movement-reason"
            className={textareaClass}
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant={action === "retire" ? "destructive" : "default"}
            className="min-w-35"
            disabled={!canSubmit || registerMovement.isPending}
            onClick={submit}
          >
            {registerMovement.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar"}
          </Button>
        </div>
      </div>
    </DialogShell>
  );
}
