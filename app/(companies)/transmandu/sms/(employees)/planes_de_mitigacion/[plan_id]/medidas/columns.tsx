"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import MitigationMeasureDropdownActions from "@/components/misc/MitigationMeasuresDropDownActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FollowUpControl, MitigationMeasure } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";

// Component for FollowUpControl cell
const FollowUpControlCell = ({
  followUpControls,
  planId,
  measureId
}: {
  followUpControls: FollowUpControl[];
  planId: string | number;
  measureId: string | number;
}) => {
  const { theme } = useTheme();

  return (
    <Badge className="flex flex-col justify-center h-8 bg-blue-300 rounded-full text-black">
      {followUpControls.length ? (
        <Dialog>
          <DialogTrigger className="font-semibold">
            Controles de Seguimiento
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogDescription className={`font-semibold ${
                theme === "light" ? "text-black" : "text-white"
              }`}>
                Controles de Seguimiento de las Medidas
              </DialogDescription>
            </DialogHeader>

            <div className="border rounded-lg p-4 shadow-md">
              <ul>
                {followUpControls.map((control, index) => (
                  <li key={control.id} className="mb-2">
                    <ul className="font-semibold">
                      {++index} ) {control.description}
                    </ul>
                    <ul className="text-sm text-gray-600">
                      <p className="font-medium text-left">
                        {format(control.date, "PPP", {
                          locale: es,
                        })}
                      </p>
                    </ul>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={`/transmandu/sms/planes_de_mitigacion/${planId}/medidas/${measureId}/controles_de_seguimiento`}
            >
              <div className="flex justify-end mt-4">
                <Button className="w-1/3">Ver mas</Button>
              </div>
            </Link>
          </DialogContent>
        </Dialog>
      ) : (
        <div className="flex flex-col justify-center text-center">
          Sin Control
        </div>
      )}
    </Badge>
  );
};

export const columns: ColumnDef<MitigationMeasure>[] = [
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Descripcion de la Medida"
      />
    ),
    meta: { title: "Descripcion de la Medida" },
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
        title="Encargado de Implementacion"
      />
    ),
    meta: { title: "Encargado de Implementacion" },
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
        title="Supervisor de Implemetacion"
      />
    ),
    meta: { title: "Supervisor de Implementacion" },
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
      <FollowUpControlCell
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