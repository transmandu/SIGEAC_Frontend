"use client";

import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { TagBadge } from "@/components/misc/TagBadge";
import LocationDropdownActions from "@/components/dropdowns/ajustes/LocationDropdownActions";
import { Location } from "@/types";

const center = "flex justify-center w-full";

/** Las acciones (editar, eliminar) son solo de SUPERUSER: sin ellas no hay columna. */
export const getColumns = (canManage: boolean): AppColumnDef<Location>[] => [
  {
    accessorKey: "address",
    size: 300,
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader
          filter
          column={column}
          title="Ciudad o dirección"
        />
      </div>
    ),
    meta: { title: "Ciudad o dirección", mobileTitle: true },
    cell: ({ row }) => (
      <div className={`${center} items-center gap-2 max-md:flex-wrap`}>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">
          {row.original.address || "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "name",
    size: 220,
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader filter column={column} title="Nombre" />
      </div>
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => (
      <div className={center}>
        <span className="text-sm text-slate-600 dark:text-slate-300 text-center">
          {row.original.name || "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "cod_iata",
    size: 140,
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader filter column={column} title="Cód. IATA" />
      </div>
    ),
    meta: { title: "Cód. IATA" },
    cell: ({ row }) => (
      <div className={center}>
        <span className="font-mono text-sm font-medium tracking-widest text-slate-600 dark:text-slate-300">
          {row.original.cod_iata || "—"}
        </span>
      </div>
    ),
  },
  {
    id: "type",
    size: 200,
    // La bandera es la única fuente: lo que no es principal es alterna.
    accessorFn: (location) =>
      location.isMainBase ? "Base Principal" : "Base Alterna",
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader column={column} title="Tipo" />
      </div>
    ),
    meta: { title: "Tipo" },
    cell: ({ row }) => (
      <div className={center}>
        {row.original.isMainBase ? (
          <TagBadge tone="blue">Base Principal</TagBadge>
        ) : (
          <TagBadge tone="slate">Base Alterna</TagBadge>
        )}
      </div>
    ),
  },
  ...(canManage
    ? [
        {
          id: "actions",
          size: 100,
          enableSorting: false,
          header: ({ column }) => (
            <div className={center}>
              <DataTableColumnHeader column={column} title="Acciones" />
            </div>
          ),
          meta: { title: "Acciones" },
          cell: ({ row }) => (
            <div className={center}>
              <LocationDropdownActions location={row.original} />
            </div>
          ),
        } satisfies AppColumnDef<Location>,
      ]
    : []),
];
