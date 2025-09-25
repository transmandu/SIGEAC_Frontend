"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ArticleSearchResult } from "@/hooks/mantenimiento/almacen/renglones/useSearchArticlesByPartNumber"

export const createArticleColumns = (companySlug?: string): ColumnDef<ArticleSearchResult>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "part_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nro. de Parte" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-medium text-blue-600">{row.original.part_number}</span>
      </div>
    ),
    filterFn: (row, columnId, filterValue) => {
      const partNumber = row.original.part_number?.toLowerCase() ?? "";
      const filter = filterValue.toLowerCase();
      return partNumber.includes(filter);
    },
  },
  {
    accessorKey: "serial",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Serial" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground font-mono text-sm">
          {row.original.serial || "N/A"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center max-w-[200px]">
        <span className="text-muted-foreground truncate">{row.original.description}</span>
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge variant="secondary" className="font-bold">
          {row.original.quantity} {row.original.unit_secondary || "UN"}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "zone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Zona del Almacén" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge variant="outline" className="font-medium">
          {row.original.zone || "N/A"}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "batch.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Renglón/Batch" />
    ),
    cell: ({ row }) => {
      const batch = row.original.batch;
      if (!batch || !batch.slug) {
        return (
          <div className="flex justify-center">
            <span className="text-muted-foreground">Sin batch</span>
          </div>
        );
      }
      
      return (
        <div className="flex justify-center">
          <Link 
            href={`/${companySlug || 'hangar74'}/almacen/inventario/gestion/${batch.slug}`} 
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            {batch.name}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "batch.category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categoría" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge variant="default">
          {row.original.batch?.category || "N/A"}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "condition",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Condición" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-bold">{row.original.condition}</span>
      </div>
    ),
  },
  {
    accessorKey: "manufacturer",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fabricante" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">{row.original.manufacturer}</span>
      </div>
    ),
  },
  {
    accessorKey: "batch.warehouse_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Almacén" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge variant="outline" className="bg-green-50">
          {row.original.batch?.warehouse_name || "N/A"}
        </Badge>
      </div>
    ),
  },
];

// Export por defecto para compatibilidad - usar la company desde el contexto
export const articleColumns: ColumnDef<ArticleSearchResult>[] = createArticleColumns();
