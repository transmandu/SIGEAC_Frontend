"use client";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { type AppColumnDef } from "@/lib/table";
import { formatQuantity } from "@/lib/utils";
import type { CheckingArticle } from "@/types/inventory";
import { addDays, format, parseISO } from "date-fns";
import CheckingArticleDropdownActions from "./_components/CheckingArticleDropdownActionts";

export type IArticleSimple = CheckingArticle;

const baseCols: AppColumnDef<IArticleSimple>[] = [
  {
    accessorKey: "part_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Part Number" />
    ),
    cell: ({ row }) => (
      <div className="font-bold text-center text-base">
        {row.original.part_number}
      </div>
    ),
  },
  // {
  //   accessorKey: 'alternative_part_number',
  //   header: ({ column }) => <DataTableColumnHeader column={column} title="Alt. Part Number" />,
  //   cell: ({ row }) => (
  //     <div className="font-bold text-center text-base">
  //       {row.original.alternative_part_number && row.original.alternative_part_number.length > 0
  //         ? row.original.alternative_part_number.join('/ ')
  //         : 'N/A'}
  //     </div>
  //   ),
  // },
  {
    accessorKey: "serial",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Serial / Lote" />
    ),
    cell: ({ row }) => (
      <div className="text-center text-sm font-medium">
        {row.original.serial ? (
          row.original.serial
        ) : row.original.lot_number ? (
          row.original.lot_number
        ) : (
          <span className="text-muted-foreground italic">N/A</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "batch_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground font-bold text-center max-w-xs mx-auto line-clamp-2">
        {row.original.batch_name || "Sin descripción"}
      </div>
    ),
  },
  {
    id: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad" />
    ),
    cell: ({ row }) => {
      const q = Number(row.original.quantity ?? 0);
      const unit = row.original.unit?.value ?? row.original.unit?.label ?? "u";

      return (
        <div className="flex justify-center">
          <Badge
            variant={q > 0 ? "default" : "destructive"}
            className="text-sm font-bold px-3 py-1 tabular-nums whitespace-nowrap"
          >
            {`${formatQuantity(q)} ${unit}`}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col justify-center items-center space-y-2">
        <Badge className="bg-yellow-500">
          {row.original.status?.toUpperCase()}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "zone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ubicación" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium text-sm">
        {row.original.zone || (
          <span className="text-muted-foreground">Sin asignar</span>
        )}
      </div>
    ),
  },
];

const selectionColumn: AppColumnDef<IArticleSimple> = {
  id: "select",
  header: ({ table }) => (
    <div className="flex justify-center">
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todos"
      />
    </div>
  ),
  cell: ({ row }) => (
    <div className="flex justify-center">
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar articulo"
      />
    </div>
  ),
  enableSorting: false,
  enableHiding: false,
};

// Columnas para COMPONENTE (baseCols + acciones)
const componenteCols: AppColumnDef<IArticleSimple>[] = [
  ...baseCols,
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    cell: ({ row }) => {
      const item = row.original;
      return <CheckingArticleDropdownActions id={item.id} />;
    },
  },
];

// Columnas extra para CONSUMIBLE
export const consumibleCols: AppColumnDef<IArticleSimple>[] = [
  ...baseCols,
  {
    accessorKey: "min_quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cant. Mínima" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium text-sm">
        {row.original.min_quantity ?? (
          <span className="text-muted-foreground">0</span>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    cell: ({ row }) => {
      const item = row.original;
      return <CheckingArticleDropdownActions id={item.id} />;
    },
  },
];

// Función helper para parsear fechas ISO como fechas locales
const parseDateLocal = (dateString: string): Date => {
  // Si la fecha viene como "YYYY-MM-DD" sin hora, parsearla como fecha local
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  // Si tiene hora, usar parseISO
  return parseISO(dateString);
};

// Columnas extra para HERRAMIENTA
export const herramientaCols: AppColumnDef<IArticleSimple>[] = [
  ...baseCols,
  {
    accessorKey: "calibration_date",
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prox. Cal." />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center text-sm font-bold text-muted-foreground">
          {row.original.tool?.next_calibration &&
          row.original.tool.calibration_date
            ? format(
                addDays(
                  parseDateLocal(row.original.tool.calibration_date),
                  Number(row.original.tool.next_calibration),
                ),
                "dd/MM/yyyy",
              )
            : "N/A"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    cell: ({ row }) => {
      const item = row.original;
      return <CheckingArticleDropdownActions id={item.id} />;
    },
  },
];

// Columnas por categoría
export const getColumnsByCategory = (
  cat: "all" | "COMPONENT" | "CONSUMABLE" | "TOOL" | "PART",
): AppColumnDef<IArticleSimple>[] => {
  if (cat === "TOOL") return [selectionColumn, ...herramientaCols];
  if (cat === "CONSUMABLE") return [selectionColumn, ...consumibleCols];
  return [selectionColumn, ...componenteCols]; // componente u otros
};
