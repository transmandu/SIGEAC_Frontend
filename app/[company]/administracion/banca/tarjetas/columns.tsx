"use client";

import { BankCardDropdownActions } from "@/components/dropdowns/ajustes/BancosPagosDropdownActions";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BankCard } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";

export const columns: ColumnDef<BankCard>[] = [
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
    accessorKey: "card_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro. de Tarjeta" />
    ),
    meta: { title: "Nro. de Tarjeta" },
    cell: ({ row }) => (
      <span className="font-medium flex justify-center italic">
        {row.original.card_number}
      </span>
    ),
  },
  {
    accessorKey: "payment_method",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    meta: { title: "Tipo" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.original.payment_method ? (
          <Badge variant="secondary" className="text-[10px]">
            {row.original.payment_method.name}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground italic">N/A</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "bank_account",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cuenta" />
    ),
    meta: { title: "Cuenta" },
    cell: ({ row }) => (
      <span className="text-muted-foreground flex justify-center italic">
        {row.original.bank_account?.name ?? "N/A"}
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
        {row.original.bank_account?.bank?.name ?? "N/A"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <BankCardDropdownActions bankCard={row.original} />
      </div>
    ),
  },
];
