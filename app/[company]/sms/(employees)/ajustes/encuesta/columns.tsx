"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

import SurveySettingDropdownActions from "@/components/dropdowns/aerolinea/sms/survey/surveySettingDropDownActions";
import { Badge } from "@/components/ui/badge";
import { Survey } from "@/types";
import { useCompanyStore } from "@/stores/CompanyStore";
import Link from "next/link";

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
      return <SurveyNumberCell surveyNumber={row.original.survey_number} />;
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
    accessorKey: "setting",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Configuración" />
    ),
    cell: ({ row }) => {
      const setting = row.original.setting;

      return (
        <div className="flex justify-center">
          {setting ? (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 pointer-events-none"
            >
              {setting}
            </Badge>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </div>
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
          variant="secondary"
        >
          {row.original.is_active ? (
            <span className="text-white">ACTIVO</span>
          ) : (
            <span className="text-white">INACTIVO</span> // ← Esto se muestra cuando es false
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
        <SurveySettingDropdownActions
          surveyData={surveyData}
        ></SurveySettingDropdownActions>
      );
    },
  },
];
