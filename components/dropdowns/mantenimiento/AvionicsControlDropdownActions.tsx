"use client";

import { useDeleteAvionicsControl } from "@/actions/mantenimiento/planificacion/control_avionica/actions";
import { ControlRecordDropdownActions } from "@/components/dropdowns/mantenimiento/ControlRecordDropdownActions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AvionicsControl } from "@/types";

const AvionicsControlDropdownActions = ({
  avionicsControl,
}: {
  avionicsControl: AvionicsControl;
}) => {
  const { deleteAvionicsControl } = useDeleteAvionicsControl();
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany!.slug;

  return (
    <ControlRecordDropdownActions
      recordType="avionics_control"
      recordId={avionicsControl.id}
      noun="control de aviónica"
      editHref={`/${company}/planificacion/control_avionica/editar/${avionicsControl.id}`}
      retiredAt={avionicsControl.retired_at}
      deleteDescription={
        <>
          Se elimina con sus equipos y tareas. Si algo tiene cumplimientos
          registrados no puede eliminarse: <strong>debe darse de baja</strong>,
          para conservar su historial.
        </>
      }
      onDelete={(reason) =>
        deleteAvionicsControl.mutateAsync({
          company,
          id: avionicsControl.id,
          reason,
        })
      }
    />
  );
};

export default AvionicsControlDropdownActions;
