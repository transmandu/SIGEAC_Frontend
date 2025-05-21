"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Renting } from "@/types";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale/es";
import RentingDropdownActions from "@/components/misc/RentingDropdownActions";
import ClientResumeDialog from "@/components/dialogs/ClientResumeDialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export const columns: ColumnDef<Renting>[] = [
  {
    accessorKey: "start_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha inicio" />
    ),
    meta: { title: "Fecha inicio" },
    cell: ({ row }) => (
      <p>
        {format(addDays(row.original.start_date, 1), "PPP", { locale: es })}
      </p>
    ),
  },
  {
    accessorKey: "end_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha fin" />
    ),
    meta: { title: "Fecha fin" },
    cell: ({ row }) => {
      if (!row.original.end_date) return <p>No especificado</p>;
      return (
        <p>
          {format(addDays(row.original.end_date, 1), "PPP", { locale: es })}
        </p>
      );
    },
  },
  {
    accessorKey: "deadline",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Límite" />
    ),
    meta: { title: "Fecha Límite" },
    cell: ({ row }) => (
      <p>{format(addDays(row.original.deadline, 1), "PPP", { locale: es })}</p>
    ),
  },
//  {
//    accessorKey: "status",
//    header: ({ column }) => (
//      <DataTableColumnHeader filter column={column} title="Estado" />
//    ),
//    meta: { title: "Estado" },
//    cell: ({ row }) => {
//      const status = row.original.status;
//      const backgroundColor =
//        status === "EN PROCESO" ? "bg-yellow-500" : "bg-green-500";

//      return (
//        <div>
//          <div className="flex justify-center">
//            <Badge className={backgroundColor}>{row.original.status}</Badge>
//          </div>
//        </div>
//      );
//    },
//  },
  {
    accessorKey: "client.name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Cliente" />
    ),
    meta: { title: "Cliente" },
    cell: ({ row }) => <ClientResumeDialog client={row.original.client} />,
  },
  {
    accessorKey: "article.name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Artículo" />
    ),
    meta: { title: "Artículo" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.article
            ? `${row.original.article.name}-${row.original.article.serial}`
            : "N/A"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "aircraft.acronym",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Aeronave" />
    ),
    meta: { title: "Aeronave" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.aircraft
            ? `${row.original.aircraft.acronym}-${row.original.aircraft.serial}`
            : "N/A"}
        </span>
      </div>
    ),
  },
//  {
//    accessorKey: "type",
//    header: ({ column }) => (
//      <DataTableColumnHeader filter column={column} title="Tipo" />
//    ),
//    meta: { title: "Tipo" },
//    cell: ({ row }) => (
//      <div className="flex justify-center">
//        <span className="text-muted-foreground italic">
//          {row.original.type}
//        </span>
//      </div>
//    ),
//  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Precio" />
    ),
    meta: { title: "Precio" },
    cell: ({ row }) => {
      const isPayed = row.original.status === "CULMINADO";
      const badgeVariant = isPayed ? "default" : "destructive";
      const formattedAmount = formatCurrency(row.original.price);

      return (
        <div className="flex justify-center">
          <Badge
            className={
              isPayed
                ? "bg-green-700 hover:bg-green-700"
                : "bg-yellow-500 hover:bg-yellow-500"
            }
            variant={badgeVariant}
          >
            {formattedAmount}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "payed_amount",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Monto Pagado" />
    ),
    meta: { title: "Monto Pagado" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
        {formatCurrency(row.original.payed_amount)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Descripción" />
    ),
    meta: { title: "Descripción" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.description}
        </span>
      </div>
    ),
  },
//  {
//    accessorKey: "reference_pic",
//    header: ({ column }) => (
//      <DataTableColumnHeader filter column={column} title="Referencia" />
//    ),
//    meta: { title: "Referencia" },
//    cell: ({ row }) => {
//      const reference = row.original.reference_pic;
//      
//      if (!reference) {
//        return (
//          <div className="flex justify-center">
//            <span className="text-muted-foreground italic">N/A</span>
//          </div>
//        );
//      }
//  
//      // Caso imagen
//      if (reference.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
//        return (
//          <div className="flex justify-center">
//            <img 
//              src={reference} 
//              alt="Referencia" 
//              className="h-10 w-10 object-cover rounded"
//              onClick={() => window.open(reference, '_blank')}
//              style={{ cursor: 'pointer' }}
//            />
//          </div>
//        );
//      }
//  
//      // Caso PDF
//      if (reference.endsWith('.pdf')) {
//        return (
//          <div className="flex justify-center">
//            <a 
//              href={reference} 
//              target="_blank" 
//              rel="noopener noreferrer"
//              className="flex items-center text-red-500 hover:underline"
//            >
//              <FileDownIcon className="mr-1 h-4 w-4" />
//              Ver PDF
//            </a>
//          </div>
//        );
//      }
//  
//      // Caso enlace genérico
//      if (reference.startsWith('http')) {
//        return (
//          <div className="flex justify-center">
//            <a 
//              href={reference} 
//              target="_blank" 
//              rel="noopener noreferrer"
//              className="text-blue-500 hover:underline"
//            >
//              Ver referencia
//            </a>
//          </div>
//        );
//      }
//  
//      // Texto plano
//      return (
//        <div className="flex justify-center">
//          <span className="text-muted-foreground italic">
//            {reference}
//          </span>
//        </div>
//      );
//    },
//  },
  {
    id: "actions",
    cell: ({ row }) => <RentingDropdownActions rent={row.original} />,
  },
];
