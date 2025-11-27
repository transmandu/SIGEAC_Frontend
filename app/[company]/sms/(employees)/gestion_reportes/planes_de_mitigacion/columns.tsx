"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import MitigationTableDropdownActions from "@/components/dropdowns/aerolinea/sms/MitigationTableDropdownActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MitigationMeasure, MitigationTable } from "@/types";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getResult } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { formatDate } from "date-fns";

// Componente para mostrar las medidas de mitigación (responsive)
const MeasuresCell = ({
  measures,
  planId,
}: {
  measures: MitigationMeasure[];
  planId?: string | number;
}) => {
  const { selectedCompany } = useCompanyStore();
  return (
    <div className="flex justify-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="min-w-[100px] md:min-w-[120px]"
          >
            {measures?.length > 0 ? (
              <span className="flex items-center gap-1 md:gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="hidden sm:inline">
                  {measures.length} medida{measures.length !== 1 ? "s" : ""}
                </span>
                <span className="sm:hidden">{measures.length}</span>
              </span>
            ) : (
              <span className="truncate">Sin medidas</span>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="w-[95vw] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Medidas de Mitigación
            </DialogTitle>
            <DialogDescription>
              Una lista de las medidas asociadas a este plan de mitigación.
            </DialogDescription>
          </DialogHeader>

          <Card className="p-4 rounded-lg shadow-sm transition-shadow hover:shadow-md">
            {measures.length > 0 ? (
              <ol className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {measures.map((measure, index) => (
                  <li
                    key={measure.id}
                    className="flex items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-md transition-transform transform hover:scale-[1.01] hover:shadow-sm"
                  >
                    <span className="mr-3 mt-1 font-medium text-blue-600 dark:text-blue-400 shrink-0 text-base">
                      {index + 1}.
                    </span>
                    <div className="flex flex-col text-sm text-gray-700 dark:text-gray-300 break-words leading-relaxed">
                      {/* Descripción en una sola línea */}
                      <div className="flex items-start">
                        <p className="font-bold mr-1">Descripción:</p>
                        <span>{measure.description}</span>
                      </div>

                      {/* Fecha en una sola línea */}
                      <div className="flex items-start">
                        <p className="font-bold mr-1">Fecha Estimada:</p>
                        <span>{formatDate(measure.estimated_date, "P")}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-center text-gray-400 dark:text-gray-500 py-8">
                No hay medidas asociadas a este plan de mitigación.
              </p>
            )}

            {measures.length > 0 && planId && (
              <div className="mt-6 flex justify-end">
                <Link
                  href={`/${selectedCompany?.slug}/sms/gestion_reportes/planes_de_mitigacion/${planId}/medidas`}
                  passHref
                >
                  <Button
                    variant="default"
                    size="sm"
                    className="transition-colors duration-200"
                  >
                    Ver todas las medidas
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Componente para mostrar el análisis de riesgo (responsive)
const RiskAnalysisCell = ({ analysis }: { analysis: any }) => {
  if (!analysis)
    return (
      <div className="text-center text-muted-foreground text-xs sm:text-sm">
        N/A
      </div>
    );

  const riskLevel = getResult(analysis.result);

  const badgeConfig = {
    INTOLERABLE: {
      className: "bg-red-600 hover:bg-red-500",
      label: "Intolerable",
    },
    TOLERABLE: {
      className: "bg-yellow-500 hover:bg-yellow-400",
      label: "Tolerable",
    },
    ACEPTABLE: {
      className: "bg-green-600 hover:bg-green-500",
      label: "Aceptable",
    },
  };

  const currentBadge = riskLevel ? badgeConfig[riskLevel] : null;

  return (
    <div className="space-y-1 sm:space-y-2 text-center">
      <div className="grid grid-cols-2 gap-1 text-xs sm:text-sm">
        <div className="rounded bg-muted p-1 truncate">Prob.</div>
        <div className="rounded bg-muted p-1 truncate">
          {analysis.probability}
        </div>
        <div className="rounded bg-muted p-1 truncate">Sev.</div>
        <div className="rounded bg-muted p-1 truncate">{analysis.severity}</div>
      </div>

      {currentBadge && (
        <Badge
          className={`${currentBadge.className} w-full justify-center text-xs sm:text-sm`}
        >
          {currentBadge.label}
        </Badge>
      )}
    </div>
  );
};

// Columnas de la tabla (responsive)
export const columns: ColumnDef<MitigationTable>[] = [
  {
    accessorKey: "report_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reporte" filter />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-bold">
          {row.original.obligatory_report &&
            "ROS - " + row.original.obligatory_report.report_number}
        </span>
        <span className="font-bold">
          {row.original.voluntary_report &&
            "RVP - " + row.original.voluntary_report.report_number}
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
    cell: ({ row }) => (
      <MeasuresCell
        measures={row.original.mitigation_plan?.measures || []}
        planId={row.original.mitigation_plan?.id}
      />
    ),
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
