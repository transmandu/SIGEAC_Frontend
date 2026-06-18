"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { UniformMovement } from "@/hooks/sms/useGetUniforms";
import {
  getUniformTypeIcon,
  MOVEMENT_TYPE_META,
} from "@/components/sms/uniform-meta";

const formatDate = (value?: string) => {
  if (!value) return "---";
  const date = new Date(value.slice(0, 10) + "T00:00:00");
  return format(date, "dd/MM/yyyy", { locale: es });
};

export const movementsColumns: ColumnDef<UniformMovement>[] = [
  {
    accessorKey: "date",
    header: "Fecha",
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.date)}</span>
    ),
  },
  {
    id: "item",
    accessorFn: (row) =>
      row.item
        ? `${row.item.type_label} ${row.item.size} ${row.item.company_label}`
        : "",
    header: "Artículo",
    cell: ({ row }) => {
      const item = row.original.item;
      if (!item) return <span className="text-muted-foreground">---</span>;
      const Icon = getUniformTypeIcon(item.uniform_type, item.type_label);
      return (
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold uppercase">
              {item.type_label} · {item.size}
            </span>
            <span className="text-xs uppercase text-muted-foreground">
              {item.company_label}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "movement_type_label",
    header: "Movimiento",
    cell: ({ row }) => {
      const meta = MOVEMENT_TYPE_META[row.original.movement_type];
      const Icon = meta?.Icon;
      return (
        <Badge
          className={`flex w-fit items-center gap-1 ${meta?.badgeClass ?? ""}`}
        >
          {Icon && <Icon className="size-3" />}
          {row.original.movement_type_label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Cantidad",
    cell: ({ row }) => {
      const qty = row.original.quantity;
      return (
        <span
          className={`font-bold tabular-nums ${
            qty < 0 ? "text-destructive" : "text-emerald-600"
          }`}
        >
          {qty > 0 ? `+${qty}` : qty}
        </span>
      );
    },
  },
  {
    accessorKey: "recipient_name",
    header: "Receptor",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.recipient_name || "---"}</span>
    ),
  },
  {
    accessorKey: "notes",
    header: "Notas",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.notes || "---"}
      </span>
    ),
  },
  {
    accessorKey: "registered_by",
    header: "Registrado por",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.registered_by || "---"}
      </span>
    ),
  },
];
