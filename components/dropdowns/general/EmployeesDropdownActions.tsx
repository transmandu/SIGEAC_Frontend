"use client";

import { useState } from "react";
import { Minus, Pencil, RotateCcw, Trash2 } from "lucide-react";
import {
  useDeactivateEmployee,
  useDeleteEmployee,
  useReactivateEmployee,
} from "@/actions/ajustes/empleados/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { UpdateEmployeeForm } from "@/components/forms/general/UpdateEmployeeForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const toggleStatus = async (
    mutation: typeof deactivateEmployee,
    close: () => void,
  ) => {
    try {
      await mutation.mutateAsync({ id: employee.id, company });
      close();
    } catch {
      // El aviso lo muestra la mutación; el diálogo queda abierto.
    }
  };

  return (
    <>
      <SettingsRowActions actions={actions} />

      <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
        <DialogContent className="max-w-lg lg:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Actualizar empleado</DialogTitle>
            <DialogDescription>
              Modifique la información de{" "}
              <span className="font-medium text-foreground">{fullName}</span>
            </DialogDescription>
          </DialogHeader>

          <UpdateEmployeeForm
            employee={employee}
            onSuccess={() => setOpenUpdate(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openDeactivate} onOpenChange={setOpenDeactivate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Desactivar empleado</DialogTitle>
            <DialogDescription>
              {fullName} será ocultado de operaciones activas, pero podrá ser
              reactivado posteriormente.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-sm text-yellow-700 dark:text-yellow-400">
            Acción reversible. No se eliminan datos del sistema.
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenDeactivate(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
              disabled={deactivateEmployee.isPending}
              onClick={() =>
                toggleStatus(deactivateEmployee, () => setOpenDeactivate(false))
              }
            >
              Desactivar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openReactivate} onOpenChange={setOpenReactivate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reactivar empleado</DialogTitle>
            <DialogDescription>
              {fullName} volverá a estar activo en el sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-sm text-green-700 dark:text-green-400">
            Se restaurará su acceso a operaciones activas.
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenReactivate(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={reactivateEmployee.isPending}
              onClick={() =>
                toggleStatus(reactivateEmployee, () => setOpenReactivate(false))
              }
            >
              Reactivar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
