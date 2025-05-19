"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import MitigationTableDropdownActions from "@/components/misc/MitigationTableDropdownActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MitigationMeasure, MitigationTable } from "@/types";
import Link from "next/link";
import { useTheme } from "next-themes";

// Componente para las celdas de medidas (contiene el hook useTheme)
const MeasuresCell = ({
  measures,
  planId,
}: {
  measures: MitigationMeasure[];
  planId?: string | number;
}) => {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col justify-center">
      {measures ? (
        <Dialog>
          <DialogTrigger className="flex justify-center items-center rounded-full">
            <Badge className={"bg-blue-600 "}>Medidas creadas</Badge>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogDescription
                className={`font-semibold ${
                  theme === "light" ? "text-black" : "text-white"
                }`}
              >
                Medidas de Mitigación
              </DialogDescription>
            </DialogHeader>

            <div className="border rounded-lg p-4 shadow-md">
              {measures.length > 0 ? (
                <ul>
                  {measures.map((measure: any, index: number) => (
                    <li key={measure.id} className="mb-2">
                      <span className="font-semibold"> {++index} ) </span>
                      <span>{measure.description}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-left">
                  No hay medidas asociadas a este plan de mitigacion
                </p>
              )}
            </div>

            {measures.length > 0 && planId && (
              <Link
                href={`/transmandu/sms/planes_de_mitigacion/${planId}/medidas`}
              >
                <div className="flex justify-end mt-4">
                  <Button className="w-1/3">Ver mas</Button>
                </div>
              </Link>
            )}
          </DialogContent>
        </Dialog>
      ) : (
        <p className="text-center">N/A</p>
      )}
    </div>
  );
};

// Función helper para determinar el resultado (fuera del componente)
function getResult(index: string) {
  const INTOLERABLE: string[] = ["5A", "5B", "5C", "4A", "4B", "3A"];
  const TOLERABLE: string[] = [
    "5D",
    "5E",
    "4C",
    "4D",
    "4E",
    "3B",
    "3C",
    "3D",
    "2A",
    "2B",
    "2C",
  ];
  const ACCEPTABLE: string[] = ["3E", "2D", "2E", "1A", "1B", "1C", "1D", "1E"];

  if (INTOLERABLE.includes(index)) return "INTOLERABLE";
  if (TOLERABLE.includes(index)) return "TOLERABLE";
  if (ACCEPTABLE.includes(index)) return "ACEPTABLE";
  return undefined;
}

// Componente para mostrar el análisis de riesgo
const RiskAnalysisCell = ({ analysis }: { analysis: any }) => {
  return (
    <div className="flex flex-col justify-center text-center">
      {analysis ? (
        <>
          <hr />
          <p>Probabilidad: {analysis.probability}</p>
          <hr />
          <p>Severidad: {analysis.severity}</p>
          <hr />
          <p>Resultado: {analysis.result}</p>
          {(() => {
            const riskIndex = getResult(analysis.result);
            if (riskIndex === "TOLERABLE") {
              return (
                <div className="flex justify-center">
                  <Badge className={"bg-yellow-500"}>Tolerable</Badge>
                </div>
              );
            } else if (riskIndex === "INTOLERABLE") {
              return (
                <div className="flex justify-center">
                  <Badge className={"bg-red-600"}>Intolerable</Badge>
                </div>
              );
            } else if (riskIndex === "ACEPTABLE") {
              return (
                <div className="flex justify-center">
                  <Badge className={"bg-green-600"}>Aceptable</Badge>
                </div>
              );
            }
            return null;
          })()}
        </>
      ) : null}
    </div>
  );
};

// Columnas de la tabla
export const columns: ColumnDef<MitigationTable>[] = [
  {
    accessorKey: "analysis",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Analisis" />
    ),
    meta: { title: "Analisis" },
    cell: ({ row }) => <RiskAnalysisCell analysis={row.original.analysis} />,
  },
  {
    accessorKey: "mitigation_plan",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Consecuencia a Evaluar"
      />
    ),
    meta: { title: "Consecuencia a Evaluar" },
    cell: ({ row }) => (
      <div className="flex justify-center text-center">
        {row.original.consequence_to_evaluate ?? "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripcion del Plan" />
    ),
    meta: { title: "Descripcion" },
    cell: ({ row }) => (
      <p className="font-medium text-center">
        {row.original.mitigation_plan?.description ?? "N/A"}
      </p>
    ),
  },
  {
    accessorKey: "measures",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agregar Medidas" />
    ),
    cell: ({ row }) => (
      <MeasuresCell
        measures={row.original.mitigation_plan?.measures || []}
        planId={row.original.mitigation_plan?.id}
      />
    ),
  },
  {
    accessorKey: "mitigation_plan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Post-Mitigacion" />
    ),
    cell: ({ row }) => (
      <RiskAnalysisCell analysis={row.original.mitigation_plan?.analysis} />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <MitigationTableDropdownActions mitigationTable={row.original} />
    ),
  },
];
