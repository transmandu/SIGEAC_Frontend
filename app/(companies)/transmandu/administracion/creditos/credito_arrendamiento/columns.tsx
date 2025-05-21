"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Credit } from "@/types";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale/es";
import CreditDropdownActions from "@/components/misc/CreditDropdownActions";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import ClientResumeDialog from "@/components/dialogs/ClientResumeDialog";

export const columns: ColumnDef<Credit>[] = [
  {
    accessorKey: "opening_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Apertura" />
    ),
    meta: { title: "Fecha Apertura" },
    cell: ({ row }) => {
      return (
        <p>
          {format(addDays(row.original.opening_date, 1), "PPP", {
            locale: es,
          })}
        </p>
      );
    },
  },
  {
    accessorKey: "closing_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Cierre" />
    ),
    meta: { title: "Fecha Cierre" },
    cell: ({ row }) => {
      if (!row.original.closing_date) return <p>No especificado</p>;
      return (
        <p>
          {format(addDays(row.original.closing_date, 1), "PPP", { locale: es })}
        </p>
      );
    },
  },
  {
    accessorKey: "deadline",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Limite" />
    ),
    meta: { title: "Fecha Limite" },
    cell: ({ row }) => {
      return (
        <p>
          {format(addDays(row.original.deadline, 1), "PPP", {
            locale: es,
          })}
        </p>
      );
    },
  },
  //  {
  //    accessorKey: "renting.description",
  //    header: ({ column }) => (
  //      <DataTableColumnHeader
  //        filter
  //        column={column}
  //        title="Descripción de Renta"
  //      />
  //    ),
  //    meta: { title: "Descripción de Renta" },
  //    cell: ({ row }) => (
  //      <div className="flex justify-center font-bold">
  //        {row.original.renting ? row.original.renting.description : "N/A"}
  //      </div>
  //    ),
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
    accessorKey: "details",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Detalles" />
    ),
    meta: { title: "Detalles" },
    cell: ({ row }) => (
      <div className="flex justify-center font-bold">
        {row.original.details}
      </div>
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
  //        status === "PENDIENTE" ? "bg-yellow-500" : "bg-green-500";

  //      return (
  //        <div>
  //          <div className="flex justify-center">
  //            <Badge className={backgroundColor}>
  //              {row.original.status}
  //            </Badge>
  //          </div>
  //        </div>
  //      );
  //    },
  //  },
  {
    accessorKey: "debt",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Deuda" />
    ),
    meta: { title: "Deuda" },
    cell: ({ row }) => {
      const isPayed = row.original.status === "PAGADO";
      const badgeVariant = isPayed ? "default" : "destructive";
      const formattedAmount = formatCurrency(row.original.debt);

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
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id;
      return <CreditDropdownActions credit={row.original} />;
    },
  },
];
