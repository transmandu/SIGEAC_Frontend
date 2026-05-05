"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Importamos tu nuevo componente de acciones
import CertificatesDropDownActions from "@/components/dropdowns/aerolinea/sms/CertificatesDropDownActions";

export type CertificateColumn = {
  id: number;
  course: { 
    name: string; 
    start_date?: string; 
    end_date?: string; 
  };
  employee?: { first_name: string; last_name: string; dni: string; photo_url?: string };
  completion_date: string; 
  document: string;
};

// --- HEMOS ELIMINADO EL ANTIGUO ActionsCell DE AQUÍ PARA LIMPIAR EL CÓDIGO ---

export const getColumns = (companySlug: string): ColumnDef<CertificateColumn>[] => [
  {
    id: "employee",
    accessorFn: (row) => `${row.employee?.first_name} ${row.employee?.last_name} ${row.employee?.dni}`,
    header: "Empleado / DNI",
    cell: ({ row }) => {
      const emp = row.original.employee;
      return emp ? (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-blue-200 shadow-sm">
            <AvatarImage 
              src={emp?.photo_url ? `${emp.photo_url}?size=64` : ""} 
              alt="Avatar" 
              className="object-cover"
            />
            <AvatarFallback className="bg-blue-500 text-white font-bold text-xs">
              {emp?.first_name?.[0]}{emp?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-sm uppercase text-foreground leading-tight">
              {`${emp.last_name}, ${emp.first_name}`}
            </span>
            <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-sm w-fit mt-1 border border-blue-200 dark:border-blue-900/30">
              {emp.dni}
            </span>
          </div>
        </div>
      ) : null;
    },
  },
  {
    accessorKey: "course.name",
    header: "Curso",
    cell: ({ row }) => (
      <span className="font-semibold text-sm uppercase text-blue-700 dark:text-blue-400">
        {row.original.course?.name || "Sin Nombre"}
      </span>
    ),
  },
  {
    id: "course_dates",
    header: "Inicio / Culminación",
    cell: ({ row }) => {
      const start = row.original.course?.start_date;
      const end = row.original.course?.end_date;

      const formatUTCDate = (dateString: string | undefined) => {
        if (!dateString) return "---";
        const date = new Date(dateString + 'T00:00:00');
        return format(date, "dd/MM/yyyy", { locale: es });
      };

      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-bold text-green-600 dark:text-green-500 uppercase w-10">Desde:</span>
            <span className="font-medium text-foreground">
              {formatUTCDate(start)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-bold text-red-600 dark:text-red-500 uppercase w-10">Hasta:</span>
            <span className="font-medium text-foreground">
              {formatUTCDate(end)}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "completion_date",
    header: "Fecha de Carga",
    cell: ({ row }) => {
      const date = row.getValue("completion_date") as string;
      const dateObj = date ? new Date(date + 'T00:00:00') : null;
      
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 opacity-70" />
          <span className="text-sm font-medium">
            {dateObj ? format(dateObj, "dd/MM/yyyy", { locale: es }) : "N/A"}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right px-4">Acciones</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <CertificatesDropDownActions 
          certificate={row.original} 
          companySlug={companySlug} 
        />
      </div>
    ),
  },
];