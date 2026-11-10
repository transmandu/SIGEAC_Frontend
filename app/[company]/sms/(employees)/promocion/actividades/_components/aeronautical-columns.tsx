"use client";

import Link from "next/link";

import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AeronauticalActivityActions } from "@/components/dropdowns/sms/aeronautical/activity-actions";
import type { AeronauticalActivity } from "@/types/sms/aeronautical/activity";

const statusClassName: Record<string, string> = {
  ABIERTO:
    "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800",
  CERRADO:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  PROCESO:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  PENDIENTE:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  PENDING:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
};

const ActivityNumberLink = ({ value }: { value?: string }) => {
  const { selectedCompany } = useCompanyStore();

  if (!value) {
    return <span className="text-muted-foreground">N/A</span>;
  }

  return (
    <Link
      href={`/${selectedCompany?.slug}/sms/promocion/actividades/${value}`}
      className="font-mono text-sm tracking-wide text-primary hover:underline underline-offset-4"
    >
      {value}
    </Link>
  );
};

const activityNumberSortFn = (
  rowA: { original: AeronauticalActivity },
  rowB: { original: AeronauticalActivity },
) => {
  const parse = (val?: string) => {
    if (!val) return { num: 0, year: 0 };
    const parts = val.split("-");
    return {
      num: parseInt(parts[0], 10) || 0,
      year: parseInt(parts[1], 10) || 0,
    };
  };

  const a = parse(rowA.original.activity_number);
  const b = parse(rowB.original.activity_number);

  if (a.year !== b.year) return b.year - a.year;
  return b.num - a.num;
};

export const aeronauticalActivityColumns: AppColumnDef<AeronauticalActivity>[] =
  [
    {
      accessorKey: "activity_number",
      sortFn: activityNumberSortFn,
      header: ({ column }) => (
        <DataTableColumnHeader
          filter
          column={column}
          title="Número de actividad"
        />
      ),
      meta: { title: "Número de actividad" },
      cell: ({ row }) => (
        <ActivityNumberLink value={row.original.activity_number} />
      ),
    },
    {
      accessorKey: "activity_name",
      header: ({ column }) => (
        <DataTableColumnHeader
          filter
          column={column}
          title="Nombre de la actividad"
        />
      ),
      meta: { title: "Nombre de la actividad" },
      cell: ({ row }) => (
        <span className="font-medium">{row.original.activity_name}</span>
      ),
    },
    {
      accessorKey: "place",
      header: ({ column }) => (
        <DataTableColumnHeader filter column={column} title="Lugar" />
      ),
      meta: { title: "Lugar" },
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.place}
        </span>
      ),
    },
    {
      id: "categories",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Categorías" />
      ),
      meta: { title: "Categorías" },
      cell: ({ row }) => (
        <div className="flex max-w-56 flex-wrap gap-1">
          {(row.original.categories ?? []).length > 0 ? (
            row.original.categories.map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className="text-[10px] font-normal"
              >
                {category.name}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">Sin categoría</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Estado" />
      ),
      meta: { title: "Estado" },
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={`font-medium ${
            statusClassName[row.original.status] ??
            "bg-muted text-muted-foreground border-border/60"
          }`}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <AeronauticalActivityActions activity={row.original} />
        </div>
      ),
    },
  ];
