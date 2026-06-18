"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, CircleSlash } from "lucide-react";
import { UniformItem } from "@/hooks/sms/useGetUniforms";
import { getUniformTypeIcon } from "@/components/sms/uniform-meta";
import { InventoryRowActions } from "./row-actions";

interface ColumnHandlers {
  onEdit: (item: UniformItem) => void;
  onRegisterMovement: (item: UniformItem) => void;
}

export const getInventoryColumns = (
  handlers: ColumnHandlers
): ColumnDef<UniformItem>[] => [
  {
    accessorKey: "type_label",
    header: "Tipo",
    cell: ({ row }) => {
      const Icon = getUniformTypeIcon(
        row.original.uniform_type,
        row.original.type_label
      );
      return (
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <span className="font-semibold uppercase text-foreground">
            {row.original.type_label}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "size",
    header: "Talla",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono text-xs">
        {row.original.size}
      </Badge>
    ),
  },
  {
    accessorKey: "company_label",
    header: "Empresa",
    cell: ({ row }) => (
      <span className="text-sm uppercase text-muted-foreground">
        {row.original.company_label}
      </span>
    ),
  },
  {
    accessorKey: "current_stock",
    header: "Stock",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-base font-bold tabular-nums",
              item.is_low_stock
                ? "text-destructive"
                : "text-foreground"
            )}
          >
            {item.current_stock}
          </span>
          {item.is_low_stock && (
            <Badge variant="destructive" className="gap-1 text-[10px]">
              <AlertTriangle className="size-3" />
              Bajo stock
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "min_stock",
    header: "Stock mínimo",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-muted-foreground">
        ≥ {row.original.min_stock}
      </span>
    ),
  },
  {
    accessorKey: "active",
    header: "Estado",
    cell: ({ row }) =>
      row.original.active ? (
        <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-600">
          <CheckCircle2 className="size-3" />
          Activo
        </Badge>
      ) : (
        <Badge variant="secondary" className="gap-1 text-muted-foreground">
          <CircleSlash className="size-3" />
          Inactivo
        </Badge>
      ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <InventoryRowActions
        item={row.original}
        onEdit={handlers.onEdit}
        onRegisterMovement={handlers.onRegisterMovement}
      />
    ),
  },
];
