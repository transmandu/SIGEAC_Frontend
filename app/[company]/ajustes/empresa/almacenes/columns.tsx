"use client";

import WarehouseDropdownActions from "@/components/dropdowns/ajustes/WarehouseDropdownActions";
import { TagBadge } from "@/components/misc/TagBadge";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { locationLabel } from "@/lib/locations";
import { type AppColumnDef } from "@/lib/table";
import { Warehouse } from "@/types";

const center = "flex w-full justify-center";

const TYPE_LABELS: Record<string, string> = {
  AERONAUTICAL: "Aeronáutico",
  GENERAL: "General",
};

export const warehouseTypeLabel = (type?: string | null) =>
  type ? (TYPE_LABELS[type.toUpperCase()] ?? type) : "";

export const columns: AppColumnDef<Warehouse>[] = [
  {
    accessorKey: "name",
    size: 240,
    meta: { title: "Almacén", mobileTitle: true },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader filter column={column} title="Almacén" />
      </div>
    ),
    cell: ({ row }) => (
      <div className={center}>
        <span className="text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
          {row.original.name ?? "—"}
        </span>
      </div>
    ),
  },
  {
    id: "location",
    size: 300,
    accessorFn: (warehouse) => locationLabel(warehouse.location),
    meta: { title: "Ubicación" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader filter column={column} title="Ubicación" />
      </div>
    ),
    cell: ({ row }) => (
      <div className={center}>
        <span className="text-center text-sm text-slate-600 dark:text-slate-300">
          {locationLabel(row.original.location) || "—"}
        </span>
      </div>
    ),
  },
  {
    id: "type",
    size: 150,
    accessorFn: (warehouse) => warehouseTypeLabel(warehouse.type),
    meta: { title: "Tipo" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader filter column={column} title="Tipo" />
      </div>
    ),
    cell: ({ row }) => {
      const type = row.original.type?.toUpperCase();

      return (
        <div className={center}>
          {type ? (
            <TagBadge tone={type === "GENERAL" ? "slate" : "sky"}>
              {warehouseTypeLabel(type)}
            </TagBadge>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "records_count",
    size: 130,
    meta: { title: "Registros" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader column={column} title="Registros" />
      </div>
    ),
    cell: ({ row }) => {
      const count = row.original.records_count ?? 0;

      return (
        <div className={center}>
          <span
            className={
              count > 0
                ? "text-sm text-slate-700 tabular-nums dark:text-slate-200"
                : "text-sm text-muted-foreground tabular-nums"
            }
          >
            {count}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    size: 100,
    enableSorting: false,
    enableHiding: false,
    meta: { title: "Acciones" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),
    cell: ({ row }) => (
      <div className={center}>
        <WarehouseDropdownActions warehouse={row.original} />
      </div>
    ),
  },
];
