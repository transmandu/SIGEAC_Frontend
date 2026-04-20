"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

import { Badge } from "@/components/ui/badge";
import { dateFormat } from "@/lib/utils";
import { ObligatoryReport } from "@/types/sms/mantenimiento";
import { getBadgeStatusClass } from "@/lib/sms/utils";

export const columns: ColumnDef<ObligatoryReport>[] = [

    {
        accessorKey: "report_date",
        header: ({ column }) => (
            <DataTableColumnHeader filter column={column} title="Fecha del reporte" />
        ),
        cell: ({ row }) => {
            return (
                <p className="font-medium text-center">
                    {row.original.report_date
                        ? dateFormat(row.original.report_date, "PPP")
                        : "N/A"}
                </p>
            );
        },
    },

    {
        accessorKey: "incident_date",
        header: ({ column }) => (
            <DataTableColumnHeader filter column={column} title="Fecha del Incidente" />
        ),
        cell: ({ row }) => {
            return (
                <p className="font-medium text-center">
                    {row.original.report_date
                        ? dateFormat(row.original.report_date, "PPP")
                        : "N/A"}
                </p>
            );
        },
    },
    {
        accessorKey: "incident_time",
        header: ({ column }) => (
            <DataTableColumnHeader filter column={column} title="Hora del suceso" />
        ),
        cell: ({ row }) => {
            const incident_time = row.original.incident_time;
            return <p className="font-medium text-center">{incident_time}</p>;
        },
    },
    {
        accessorKey: "incidents",
        header: ({ column }) => (
            <DataTableColumnHeader filter column={column} title="Incidente" />
        ),
        cell: ({ row }) => {
            // Intentamos parsear solo si es un string que parece array, de lo contrario usamos el valor tal cual
            const rawIncidents = row.original.incidents;

            const incidents = typeof rawIncidents === "string" && rawIncidents.startsWith("[")
                ? JSON.parse(rawIncidents)
                : rawIncidents;

            const otherIncidents = row.original.other_incidents;

            // Validación para renderizar
            const hasIncidents = Array.isArray(incidents) && incidents.length > 0;

            return (
                <div className="font-medium text-center">
                    {hasIncidents ? (
                        <div className="flex flex-col gap-1">
                            {incidents.map((inc: string, index: number) => (
                                <p key={index} className="leading-tight">
                                    {inc}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <p>{otherIncidents || "Sin incidentes registrados"}</p>
                    )}
                </div>
            );
        },
    }, {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Estado" />
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

    // {
    //     id: "actions",
    //     cell: ({ row }) => {
    //         const obligatoryReport = row.original;
    //         return (
    //             <ObligatoryReportDropdownActions
    //                 obligatoryReport={obligatoryReport}
    //             ></ObligatoryReportDropdownActions>
    //         );
    //     },
    // },
];
