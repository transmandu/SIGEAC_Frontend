"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import MitigationMeasureDropdownActions from "@/components/dropdowns/aerolinea/sms/MitigationMeasuresDropDownActions";
import { MitigationMeasure } from "@/types";
import FollowUpControlDialog from "../../_components/FollowUpControlDialog";

export const columns: ColumnDef<MitigationMeasure>[] = [
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Descripción de la Medida"
      />
    ),
    meta: { title: "Descripción de la Medida" },
    cell: ({ row }) => (
      <div className="flex flex-col justify-center text-center">
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: "implementation_responsible",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Encargado de Implementación"
      />
    ),
    meta: { title: "Encargado de Implementación" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.original.implementation_responsible}
      </div>
    ),
  },
  {
    accessorKey: "implementation_supervisor",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Supervisor de Implementación"
      />
    ),
    meta: { title: "Supervisor de Implementación" },
    cell: ({ row }) => (
      <p className="font-medium text-center">
        {row.original.implementation_supervisor}
      </p>
    ),
  },
  {
    accessorKey: "followUpControl",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Controles de Seguimiento" />
    ),
    cell: ({ row }) => (
      <FollowUpControlDialog
        followUpControls={row.original.follow_up_control}
        planId={row.original.mitigation_plan_id}
        measureId={row.original.id}
      />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <MitigationMeasureDropdownActions mitigationMeasure={row.original} />
    ),
  },
];
