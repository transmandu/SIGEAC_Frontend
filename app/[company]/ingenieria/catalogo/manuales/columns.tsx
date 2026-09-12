"use client";

import { type AppColumnDef, type AppFilterFn } from "@/lib/table";
import { Badge } from "@/components/ui/badge";
import { CatalogManual } from "@/types/maintenanceCatalog";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { formatCalendarDate } from "@/lib/date";
import { STATUS_LABELS } from "@/lib/maintenanceCatalogLabels";
import { ManualRowActions } from "./_components/ManualRowActions";

// Los filtros facetados entregan un arreglo de valores seleccionados; sin esto
// TanStack compara el arreglo contra el valor de la celda y nunca coincide.
const includesSome: AppFilterFn<CatalogManual> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true;
  return filterValue.includes(String(row.getValue(columnId)));
};

/**
 * La columna de estado guarda "ACTIVE"/"SUPERSEDED", así que un filtro global
 * sobre los valores de celda no encuentra "vigente". El buscador se arma sobre
 * el texto que el usuario ve, igual que en servicios.
 */
export const manualGlobalFilter: AppFilterFn<CatalogManual> = (row, _columnId, filterValue: string) => {
  const term = filterValue.trim().toLowerCase();
  if (!term) return true;

  const manual = row.original;
  const haystack = [
    manual.name,
    manual.manual_code,
    manual.revision,
    manual.description,
    STATUS_LABELS[manual.status],
  ];

  return haystack.some((value) => value?.toLowerCase().includes(term));
};

export const columns: AppColumnDef<CatalogManual>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => <p className="text-center font-medium">{row.original.name}</p>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    filterFn: includesSome,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge variant={row.original.status === "ACTIVE" ? "default" : "secondary"}>
          {STATUS_LABELS[row.original.status]}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "manual_code",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Código" />,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.manual_code || <span className="text-muted-foreground">—</span>}
      </div>
    ),
  },
  {
    accessorKey: "revision",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Revisión" />,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.revision || <span className="text-muted-foreground">—</span>}
      </div>
    ),
  },
  {
    accessorKey: "effective_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Vigente desde" />,
    // Columna `date`: fecha de calendario, nunca se convierte de zona.
    cell: ({ row }) => (
      <div className="text-center">
        {formatCalendarDate(row.original.effective_date, "date", "—")}
      </div>
    ),
  },
  {
    accessorKey: "services_count",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Servicios" />,
    cell: ({ row }) => <div className="text-center">{row.original.services_count ?? 0}</div>,
  },
  // Columna solo-filtro: se oculta desde el estado de la tabla (ver data-table).
  {
    id: "support",
    accessorFn: (row) => (row.is_physical ? "PHYSICAL" : "DIGITAL"),
    filterFn: includesSome,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex w-full justify-center">
        <ManualRowActions manual={row.original} />
      </div>
    ),
  },
];
