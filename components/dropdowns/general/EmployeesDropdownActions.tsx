"use client";

import { useState } from "react";
import {
  ArrowRightLeft,
  History,
  Pencil,
  Trash2,
  UserCheck,
  UserRound,
  UserX,
} from "lucide-react";
import { useDeleteEmployee } from "@/actions/ajustes/empleados/actions";
import { EmployeeHistoryDialog } from "@/components/dialogs/general/EmployeeHistoryDialog";
import {
  ChangeAssignmentDialog,
  RehireEmployeeDialog,
  TerminateEmployeeDialog,
} from "@/components/dialogs/general/EmployeeLifecycleDialogs";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { UpdateEmployeeForm } from "@/components/forms/general/UpdateEmployeeForm";
import { Dialog } from "@/components/ui/dialog";
import { useIsSuperuser } from "@/hooks/helpers/useIsSuperuser";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Employee } from "@/types";
import { fullName as personName } from "@/lib/person-name";

const EmployeesDropdownActions = ({ employee }: { employee: Employee }) => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openAssignment, setOpenAssignment] = useState(false);
  const [openTerminate, setOpenTerminate] = useState(false);
  const [openRehire, setOpenRehire] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);

  const { selectedCompany } = useCompanyStore();
  const isSuperUser = useIsSuperuser();

  const deleteEmployee = useDeleteEmployee();

  const isActive = !!employee.isActive;
  const fullName = personName(employee);
  const company = selectedCompany?.slug ?? "";

  const history: RowAction = {
    key: "history",
    label: "Ver historial laboral",
    icon: History,
    tone: "blue",
    onSelect: () => setOpenHistory(true),
  };

  // Todo lo que escribe empleados es solo de SUPERUSER (la API lo exige igual).
  const actions: RowAction[] = isSuperUser
    ? [
        ...(isActive
          ? [
              {
                key: "edit",
                label: "Editar empleado",
                icon: Pencil,
                tone: "blue" as const,
                onSelect: () => setOpenUpdate(true),
              },
              {
                key: "assignment",
                label: "Cambiar asignación",
                icon: ArrowRightLeft,
                tone: "blue" as const,
                onSelect: () => setOpenAssignment(true),
              },
            ]
          : []),
        history,
        isActive
          ? {
              key: "terminate",
              label: "Dar de baja",
              icon: UserX,
              onSelect: () => setOpenTerminate(true),
            }
          : {
              key: "rehire",
              label: "Recontratar",
              icon: UserCheck,
              onSelect: () => setOpenRehire(true),
            },
        {
          key: "delete",
          label: "Eliminar permanentemente",
          icon: Trash2,
          tone: "red" as const,
          onSelect: () => setOpenDelete(true),
        },
      ]
    : [history];

  return (
    <>
      <SettingsRowActions actions={actions} />

      <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
        <FormDialogContent
          icon={UserRound}
          title="Actualizar empleado"
          description={
            <>
              Modifique los datos personales y de contacto de{" "}
              <span className="font-medium text-foreground">{fullName}</span>
            </>
          }
          className="sm:max-w-3xl"
        >
          <UpdateEmployeeForm
            employee={employee}
            onSuccess={() => setOpenUpdate(false)}
          />
        </FormDialogContent>
      </Dialog>

      {isActive && (
        <>
          <ChangeAssignmentDialog
            employee={employee}
            open={openAssignment}
            onOpenChange={setOpenAssignment}
          />
          <TerminateEmployeeDialog
            employee={employee}
            open={openTerminate}
            onOpenChange={setOpenTerminate}
          />
        </>
      )}

      {!isActive && (
        <RehireEmployeeDialog
          employee={employee}
          open={openRehire}
          onOpenChange={setOpenRehire}
        />
      )}

      <EmployeeHistoryDialog
        employee={employee}
        open={openHistory}
        onOpenChange={setOpenHistory}
      />

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar empleado"
        entityName={fullName}
        warning={
          <>
            Esta acción es <b>irreversible</b> y borra también su historial
            laboral. Si el empleado tiene registros asociados (solicitudes,
            minutas, recepciones, cursos…) no se podrá eliminar: en ese caso, dé
            de baja al empleado para conservar su historial.
          </>
        }
        isPending={deleteEmployee.isPending}
        onConfirm={() =>
          deleteEmployee.mutateAsync({ id: employee.id, company })
        }
      />
    </>
  );
};

export default EmployeesDropdownActions;
