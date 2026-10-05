"use client";

import { useDeleteDirectiveControl } from "@/actions/mantenimiento/planificacion/control_directivas/actions";
import { ControlRecordDropdownActions } from "@/components/dropdowns/mantenimiento/ControlRecordDropdownActions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { DirectiveControl } from "@/types";

const DirectiveControlDropdownActions = ({
  directiveControl,
}: {
  directiveControl: DirectiveControl;
}) => {
  const { deleteDirectiveControl } = useDeleteDirectiveControl();
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany!.slug;

  return (
    <ControlRecordDropdownActions
      recordType="directive_control"
      recordId={directiveControl.id}
      noun="control de directivas"
      editHref={`/${company}/planificacion/control_directivas/editar/${directiveControl.id}`}
      retiredAt={directiveControl.retired_at}
      deleteDescription={
        <>
          Se elimina con sus directivas. Si algo tiene cumplimientos registrados
          no puede eliminarse: <strong>debe darse de baja</strong>, para
          conservar su historial.
        </>
      }
      onDelete={(reason) =>
        deleteDirectiveControl.mutateAsync({
          company,
          id: directiveControl.id,
          reason,
        })
      }
    />
  );
};

export default DirectiveControlDropdownActions;
