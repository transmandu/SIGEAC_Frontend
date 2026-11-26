"use client";

import { Briefcase, CalendarRange } from "lucide-react";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { CorrectAssignmentForm } from "@/components/forms/general/employee-lifecycle/CorrectAssignmentForm";
import { CorrectPeriodForm } from "@/components/forms/general/employee-lifecycle/CorrectPeriodForm";
import { Dialog } from "@/components/ui/dialog";
import type {
  Employee,
  EmployeeAssignment,
  EmployeeHistoryPeriod,
} from "@/types";

interface DialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Corrige un periodo ya registrado: lo que cambia es el dato, no se crea historia nueva. */
export function CorrectPeriodDialog({
  employee,
  period,
  open,
  onOpenChange,
}: DialogProps & { period: EmployeeHistoryPeriod }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        icon={CalendarRange}
        title="Corregir periodo"
        description="Corrija las fechas de este periodo. Las asignaciones de sus extremos se ajustan solas."
        className="sm:max-w-xl"
      >
        <CorrectPeriodForm
          employee={employee}
          period={period}
          onSuccess={() => onOpenChange(false)}
        />
      </FormDialogContent>
    </Dialog>
  );
}

/** Corrige una asignación ya registrada. */
export function CorrectAssignmentDialog({
  employee,
  assignment,
  first,
  open,
  onOpenChange,
}: DialogProps & { assignment: EmployeeAssignment; first: boolean }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        icon={Briefcase}
        title="Corregir asignación"
        description={
          first
            ? "Corrija el cargo, el departamento o la sede. Su fecha es la del ingreso: se corrige en el periodo."
            : "Corrija el cargo, el departamento, la sede, la fecha o el motivo de esta asignación del historial."
        }
        className="sm:max-w-2xl"
      >
        <CorrectAssignmentForm
          employee={employee}
          assignment={assignment}
          first={first}
          onSuccess={() => onOpenChange(false)}
        />
      </FormDialogContent>
    </Dialog>
  );
}
