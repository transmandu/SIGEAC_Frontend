"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { CashMovement } from "@/types";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale/es";
import CashMovementDropdownActions from "@/components/misc/CashMovementDropdownActions";
import BankAccountResumeDialog from "@/components/dialogs/BankAccountResumeDialog";
import CashResumeDialog from "@/components/dialogs/CashResumeDialog";
import { formatCurrencyJ } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import ClientResumeDialog from "@/components/dialogs/ClientResumeDialog";
import VendorResumeDialog from "@/components/dialogs/VendorResumeDialog";

export const columns: ColumnDef<CashMovement>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    meta: { title: "Fecha" },
    cell: ({ row }) => {
      return (
        <p>
          {format(addDays(row.original.date, 1), "PPP", {
            locale: es,
          })}
        </p>
      );
    },
  },
  {
    accessorKey: "client.name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Cliente" />
    ),
    meta: { title: "Cliente" },
    cell: ({ row }) => (
      row.original.client ? 
        <ClientResumeDialog client={row.original.client} /> :
        <span>N/A</span>
    ), 

  },
  {
    accessorKey: "vendor.name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Proveedor" />
    ),
    meta: { title: "Proveedor" },
    cell: ({ row }) => (
      row.original.vendor ? 
        <VendorResumeDialog vendor={row.original.vendor} /> :
        <span>N/A</span>
    ), 
  },
  {
    accessorKey: "cash.name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Caja" />
    ),
    meta: { title: "Caja" },
    cell: ({ row }) => <CashResumeDialog cash={row.original.cash} />,
  },
  {
    accessorKey: "accountant.name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Cuenta" />
    ),
    meta: { title: "Cuenta" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.accountant.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "category_id",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Categoría" />
    ),
    meta: { title: "Categoría" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.category.name}
        </span>
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
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.details}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Monto" />
    ),
    meta: { title: "Monto" },
    cell: ({ row }) => {
      const isIncome = row.original.type === "INCOME";
      const badgeVariant = isIncome ? "default" : "destructive";
      const formattedAmount = formatCurrencyJ(
        row.original.total_amount,
        row.original.cash.coin
      );

      return (
        <div className="flex justify-center">
          <Badge
            className={
              isIncome
                ? "bg-green-700 hover:bg-green-700"
                : "bg-red-700 hover:bg-red-700"
            }
            variant={badgeVariant}
          >
            {formattedAmount}
          </Badge>
        </div>
      );
    },
  },
  //  {
  //    accessorKey: "employee_responsible.first_name",
  //    header: ({ column }) => (
  //      <DataTableColumnHeader filter column={column} title="Responsable" />
  //    ),
  //    meta: { title: "Responsable" },
  //    cell: ({ row }) => (
  //      <ResponsibleResumeDialog id={row.original.employee_responsible.id.toString()} />
  //    ),
  //  },
  {
    accessorKey: "bank_account.name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Cuenta de Banco" />
    ),
    meta: { title: "Cuenta de Banco" },
    cell: ({ row }) => {
      if (row.original.bank_account) {
        return (
          <BankAccountResumeDialog
            id={row.original.bank_account.id.toString()}
          />
        );
      } else {
        return (
          <p className="text-center italic font-medium cursor-pointer">
            Efectivo
          </p>
        );
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <CashMovementDropdownActions
          movement={row.original}
          id={row.original.id.toString()}
        />
      );
    },
  },
];
