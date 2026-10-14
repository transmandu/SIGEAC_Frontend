"use client";

import { type AppColumnDef } from "@/lib/table";
import AircraftDropdownActions from "@/components/dropdowns/aerolinea/aeronaves/AircraftDropdownActions";
import { TagBadge } from "@/components/misc/TagBadge";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import {
  AIRCRAFT_STATUS_LABELS,
  AIRCRAFT_STATUS_TONES,
} from "@/lib/airline-aircraft";
import type { AirlineAircraft } from "@/types";

const PLAIN = "text-sm text-slate-600 dark:text-slate-300 text-center";

/**
 * Badge solo donde aporta: el Estado (dato clave) y "Externa" (la excepción).
 * El resto va en texto neutro para que la tabla se lea de un vistazo. Los
 * `size` son proporciones, no px: Fabricante y Marca y Modelo llevan los
 * textos más largos.
 */
export const columns: AppColumnDef<AirlineAircraft>[] = [
  {
    accessorKey: "acronym",
    size: 110,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Matrícula" />
      </div>
    ),
    meta: { title: "Matrícula" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {row.original.acronym}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "is_external",
    size: 100,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Tipo" />
      </div>
    ),
    meta: { title: "Tipo" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        {row.original.is_external ? (
          <TagBadge tone="amber">Externa</TagBadge>
        ) : (
          <span className={PLAIN}>Propia</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "serial",
    size: 120,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Serial" />
      </div>
    ),
    meta: { title: "Serial" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className={PLAIN}>{row.original.serial}</span>
      </div>
    ),
  },
  {
    id: "brand_model",
    accessorFn: (aircraft) => `${aircraft.brand} ${aircraft.model}`,
    size: 190,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Marca y Modelo" />
      </div>
    ),
    meta: { title: "Marca y Modelo" },
    cell: ({ row }) => (
      <div className="flex flex-col items-center text-center">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {row.original.model}
        </span>
        <span className="text-xs text-muted-foreground">
          {row.original.brand}
        </span>
      </div>
    ),
  },
  {
    id: "manufacturer",
    accessorFn: (aircraft) => aircraft.manufacturer?.name ?? "",
    size: 220,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Fabricante" />
      </div>
    ),
    meta: { title: "Fabricante" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className={PLAIN} title={row.original.manufacturer?.description}>
          {row.original.manufacturer?.name ?? "—"}
        </span>
      </div>
    ),
  },
  {
    id: "location",
    accessorFn: (aircraft) =>
      aircraft.location?.name || aircraft.location?.address || "",
    size: 140,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Ubicación" />
      </div>
    ),
    meta: { title: "Ubicación" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className={PLAIN}>
          {row.original.location?.name || row.original.location?.address || "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    size: 130,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Estado" />
      </div>
    ),
    meta: { title: "Estado" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <TagBadge tone={AIRCRAFT_STATUS_TONES[row.original.status] ?? "slate"}>
          {AIRCRAFT_STATUS_LABELS[row.original.status] ?? row.original.status}
        </TagBadge>
      </div>
    ),
  },
  {
    accessorKey: "inac",
    size: 80,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="INAC" />
      </div>
    ),
    meta: { title: "INAC" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className={PLAIN}>{row.original.inac ? "Sí" : "No"}</span>
      </div>
    ),
  },
  {
    id: "actions",
    size: 90,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),
    meta: { title: "Acciones" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <AircraftDropdownActions aircraft={row.original} />
      </div>
    ),
  },
];
