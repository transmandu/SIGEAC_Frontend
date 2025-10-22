"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import { Checkbox } from "@/components/ui/checkbox"
import { FlightControl } from "@/types"
import Link from "next/link"
import FlightControlDropdownActions from "@/components/dropdowns/mantenimiento/FlightControlDropdownActions"

export const columns: ColumnDef<FlightControl>[] = [
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
    accessorKey: "aircraft.acronym",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Aeronave" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center font-medium">{row.original.aircraft.acronym}</p>
    )
  },
  {
    accessorKey: "flight_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nro. de Vuelo" />
    ),
    cell: ({ row }) => (
      <Link href={`/hangar74/planificacion/control_vuelos/vuelos/${row.original.flight_number}`} className="flex justify-center font-bold italic">{row.original.flight_number}</Link>
    )
  },
  {
    accessorKey: "destination",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Ruta" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center text-muted-foreground italic">{row.original.origin} - {row.original.destination}</p>
    )
  },
  {
    accessorKey: "flight_hours",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Horas de Vuelo" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center font-semibold">{row.original.flight_hours}</p>
    )
  },
  {
    accessorKey: "flight_cycles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ciclos de Vuelo" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center font-semibold">{row.original.flight_cycles}</p>
    )
  },
  {
    accessorKey: "aircraft_operator",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Operador" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center text-muted-foreground italic">{row.original.aircraft_operator}</p>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const flightControl = row.original
      return <FlightControlDropdownActions flightControl={flightControl} />
    },
  },
]
