"use client";

import { useDeleteComponentControl } from "@/actions/mantenimiento/planificacion/control_componentes/actions";
import { ControlRecordDropdownActions } from "@/components/dropdowns/mantenimiento/ControlRecordDropdownActions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ComponentControl } from "@/types";

const ComponentControlDropdownActions = ({
  componentControl,
}: {
  componentControl: ComponentControl;
}) => {
  const { deleteComponentControl } = useDeleteComponentControl();
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany!.slug;

  return (
    <ControlRecordDropdownActions
      recordType="component_control"
      recordId={componentControl.id}
      noun="control de componentes"
      editHref={`/${company}/planificacion/control_componentes/editar/${componentControl.id}`}
      retiredAt={componentControl.retired_at}
      deleteDescription={
        <>
          Se elimina con sus componentes. Si algo tiene cumplimientos
          registrados no puede eliminarse: <strong>debe darse de baja</strong>,
          para conservar su historial.
        </>
      }
      onDelete={(reason) =>
        deleteComponentControl.mutateAsync({
          company,
          id: componentControl.id,
          reason,
        })
      }
    />
  );
};

export default ComponentControlDropdownActions;
