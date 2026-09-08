"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { GeneralArticle } from "@/types"
import { textSortingFn } from "@/lib/warehouse/sorting"

/**
 * Artículos generales vistos desde fuera del almacén.
 *
 * Es una tabla aparte de la del almacén a propósito: aquí se consulta si hay
 * algo, no cuánto queda. El número exacto es información de quien administra
 * el inventario, así que esta vista solo responde disponible / no disponible.
 */
export const generalConsultaColumns: ColumnDef<GeneralArticle>[] = [
    {
        accessorKey: "description",
        sortingFn: textSortingFn((row) => row.description),
        header: ({ column }) => (
            <div className="flex justify-center">
                <DataTableColumnHeader filter column={column} title="Descripción" />
            </div>
        ),
        cell: ({ row }) => {
            const value = row.original.description?.trim() || "N/A"

            return (
                <div className="flex justify-center">
                    <div className="max-w-[520px]">
                        <p className="text-center font-bold text-sm" title={value}>
                            {value}
                        </p>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "brand_model",
        sortingFn: textSortingFn((row) => row.brand_model),
        header: ({ column }) => (
            <div className="flex justify-center">
                <DataTableColumnHeader filter column={column} title="Marca / Modelo" />
            </div>
        ),
        cell: ({ row }) => {
            const value = row.original.brand_model?.trim() || "N/A"

            return (
                <div className="flex justify-center">
                    <div className="max-w-[280px]">
                        <p
                            className="text-center text-sm text-muted-foreground font-medium italic"
                            title={value}
                        >
                            {value}
                        </p>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "variant_type",
        sortingFn: textSortingFn((row) => row.variant_type),
        header: ({ column }) => (
            <div className="flex justify-center">
                <DataTableColumnHeader filter column={column} title="Present. / Especif." />
            </div>
        ),
        cell: ({ row }) => {
            const value = row.original.variant_type?.trim() || "N/A"

            return (
                <div className="flex justify-center">
                    <div className="max-w-[240px]">
                        <p className="text-center text-sm font-medium" title={value}>
                            {value}
                        </p>
                    </div>
                </div>
            )
        },
    },
    {
        id: "availability",
        accessorFn: (row) => (Number(row.quantity ?? 0) > 0 ? 1 : 0),
        header: ({ column }) => (
            <div className="flex justify-center">
                <DataTableColumnHeader column={column} title="Disponibilidad" />
            </div>
        ),
        cell: ({ row }) => {
            const isAvailable = Number(row.original.quantity ?? 0) > 0

            return (
                <div className="flex justify-center">
                    <Badge
                        variant={isAvailable ? "default" : "destructive"}
                        className="px-3 py-1 text-xs font-bold whitespace-nowrap"
                    >
                        {isAvailable ? "Disponible" : "No Disponible"}
                    </Badge>
                </div>
            )
        },
    },
]
