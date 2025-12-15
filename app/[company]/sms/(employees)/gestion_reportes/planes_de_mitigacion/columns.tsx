"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import MitigationTableDropdownActions from "@/components/dropdowns/aerolinea/sms/MitigationTableDropdownActions";
import { MitigationTable } from "@/types";
import { ReportNumberCell } from "./_components/ReportNumberCell";
import { MeasuresCell } from "./_components/MeasuresCell";
import { RiskAnalysisCell } from "./_components/RiskAnalysisCell";

// Columnas de la tabla (responsive)
export const columns: ColumnDef<MitigationTable>[] = [
  {
    accessorKey: "report_number",
    accessorFn: (row) => {
      if (row.obligatory_report) {
        return `ROS-${row.obligatory_report.report_number}`; // ← CON PREFIJO
      }
      if (row.voluntary_report) {
        return `ROS-${row.voluntary_report.report_number}`; // ← CON PREFIJO
      }
      return "N/A";
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} filter title="Reporte" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-bold">
          {row.original.obligatory_report ? (
            <ReportNumberCell
              reportNumber={row.original.obligatory_report.report_number}
              type="obligatory"
              report_id={row.original.obligatory_report.id}
            />
          ) : row.original.voluntary_report ? (
            <ReportNumberCell
              reportNumber={row.original.voluntary_report.report_number}
              type="voluntary"
              report_id={row.original.voluntary_report.id}
            />
          ) : null}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "analysis",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Riesgo" filter />
    ),
    cell: ({ row }) => <RiskAnalysisCell analysis={row.original.analysis} />,
    size: 120,
    minSize: 100,
    maxSize: 150,
  },
  {
    accessorKey: "consequence_to_evaluate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Consecuencia" filter />
    ),
    cell: ({ row }) => (
      <div className="text-center text-xs sm:text-sm">
        {row.original.consequence_to_evaluate || (
          <span className="text-muted-foreground">N/A</span>
        )}
      </div>
    ),
    size: 150,
    minSize: 120,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => (
      <p className="max-w-[200px] line-clamp-3 text-center text-xs sm:text-sm break-all overflow-hidden">
        {row.original.mitigation_plan?.description || "N/A"}
      </p>
    ),
    size: 200,
    minSize: 150,
  },
  {
    accessorKey: "measures",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Medidas" />
    ),
    cell: ({ row }) => {
      return (
        <MeasuresCell
          measures={row.original.mitigation_plan?.measures || []}
          planId={row.original.mitigation_plan?.id}
        />
      );
    },
    size: 120,
    minSize: 100,
  },
  {
    accessorKey: "post_mitigation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Post-Mit." />
    ),
    cell: ({ row }) => (
      <RiskAnalysisCell analysis={row.original.mitigation_plan?.analysis} />
    ),
    size: 120,
    minSize: 100,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const mitigationTable = row.original;
      return (
        <MitigationTableDropdownActions mitigationTable={mitigationTable} />
      );
    },
  },
];
