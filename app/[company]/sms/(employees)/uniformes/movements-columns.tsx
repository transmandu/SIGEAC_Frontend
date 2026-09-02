"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { UniformMovement } from "@/hooks/sms/useGetUniforms";
import {
  uniformCompanyLabel,
  uniformGenderLabel,
  uniformMovementTypeLabel,
} from "@/lib/sms/uniforms";
import {
  getUniformTypeIcon,
  MOVEMENT_TYPE_META,
} from "@/components/sms/uniform-meta";
import { formatCalendarDate } from "@/lib/date";

const formatDate = (value?: string) => formatCalendarDate(value, "date", "---");

const employeeFullName = (
  emp: NonNullable<UniformMovement["employee"]>
) =>
  [emp.first_name, emp.middle_name, emp.last_name, emp.second_last_name]
    .filter(Boolean)
    .join(" ");

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
        ? `${row.item.type_label} ${row.item.size} ${uniformCompanyLabel(row.item.company)}`
        : "",
    header: "Artículo",
    cell: ({ row }) => {
      const item = row.original.item;
      if (!item) return <span className="text-muted-foreground">---</span>;
      const Icon = getUniformTypeIcon(undefined, item.type_label);
      return (
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold uppercase">
              {item.type_label}
              {item.brand_label ? ` · ${item.brand_label}` : ""} · {item.size}
            </span>
            <span className="text-xs uppercase text-muted-foreground">
              {uniformCompanyLabel(item.company)}
              {uniformGenderLabel(item.gender)
                ? ` · ${uniformGenderLabel(item.gender)}`
                : ""}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "movement_type",
    header: "Movimiento",
    cell: ({ row }) => {
      const meta = MOVEMENT_TYPE_META[row.original.movement_type];
      const Icon = meta?.Icon;
      return (
        <Badge
          className={`flex w-fit items-center gap-1 ${meta?.badgeClass ?? ""}`}
        >
          {Icon && <Icon className="size-3" />}
          {uniformMovementTypeLabel(row.original.movement_type)}
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
    id: "recipient",
    header: "Receptor",
    cell: ({ row }) => {
      const movement = row.original;

      if (movement.employee) {
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {employeeFullName(movement.employee)}
            </span>
            <span className="text-xs text-muted-foreground">
              DNI: {movement.employee.dni}
            </span>
          </div>
        );
      }

      if (movement.recipient_name) {
        return (
          <div className="flex flex-col">
            <span className="text-sm">{movement.recipient_name}</span>
            {movement.recipient_dni && (
              <span className="text-xs text-muted-foreground">
                DNI: {movement.recipient_dni}
              </span>
            )}
          </div>
        );
      }

      return <span className="text-sm text-muted-foreground">---</span>;
    },
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
