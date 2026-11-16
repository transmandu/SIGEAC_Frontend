"use client";

import { useMemo, useState } from "react";
import { ArrowRightLeft, Briefcase, Loader2 } from "lucide-react";

import {
  DepartmentMovementAction,
  useRegisterDepartmentMovement,
} from "@/actions/ajustes/empleados/movements";
import {
  hintClass,
  selectTriggerClass,
  textareaClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { OptionCombobox } from "@/components/forms/general/OptionCombobox";
import {
  PanelSection,
  PanelStaticLabel,
  SwitchRow,
} from "@/components/forms/PanelSection";
import { DateTimeField } from "@/components/misc/DateTimeField";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { useGetJobTitles } from "@/hooks/ajustes/cargo/useGetJobTitles";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { zonedWallClockToUtcIso } from "@/lib/date";
import { locationLabel } from "@/lib/locations";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Department } from "@/types";
import { DialogShell } from "./DialogShell";

const KEEP = "keep";
const REASON_MAX = 500;

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

type MovementAction = Exclude<DepartmentMovementAction, "rehire">;

const ACTION_LABELS: Record<MovementAction, string> = {
  transfer: "Trasladar a otro departamento",
  change_role: "Cambiar cargo o jefatura",
  retire: "Retirar de la empresa",
};

export function EmployeeMovementDialog({ employee, departments, onClose }: Props) {
  if (!employee) return null;

  return (
    <MovementForm
      key={employee.id}
      employee={employee}
      departments={departments}
      onClose={onClose}
    />
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
  const timeZone = useCompanyTimezone();
  const { data: jobTitles, isLoading: loadingTitles } = useGetJobTitles(selectedCompany?.slug);
  const { data: locations, isLoading: loadingLocations } = useGetLocationsByCompany(
    selectedCompany?.slug,
  );
  const { registerMovement } = useRegisterDepartmentMovement();

  const [action, setAction] = useState<MovementAction>("transfer");
  const [departmentId, setDepartmentId] = useState("");
  const [locationId, setLocationId] = useState(KEEP);
  const [jobTitleId, setJobTitleId] = useState(KEEP);
  const [isHead, setIsHead] = useState(employee.isHead);
  const [effectiveAt, setEffectiveAt] = useState<Date | null>(null);
  const [reason, setReason] = useState("");

  const departmentOptions = useMemo(
    () =>
      departments
        .filter((d) => d.is_active && d.id !== employee.departmentId)
        .map((d) => ({ id: String(d.id), label: d.full_name })),
    [departments, employee.departmentId],
  );
  const locationOptions = useMemo(
    () => [
      { id: KEEP, label: "Mantener la actual" },
      ...(locations ?? []).map((location) => ({
        id: String(location.id),
        label: locationLabel(location),
      })),
    ],
    [locations],
  );
  const jobTitleOptions = useMemo(
    () => [
      { id: KEEP, label: "Mantener el actual" },
      ...(jobTitles ?? []).map((title) => ({
        id: String(title.id),
        label: title.name,
      })),
    ],
    [jobTitles],
  );

  const needsReason = action === "retire";
  const canSubmit =
    (action !== "transfer" || departmentId !== "") &&
    (!needsReason || reason.trim() !== "") &&
    !registerMovement.isPending;

  const submit = async () => {
    if (!selectedCompany?.slug || !canSubmit) return;

    try {
      await registerMovement.mutateAsync({
        company: selectedCompany.slug,
        employeeId: employee.id,
        action,
        department_id: action === "transfer" ? Number(departmentId) : undefined,
        location_id: locationId === KEEP ? undefined : Number(locationId),
        job_title_id: jobTitleId === KEEP ? undefined : Number(jobTitleId),
        is_head: action === "retire" ? undefined : isHead,
        effective_at: effectiveAt ? zonedWallClockToUtcIso(effectiveAt, timeZone) : undefined,
        reason: reason.trim() || undefined,
      });
    } catch {
      return;
    }

    onClose();
  };

  return (
    <DialogShell
      open
      onOpenChange={(open) => !open && !registerMovement.isPending && onClose()}
      icon={ArrowRightLeft}
      title="Movimiento de personal"
      eyebrow={employee.name}
      description="Queda en el historial del empleado y del departamento."
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={registerMovement.isPending}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={action === "retire" ? "destructive" : "default"}
            className="min-w-35"
            disabled={!canSubmit}
            onClick={submit}
          >
            {registerMovement.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Registrar"
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <PanelSection
          icon={ArrowRightLeft}
          title="Movimiento"
          hint="Qué le ocurre al empleado en este departamento."
        >
          <div className="space-y-4">
            <div>
              <PanelStaticLabel>Tipo de movimiento</PanelStaticLabel>
              <Select value={action} onValueChange={(value) => setAction(value as MovementAction)}>
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
              <div>
                <PanelStaticLabel>Departamento destino</PanelStaticLabel>
                <OptionCombobox
                  value={departmentId}
                  onChange={setDepartmentId}
                  options={departmentOptions}
                  placeholder="Seleccione un departamento"
                  searchPlaceholder="Buscar departamento..."
                />
              </div>
            )}
          </div>
        </PanelSection>

        {action !== "retire" && (
          <PanelSection
            icon={Briefcase}
            title="Puesto"
            hint="Déjelo como está si solo cambia el departamento."
          >
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <PanelStaticLabel>Sede</PanelStaticLabel>
                  <OptionCombobox
                    value={locationId}
                    onChange={setLocationId}
                    options={locationOptions}
                    loading={loadingLocations}
                    searchPlaceholder="Buscar sede..."
                  />
                </div>

                <div>
                  <PanelStaticLabel>Cargo</PanelStaticLabel>
                  <OptionCombobox
                    value={jobTitleId}
                    onChange={setJobTitleId}
                    options={jobTitleOptions}
                    loading={loadingTitles}
                    searchPlaceholder="Buscar cargo..."
                  />
                </div>
              </div>

              <SwitchRow
                id="movement-is-head"
                checked={isHead}
                onCheckedChange={setIsHead}
                label="Jefe del departamento"
                description="Se registra como responsable del departamento."
              />
            </div>
          </PanelSection>
        )}

        <PanelSection
          icon={ArrowRightLeft}
          title="Registro"
          hint="Cuándo ocurrió y por qué."
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <DateTimeField
                label="Fecha efectiva"
                value={effectiveAt}
                onChange={setEffectiveAt}
                clearable
                emptyLabel="Ahora"
              />
              <p className={hintClass}>Sin fecha se registra en este momento.</p>
            </div>

            <div>
              <PanelStaticLabel>
                {needsReason ? "Motivo" : "Motivo (opcional)"}
              </PanelStaticLabel>
              <Textarea
                id="movement-reason"
                className={textareaClass}
                rows={3}
                maxLength={REASON_MAX}
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
