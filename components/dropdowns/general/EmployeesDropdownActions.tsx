"use client";

import { useState } from "react";
import {
  Minus,
  Pencil,
  RotateCcw,
  Trash2,
  UserCheck,
  UserRound,
  UserX,
} from "lucide-react";
import {
  useDeactivateEmployee,
  useDeleteEmployee,
  useReactivateEmployee,
} from "@/actions/ajustes/empleados/actions";
import { ConfirmActionDialog } from "@/components/dialogs/shared/ConfirmActionDialog";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { UpdateEmployeeForm } from "@/components/forms/general/UpdateEmployeeForm";
import { Dialog } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Employee } from "@/types";

const EmployeesDropdownActions = ({ employee }: { employee: Employee }) => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDeactivate, setOpenDeactivate] = useState(false);
  const [openReactivate, setOpenReactivate] = useState(false);

  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();

  const deleteEmployee = useDeleteEmployee();
  const deactivateEmployee = useDeactivateEmployee();
  const reactivateEmployee = useReactivateEmployee();

  const isSuperUser = user?.roles?.some((role) => role.name === "SUPERUSER");
  const isActive = !!employee.isActive;
  const fullName = `${employee.first_name} ${employee.last_name}`;
  const company = selectedCompany?.slug ?? "";

  const actions: RowAction[] = [
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
            key: "deactivate",
            label: "Desactivar empleado",
            icon: Minus,
            onSelect: () => setOpenDeactivate(true),
          },
        ]
      : [
          {
            key: "reactivate",
            label: "Reactivar empleado",
            icon: RotateCcw,
            onSelect: () => setOpenReactivate(true),
          },
        ]),
    ...(isSuperUser
      ? [
          {
            key: "delete",
            label: "Eliminar permanentemente",
            icon: Trash2,
            tone: "red" as const,
            onSelect: () => setOpenDelete(true),
          },
        ]
      : []),
  ];

  return (
    <>
      <SettingsRowActions actions={actions} />

      <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
        <FormDialogContent
          icon={UserRound}
          title="Actualizar empleado"
          description={
            <>
              Modifique la información de{" "}
              <span className="font-medium text-foreground">{fullName}</span>
            </>
          }
          className="max-w-lg lg:max-w-2xl"
        >
          <UpdateEmployeeForm
            employee={employee}
            onSuccess={() => setOpenUpdate(false)}
          />
        </FormDialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={openDeactivate}
        onOpenChange={setOpenDeactivate}
        title="Desactivar empleado"
        entityName={fullName}
        icon={UserX}
        tone="amber"
        confirmLabel="Desactivar"
        isPending={deactivateEmployee.isPending}
        onConfirm={() =>
          deactivateEmployee.mutateAsync({ id: employee.id, company })
        }
      >
        Será ocultado de las operaciones activas, pero podrá ser reactivado
        después. Acción reversible: no se elimina ningún dato.
      </ConfirmActionDialog>

      <ConfirmActionDialog
        open={openReactivate}
        onOpenChange={setOpenReactivate}
        title="Reactivar empleado"
        entityName={fullName}
        icon={UserCheck}
        tone="primary"
        confirmLabel="Reactivar"
        isPending={reactivateEmployee.isPending}
        onConfirm={() =>
          reactivateEmployee.mutateAsync({ id: employee.id, company })
        }
      >
        Volverá a estar activo en el sistema y se restaurará su acceso a las
        operaciones activas.
      </ConfirmActionDialog>

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar empleado"
        entityName={fullName}
        warning={
          <>
            Esta acción es <b>irreversible</b> y elimina todos los datos
            asociados al empleado.
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
