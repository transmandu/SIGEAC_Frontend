"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDepartmentMembers } from "@/hooks/ajustes/departamento/useGetDepartmentMembers";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Department } from "@/types";
import { ArrowRightLeft, Users } from "lucide-react";
import { useState } from "react";
import { EmployeeMovementDialog, MovementEmployee } from "./EmployeeMovementDialog";
import { listRowClass } from "./theme";

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
  const { data: members, isLoading } = useGetDepartmentMembers(selectedCompany?.slug, department.id);
  const [moving, setMoving] = useState<MovementEmployee | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    );
  }

  if (!members?.length) {
    return (
      <div className="bg-muted/40 flex flex-col items-center gap-2 rounded-xl px-4 py-10 text-center">
        <Users className="text-muted-foreground size-8" />
        <p className="text-sm font-medium">Sin personal activo</p>
        <p className="text-muted-foreground text-xs">
          Las personas aparecen aquí cuando se asignan a este departamento.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {members.map((member) => (
          <li
            key={member.id}
            className={cn(listRowClass, "flex items-center gap-3 p-3")}
          >
            <span className="bg-primary/10 text-primary grid size-10 shrink-0 place-content-center rounded-full text-sm font-semibold">
              {initials(member.employee)}
            </span>

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-medium">
                <span className="truncate">{fullName(member.employee)}</span>
                {member.is_head && (
                  <span className="text-primary text-xs font-semibold">Jefe</span>
                )}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {member.job_title?.name ?? "Sin cargo"}
                {member.location && ` · ${member.location.cod_iata}`}
                {` · desde ${new Date(member.started_at).toLocaleDateString()}`}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="shrink-0 bg-white/80 dark:bg-slate-900/60"
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
              <span className="hidden sm:inline">Mover o retirar</span>
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
