"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

import { dateFormat } from "@/lib/utils";
import { VoluntaryReport } from "@/types/sms/mantenimiento";
import { Badge } from "@/components/ui/badge";
import { getBadgeStatusClass } from "@/lib/sms/utils";
import { VoluntaryReportDropdownActions } from "@/components/dropdowns/mantenimiento/sms/VoluntaryReportDropdownActions";

export const columns: ColumnDef<VoluntaryReport>[] = [
    {
        accessorKey: "report_date",
        header: ({ column }) => (
            <DataTableColumnHeader filter column={column} title="Fecha del reporte" />
        ),
        cell: ({ row }) => {
            return (
                <p className="font-medium text-center">
                    {dateFormat(row.original.report_date, "PPP")}
                </p>
            );
        },
    },
    {
        accessorKey: "identification_area",
        header: ({ column }) => (
            <DataTableColumnHeader
                filter
                column={column}
                title="Area de identificacion"
            />
        ),
        cell: ({ row }) => {
            return (
                <p className="font-medium text-center">{row.original.identification_area}</p>
            );
        },
    },

    {

        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Descripcion del peligro" />
        ),
        cell: ({ row }) => (
            <div className="w-64 text-center line-clamp-4">
                {row.original.description}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Estado del Reporte" />
        ),
        cell: ({ row }) => {
            const badgeClasses = getBadgeStatusClass(row.original.status);

            return (
                <div className="flex justify-center">
                    <Badge className={badgeClasses}>
                        {row.original.status}
                    </Badge>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => (
            <div className="flex justify-center">
                <VoluntaryReportDropdownActions report={row.original} kind='RVP' />
            </div>
        ),
    },
];
