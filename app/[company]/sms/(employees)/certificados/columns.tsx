"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// 1. Definimos el tipo de dato que esperamos (basado en tu modelo de Laravel)
export type CertificateColumn = {
  id: number;
  course: {
    name: string;
  };
  completion_date: string;
  document: string;
};

// 2. Creamos la configuración de las columnas
export const columns: ColumnDef<CertificateColumn>[] = [
  {
    accessorKey: "course.name", // Propiedad del objeto JSON
    header: "Curso / Capacitación",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-bold text-sm uppercase tracking-tight">
          {row.original.course?.name || "Sin Nombre"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "completion_date",
    header: "Fecha de Realización",
    cell: ({ row }) => {
      const date = row.getValue("completion_date") as string;
      return (
        <span className="text-muted-foreground italic">
          {date ? format(new Date(date), "dd 'de' MMMM, yyyy", { locale: es }) : "N/A"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Acciones</div>,
    cell: ({ row }) => {
      const docPath = row.original.document;

      // Función para abrir el archivo (Lógica que ya tenías)
      const handleView = () => {
        const encodedPath = btoa(docPath);
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/sms/certificates/serve/${encodedPath}`;
        window.open(url, "_blank");
      };

      return (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            className="hover:bg-blue-600 hover:text-white flex items-center gap-2 transition-all"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Ver Certificado</span>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </Button>
        </div>
      );
    },
  },
];