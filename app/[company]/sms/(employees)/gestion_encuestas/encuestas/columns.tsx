"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

import SurveyDropdownActions from "@/components/dropdowns/aerolinea/sms/survey/surveyDropDownActions";
import { Badge } from "@/components/ui/badge";
import { Survey } from "@/types";
import Link from "next/link";
import { useCompanyStore } from "@/stores/CompanyStore";

const SurveyNumberCell = ({ surveyNumber }: { surveyNumber: string }) => {
  const { selectedCompany } = useCompanyStore();

  return (
    <div className="flex justify-center items-center gap-2">
      {selectedCompany && (
        <Link
          href={`/${selectedCompany.slug}/sms/gestion_encuestas/${surveyNumber}`}
          className="ml-2 font-bold hover:scale-105 transition-all cursor-pointer"
        >
           {surveyNumber}
        </Link>
      )}
    </div>
  );
};


export const columns: ColumnDef<Survey>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Seleccionar todos"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Seleccionar fila"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "survey_number",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Numero de Encuesta"
      />
    ),
    meta: { title: "Numero de Encuesta" },
    cell: ({ row }) => {
      return (
        <SurveyNumberCell surveyNumber={row.original.survey_number} />
      );
    },
  },
  // {
  //   accessorKey: "report_date",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader filter column={column} title="Fecha del reporte" />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <p className="font-medium text-center">
  //         {row.original.report_date
  //           ? dateFormat(row.original.report_date, "PPP")
  //           : "N/A"}
  //       </p>
  //     );
  //   },
  // },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      return <p className="font-medium text-center">{row.original.title}</p>;
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">
          {row.original.description ?? "N/A"}
        </p>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge
          className={`justify-center items-center text-center font-bold font-sans pointer-events-none hover:bg-inherit
      ${
        row.original.is_active === true
          ? "bg-green-500 hover:bg-green-400"
          : row.original.is_active === false
            ? "bg-red-400 hover:bg-red-400"
            : "bg-gray-500 hover:bg-gray-500"
      }`}
        >
          {row.original.is_active ? (
            <span>ACTIVO</span>
          ) : (
            <span>INACTIVO</span> // ← Esto se muestra cuando es false
          )}
        </Badge>
      </div>
    ),
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const surveyData = row.original;
      return (
        <SurveyDropdownActions surveyData={surveyData}></SurveyDropdownActions>
      );
    },
  },
];
