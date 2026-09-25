"use client";

import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { AvailabilityBadge } from "@/components/tables/GeneralArticleConsultaColumns";
import { Badge } from "@/components/ui/badge";
import { addDays, format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { toolStatusLabelEsUpper } from "@/lib/warehouse/statuses";
import { formatCondition } from "@/lib/warehouse/conditions";
import type { CompanyInventoryArticle } from "@/types/inventory";
import type { InventoryCategory } from "@/hooks/mantenimiento/almacen/inventario/useWarehouseInventoryArticles";

// "YYYY-MM-DD" sin hora se lee como fecha local: parseISO la tomaría en UTC y
// podría mostrar el día anterior.
const parseDateLocal = (dateString: string): Date => {
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return parseISO(dateString);
};

const baseCols: AppColumnDef<CompanyInventoryArticle>[] = [
  {
    accessorKey: "part_number",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Part Number" />
    ),
    cell: ({ row }) => (
      <div className="font-bold text-center text-base">
        {row.original.part_number}
      </div>
    ),
  },
  {
    accessorKey: "alternative_part_number",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Alt. Part Number" />
    ),
    cell: ({ row }) => (
      <div className="font-bold text-center text-base">
        {row.original.alternative_part_number.length > 0
          ? row.original.alternative_part_number.join("/ ")
          : "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "serial",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Serial / Lote" />
    ),
    cell: ({ row }) => {
      const { serial, lot_number, serial_count } = row.original;

      return (
        <div className="text-center text-sm font-medium">
          {serial_count > 1 ? (
            `${serial_count} seriales`
          ) : serial || lot_number ? (
            serial || lot_number
          ) : (
            <span className="text-muted-foreground italic">N/A</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground font-bold text-center max-w-xs mx-auto line-clamp-2">
        {row.original.description || "Sin descripción"}
      </div>
    ),
  },
  {
    accessorKey: "condition",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Condición" />
    ),
    cell: ({ row }) => {
      const toolStatus = row.original.tool?.status;
      const c = formatCondition(row.original.condition);

      return (
        <div className="flex flex-col justify-center items-center space-y-2">
          <div className="text-center leading-tight">
            {c ? (
              <>
                <span className="font-bold text-foreground">{c.es}</span>{" "}
                <span className="text-xs text-muted-foreground italic">
                  ({c.en})
                </span>
              </>
            ) : (
              <span className="text-muted-foreground font-bold">
                SIN CONDICIÓN
              </span>
            )}
          </div>
          {row.original.tool && (
            <Badge
              className={cn(
                "text-xs text-center",
                toolStatus === "CALIBRATED"
                  ? "bg-green-500"
                  : toolStatus === "IN_CALIBRATION"
                    ? "bg-yellow-500"
                    : toolStatus === "EXPIRED"
                      ? "bg-red-500"
                      : "",
              )}
            >
              {toolStatus ? toolStatusLabelEsUpper(toolStatus) : "SIN ESTADO"}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "availability",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Disponibilidad" />
    ),
    cell: ({ row }) => (
      <AvailabilityBadge
        quantity={row.original.available_quantity}
        unit={row.original.unit?.value ?? row.original.unit?.label}
      />
    ),
  },
];

const toolCols: AppColumnDef<CompanyInventoryArticle>[] = [
  ...baseCols,
  {
    id: "calibration_date",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fech. Calibración" />
    ),
    cell: ({ row }) => (
      <div className="text-center text-sm font-bold text-muted-foreground">
        {row.original.tool?.calibration_date
          ? format(
              parseDateLocal(row.original.tool.calibration_date),
              "dd/MM/yyyy",
            )
          : "N/A"}
      </div>
    ),
  },
  {
    id: "next_calibration",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prox. Cal." />
    ),
    cell: ({ row }) => {
      const tool = row.original.tool;

      return (
        <div className="text-center text-sm font-bold text-muted-foreground">
          {tool?.next_calibration && tool.calibration_date
            ? format(
                addDays(
                  parseDateLocal(tool.calibration_date),
                  Number(tool.next_calibration),
                ),
                "dd/MM/yyyy",
              )
            : "N/A"}
        </div>
      );
    },
  },
];

export const getColumnsByCategory = (
  category: InventoryCategory,
): AppColumnDef<CompanyInventoryArticle>[] =>
  category === "TOOL" ? toolCols : baseCols;
