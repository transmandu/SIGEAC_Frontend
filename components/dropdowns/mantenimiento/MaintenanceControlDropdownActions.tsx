"use client";

import { useDeleteMaintenanceControl } from "@/actions/mantenimiento/planificacion/control_mantenimiento/actions";
import { ControlRecordDropdownActions } from "@/components/dropdowns/mantenimiento/ControlRecordDropdownActions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { MaintenanceControl } from "@/types";

const MaintenanceControlDropdownActions = ({
  maintenanceControl,
}: {
  maintenanceControl: MaintenanceControl;
}) => {
  const { deleteMaintenanceControl } = useDeleteMaintenanceControl();
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany!.slug;

  return (
    <ControlRecordDropdownActions
      recordType="maintenance_control"
      recordId={maintenanceControl.id}
      noun="control de mantenimiento"
      editHref={`/${company}/planificacion/control_mantenimiento/editar/${maintenanceControl.id}`}
      retiredAt={maintenanceControl.retired_at}
      deleteDescription={
        <>
          Se elimina con sus certificados, servicios y partes. Si algo tiene
          cumplimientos registrados no puede eliminarse:{" "}
          <strong>debe darse de baja</strong>, para conservar su historial.
        </>
      }
      onDelete={(reason) =>
        deleteMaintenanceControl.mutateAsync({
          company,
          id: maintenanceControl.id,
          reason,
        })
      }
    />
  );
};

export default MaintenanceControlDropdownActions;
