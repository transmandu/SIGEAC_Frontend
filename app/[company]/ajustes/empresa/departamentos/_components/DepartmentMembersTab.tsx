"use client";

import { useState } from "react";
import { ArrowRightLeft, TriangleAlert, Users } from "lucide-react";

import { EmptyState } from "@/components/misc/EmptyState";
import { TagBadge } from "@/components/misc/TagBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { useGetDepartmentMembers } from "@/hooks/ajustes/departamento/useGetDepartmentMembers";
import { formatInstant } from "@/lib/date";
import { locationShortLabel } from "@/lib/locations";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Department } from "@/types";
import { EmployeeMovementDialog, MovementEmployee } from "./EmployeeMovementDialog";

type Person = {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  second_last_name: string | null;
};

const fullName = (employee?: Person) =>
  employee
    ? [employee.first_name, employee.middle_name, employee.last_name, employee.second_last_name]
        .filter(Boolean)
        .join(" ")
    : "";

const initials = (employee?: Person) =>
  `${employee?.first_name?.[0] ?? ""}${employee?.last_name?.[0] ?? ""}`.toUpperCase() || "?";

export function DepartmentMembersTab({
  department,
  departments,
}: {
  department: Department;
  departments: Department[];
}) {
  const { selectedCompany } = useCompanyStore();
  const timeZone = useCompanyTimezone();
  const {
    data: members,
    isLoading,
    isError,
    refetch,
  } = useGetDepartmentMembers(selectedCompany?.slug, department.id);
  const [moving, setMoving] = useState<MovementEmployee | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={TriangleAlert}
        tone="error"
        title="No se pudo cargar el personal"
        description="Revise su conexión e inténtelo de nuevo."
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Reintentar
          </Button>
        }
        className="py-8"
      />
    );
  }

  if (!members?.length) {
    return (
      <EmptyState
        icon={Users}
        title="Sin personal activo"
        description="Las personas aparecen aquí cuando se asignan a este departamento."
        className="py-8"
      />
    );
  }

  return (
    <>
      <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900/60">
        {members.map((member) => (
          <li key={member.id} className="flex items-center gap-3 px-3 py-2.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials(member.employee)}
            </span>

            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
                <span className="wrap-anywhere">{fullName(member.employee)}</span>
                {member.is_head && <TagBadge tone="blue">Jefe</TagBadge>}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {[
                  member.job_title?.name ?? "Sin cargo",
                  member.location ? locationShortLabel(member.location) : null,
                  `desde ${formatInstant(member.started_at, timeZone, "date")}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 bg-white/80 max-sm:size-10 max-sm:p-0 dark:bg-slate-900/60"
              aria-label={`Mover o retirar a ${fullName(member.employee)}`}
              onClick={() =>
                setMoving({
                  id: member.employee_id,
                  name: fullName(member.employee),
                  departmentId: department.id,
                  jobTitleId: member.job_title_id,
                  isHead: member.is_head,
                })
              }
            >
              <ArrowRightLeft className="size-4" />
              <span className="max-sm:hidden">Mover o retirar</span>
            </Button>
          </li>
        ))}
      </ul>

      <EmployeeMovementDialog
        employee={moving}
        departments={departments}
        onClose={() => setMoving(null)}
      />
    </>
  );
}
