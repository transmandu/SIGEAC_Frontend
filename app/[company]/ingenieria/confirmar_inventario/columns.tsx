"use client";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import { WarehouseResponse } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory";
import { ColumnDef } from "@tanstack/react-table";
import { addDays, format, parseISO } from "date-fns";
import CheckingArticleDropdownActions from "./_components/CheckingArticleDropdownActionts";

export interface IArticleSimple {
  id: number;
  part_number: string;
  alternative_part_number?: string[];
  description?: string;
  quantity: number;
  zone: string;
  article_type: string;
  serial?: string;
  lot_number?: string;
  status: string;
  condition: string;
  is_hazardous?: boolean;
  batch_name: string;
  batch_id: number;
  min_quantity?: number | string; // Directamente en el artículo
  tool?: {
    status?: string | null;
    calibration_date?: string | null; // ISO string o "dd/MM/yyyy"
    next_calibration_date?: string | null; // si guardas fecha
    next_calibration?: number | string | null; // o días
  };
}


export const flattenArticles = (
  data: WarehouseResponse | undefined
): IArticleSimple[] => {
  if (!data?.batches) return [];
  return data.batches.flatMap((batch) =>
    batch.articles.map((article) => ({
      id: article.id,
      part_number: article.part_number,
      alternative_part_number: article.alternative_part_number,
      serial: article.serial,
      lot_number: article.lot_number,
      description: article.description,
      zone: article.zone,
      // Normalizar cantidad: 0, null o undefined -> 1
      quantity:
        article.quantity === 0 ||
        article.quantity === null ||
        article.quantity === undefined
          ? 1
          : article.quantity,
      status: article.status,
      condition: article.condition ? article.condition.name : "N/A",
      article_type: article.article_type ?? "N/A",
      batch_name: batch.name,
      is_hazardous: batch.is_hazardous ?? undefined,
      batch_id: batch.batch_id,
      min_quantity: article.min_quantity, // Directamente desde el artículo
      tool: article.tool
        ? {
            status: article.tool.status,
            calibration_date: article.tool.calibration_date,
            next_calibration_date: article.tool.next_calibration_date,
            next_calibration: article.tool.next_calibration,
          }
        : undefined,
    }))
  );
};

const baseCols: ColumnDef<IArticleSimple>[] = [
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
      <div className="text-muted-foreground font-bold text-center max-w-xs line-clamp-2">
        {row.original.batch_name || "Sin descripción"}
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad" />
    ),
    cell: ({ row }) => {
      const q = row.original.quantity ?? 0;
      return (
        <div className="flex justify-center">
          <Badge
            variant={q > 5 ? "default" : q > 0 ? "secondary" : "destructive"}
            className="text-base font-bold px-3 py-1"
          >
            {q}
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
    cell: ({ row }) => {
      return (
        <div className="flex flex-col justify-center items-center space-y-2">
          <Badge className="bg-yellow-500">
            {row.original.status?.toUpperCase()}
          </Badge>

        </div>
      );
    },
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

// Columnas para COMPONENTE (baseCols + acciones)
const componenteCols: ColumnDef<IArticleSimple>[] = [
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
export const consumibleCols: ColumnDef<IArticleSimple>[] = [
  ...baseCols,
  {
    accessorKey: "min_quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cant. Mínima" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium text-sm">
        {row.original.min_quantity || (
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
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  // Si tiene hora, usar parseISO
  return parseISO(dateString);
};

// Columnas extra para HERRAMIENTA
export const herramientaCols: ColumnDef<IArticleSimple>[] = [
  ...baseCols,
  {
    accessorKey: "calibration_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fech. Calibración" />
    ),
    cell: ({ row }) => (
      <div className="text-center text-sm font-bold text-muted-foreground">
        {row.original.tool?.calibration_date
          ? format(parseDateLocal(row.original.tool.calibration_date), "dd/MM/yyyy")
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
                  Number(row.original.tool.next_calibration)
                ),
                "dd/MM/yyyy"
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
  cat: "COMPONENTE" | "CONSUMIBLE" | "HERRAMIENTA"
): ColumnDef<IArticleSimple>[] => {
  if (cat === "HERRAMIENTA") return herramientaCols;
  if (cat === "CONSUMIBLE") return consumibleCols;
  return componenteCols; // componente u otros
};
