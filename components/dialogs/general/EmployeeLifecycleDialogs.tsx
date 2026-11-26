"use client";

import { ArrowRightLeft, UserCheck, UserX } from "lucide-react";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { ChangeAssignmentForm } from "@/components/forms/general/employee-lifecycle/ChangeAssignmentForm";
import { RehireEmployeeForm } from "@/components/forms/general/employee-lifecycle/RehireEmployeeForm";
import { TerminateEmployeeForm } from "@/components/forms/general/employee-lifecycle/TerminateEmployeeForm";
import { Dialog } from "@/components/ui/dialog";
import { fullName } from "@/lib/person-name";
import type { Employee } from "@/types";

interface DialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Name = ({ employee }: { employee: Employee }) => (
  <span className="font-medium text-foreground">{fullName(employee)}</span>
);

/** Cambio de cargo, departamento o sede de un empleado que trabaja hoy. */
export function ChangeAssignmentDialog({
  employee,
  open,
  onOpenChange,
}: DialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        icon={ArrowRightLeft}
        title="Cambiar asignación"
        description={
          <>
            Registre el nuevo cargo, departamento o sede de{" "}
            <Name employee={employee} />. La asignación anterior queda en su
            historial.
          </>
        }
        className="sm:max-w-2xl"
      >
        <ChangeAssignmentForm
          employee={employee}
          onSuccess={() => onOpenChange(false)}
        />
      </FormDialogContent>
    </Dialog>
  );
}

/** Baja de un empleado: termina su periodo laboral. */
export function TerminateEmployeeDialog({
  employee,
  open,
  onOpenChange,
}: DialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        icon={UserX}
        tone="amber"
        title="Dar de baja"
        description={
          <>
            Registre el egreso de <Name employee={employee} />. Dejará de
            figurar como activo y su historial se conserva.
          </>
        }
        className="sm:max-w-xl"
      >
        <TerminateEmployeeForm
          employee={employee}
          onSuccess={() => onOpenChange(false)}
        />
      </FormDialogContent>
    </Dialog>
  );
}

/** Recontratación: nuevo periodo laboral de quien ya egresó. */
export function RehireEmployeeDialog({
  employee,
  open,
  onOpenChange,
}: DialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        icon={UserCheck}
        tone="emerald"
        title="Recontratar"
        description={
          <>
            Registre el nuevo ingreso de <Name employee={employee} />. Su
            historial anterior se conserva y se abre un periodo nuevo.
          </>
        }
        className="sm:max-w-2xl"
      >
        <RehireEmployeeForm
          employee={employee}
          onSuccess={() => onOpenChange(false)}
        />
      </FormDialogContent>
    </Dialog>
  );
}
