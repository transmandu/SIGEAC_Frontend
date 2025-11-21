"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

import { ResponsesBySurvey } from "@/hooks/sms/survey/useGetResponsesBySurvey";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<ResponsesBySurvey>[] = [
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
        <div className="flex justify-center">{row.original.survey_number}</div>
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
    accessorKey: "survey_type",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      const type = row.original.survey_type;

      const displayText =
        type === "SURVEY" ? "Encuesta" : type === "QUIZ" ? "Trivia" : "N/A";

      return <p className="font-medium text-center">{displayText}</p>;
    },
  },
  {
    accessorKey: "questions_answered",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Respuestas" />
    ),
    meta: { title: "Numero de Respuestas" },
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <Badge className="bg-blue-500">{row.original.questions_answered}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Usuario" />
    ),
    cell: ({ row }) => {
      //const { selectedCompany } = useCompanyStore();
      return (
        <div className="flex justify-center">
          <a
            href={`/transmandu/sms/gestion_encuestas/${row.original.survey_number}/resultados/${row.original.email}`}
            className="font-bold hover:scale-105 hover:no-underline transition-colors duration-200 cursor-pointer"
          >
            {row.original.email}
          </a>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      // const surveyData = row.original;
      // return (
      //   <SurveyDropdownActions surveyData={surveyData}></SurveyDropdownActions>
      // );
    },
  },
];
