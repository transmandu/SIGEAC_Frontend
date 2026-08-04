"use client";

import { BankAccountDropdownActions } from "@/components/dropdowns/ajustes/BancosPagosDropdownActions";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BankAccount } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";

export const columns: ColumnDef<BankAccount>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <span className="font-bold">{row.original.name ?? "N/A"}</span>
        {row.original.is_shared && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Users className="size-4 text-muted-foreground" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Compartida con otras compañías. No puede eliminarla.</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    ),
  },
  {
    accessorKey: "account_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro. de Cuenta" />
    ),
    meta: { title: "Nro. de Cuenta" },
    cell: ({ row }) => (
      <span className="font-medium flex justify-center italic">
        {row.original.account_number}
      </span>
    ),
  },
  {
    accessorKey: "bank",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Banco" />
    ),
    meta: { title: "Banco" },
    cell: ({ row }) => (
      <span className="text-muted-foreground flex justify-center italic">
        {row.original.bank?.name ?? "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "account_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    meta: { title: "Tipo" },
    cell: ({ row }) => (
      <span className="font-bold flex justify-center italic">
        {row.original.account_type}
      </span>
    ),
  },
  {
    accessorKey: "account_owner",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titular" />
    ),
    meta: { title: "Titular" },
    cell: ({ row }) => (
      <span className="font-bold flex justify-center italic">
        {row.original.account_owner}
      </span>
    ),
  },
  {
    accessorKey: "payment_methods",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Métodos de Pago" />
    ),
    meta: { title: "Métodos de Pago" },
    cell: ({ row }) => {
      const methods = row.original.payment_methods ?? [];
      return (
        <div className="flex flex-wrap justify-center gap-1">
          {methods.length === 0 && (
            <span className="text-xs text-muted-foreground italic">
              Sin métodos
            </span>
          )}
          {methods.map((method) => (
            <Badge key={method.id} variant="secondary" className="text-[10px]">
              {method.name}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "bank_cards",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tarjetas" />
    ),
    meta: { title: "Tarjetas" },
    cell: ({ row }) => {
      const cards = row.original.bank_cards ?? [];
      return (
        <span className="flex justify-center text-muted-foreground italic">
          {cards.length === 0 ? "Ninguna" : cards.length}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <BankAccountDropdownActions account={row.original} />
      </div>
    ),
  },
];
