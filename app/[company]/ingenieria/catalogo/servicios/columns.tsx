"use client";

import { ColumnDef, FilterFn } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, COUNTING_METHOD_LABELS, STATUS_LABELS } from "@/lib/maintenanceCatalogLabels";
import { CatalogService } from "@/types/maintenanceCatalog";
import { ServiceRowActions } from "./_components/ServiceRowActions";

// Los filtros facetados entregan un arreglo de valores seleccionados; sin esto
// TanStack compara el arreglo contra el valor de la celda y nunca coincide.
const includesSome: FilterFn<CatalogService> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true;
  return filterValue.includes(String(row.getValue(columnId)));
};

const includesSomeAircraft: FilterFn<CatalogService> = (row, _columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true;
  const ids = row.original.aircrafts?.map((a) => String(a.id)) ?? [];
  return ids.some((id) => filterValue.includes(id));
};

// La columna de manual guarda el id (lo que filtra el facetado), así que el
// buscador se arma sobre el texto real en vez de los valores de las celdas.
export const serviceGlobalFilter: FilterFn<CatalogService> = (row, _columnId, filterValue: string) => {
  const term = filterValue.trim().toLowerCase();
  if (!term) return true;

  const service = row.original;
  const haystack = [
    service.name,
    service.code,
    service.description,
    service.manual?.name,
    CATEGORY_LABELS[service.category],
    STATUS_LABELS[service.status],
    ...(service.aircrafts?.map((a) => a.acronym) ?? []),
  ];

  return haystack.some((value) => value?.toLowerCase().includes(term));
};

export const getColumns = (company: string): ColumnDef<CatalogService>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => (
      <p className="text-center font-medium">{row.original.name}</p>
    ),
  },
  {
    id: "manual",
    accessorFn: (row) => (row.manual ? String(row.manual.id) : ""),
    header: ({ column }) => <DataTableColumnHeader column={column} title="Manual" />,
    filterFn: includesSome,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.manual?.name ?? <span className="text-muted-foreground">—</span>}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Categoría" />,
    filterFn: includesSome,
    cell: ({ row }) => (
      <div className="flex w-full justify-center">
        <Badge variant={row.original.category === "CERTIFICATE" ? "secondary" : "default"}>
          {CATEGORY_LABELS[row.original.category]}
        </Badge>
      </div>
    ),
  },
  // Columna solo-filtro: se oculta desde el estado de la tabla (ver data-table).
  {
    id: "aircrafts",
    accessorFn: (row) => row.aircrafts?.map((a) => a.acronym).join(", ") ?? "",
    filterFn: includesSomeAircraft,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    filterFn: includesSome,
    cell: ({ row }) => (
      <div className="flex w-full justify-center">
        <Badge variant={row.original.status === "ACTIVE" ? "default" : "secondary"}>
          {STATUS_LABELS[row.original.status]}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "counting_method",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Intervalo" />,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.counting_method ? (
          <span>
            {row.original.interval_value} {COUNTING_METHOD_LABELS[row.original.counting_method]}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "tasks_count",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tareas" />,
    cell: ({ row }) => <div className="text-center">{row.original.tasks_count ?? 0}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex w-full justify-center">
        <ServiceRowActions service={row.original} company={company} />
      </div>
    ),
  },
];
