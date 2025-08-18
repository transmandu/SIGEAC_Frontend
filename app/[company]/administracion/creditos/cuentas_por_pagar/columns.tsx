"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Credit } from "@/types";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale/es";
import CreditDropdownActions from "@/components/dropdowns/aerolinea/administracion/CreditDropdownActions";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

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
      {
        accessorKey: "vendor.name",
        header: ({ column }) => (
          <DataTableColumnHeader filter column={column} title="Proveedor" />
        ),
        meta: { title: "Proveedor" },
        cell: ({ row }) => (
            <div className="flex justify-center font-bold">
              {row.original.vendor.name}
            </div>
          ),
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
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id;
      return <CreditDropdownActions credit={row.original} />;
    },
  },
];
