"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { GeneralArticle } from "@/types"
import GeneralArticleDropDownActions from "@/components/dropdowns/mantenimiento/almacen/GeneralArticleDropDownActions"
import ArticleImageCell from "@/components/misc/ArticleImageCell"
import { numericSortingFn, textSortingFn } from "@/lib/warehouse/sorting"
import { formatQuantity } from "@/lib/utils"
import { Ruler } from "lucide-react"

export const buildGeneralColumns = (
    unitOptions: { value: string; label: string }[] = [],
): ColumnDef<GeneralArticle>[] => [
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
                        <p
                            className="text-center font-bold text-sm"
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
                            className="text-center text-sm text-muted-foreground font-medium  italic"
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
        id: "image",
        header: () => (
            <div className="flex justify-center">
                <span className="text-sm font-medium">Img.</span>
            </div>
        ),
        cell: ({ row }) => (
            <ArticleImageCell
                image={row.original.image}
                alt={row.original.description}
            />
        ),
        enableSorting: false,
        // Solo el icono más un respiro lateral: sin esto la columna se reparte
        // el ancho sobrante y queda desproporcionada para lo que muestra.
        meta: { className: "w-[64px] px-2" } as any,
    },
    {
        accessorKey: "quantity",
        sortingFn: numericSortingFn((row) => Number(row.quantity ?? 0)),
        filterFn: (row, _id, value) => {
            const raw = String(value ?? "").trim()
            if (!raw) return true

            const qty = Number(row.original.quantity ?? 0)

            const range = raw.match(/^(<=|>=|<|>)\s*(\d+(?:\.\d+)?)$/)
            if (range) {
                const n = Number(range[2])
                if (range[1] === "<") return qty < n
                if (range[1] === "<=") return qty <= n
                if (range[1] === ">") return qty > n
                return qty >= n
            }

            return String(qty).includes(raw)
        },
        header: ({ column }) => (
            <div className="flex justify-center">
                <DataTableColumnHeader filter column={column} title="Cantidad" />
            </div>
        ),
        cell: ({ row }) => {
            const qty = Number(row.original.quantity ?? 0)
            const isAvailable = qty > 0;
            const dim = row.original.dimension

            // En un artículo dimensionado la cantidad son piezas equivalentes:
            // "4.5" no se entiende sin decir que son 4 hojas y media, ni sin el
            // saldo real, que es lo que determina qué se puede cortar.
            if (dim) {
                return (
                    <div className="flex flex-col items-center gap-1">
                        <Badge
                            variant={isAvailable ? "default" : "destructive"}
                            className="tabular-nums px-2 py-1 text-xs"
                        >
                            {isAvailable
                                ? `${formatQuantity(qty)} pza. equiv.`
                                : "No Disponible"}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                            {dim.total_remaining} {dim.magnitude_label} en{" "}
                            {dim.available_pieces} pza.
                        </span>
                    </div>
                )
            }

            return (
                <div className="flex justify-center">
                    <Badge
                        variant={isAvailable ? "default" : "destructive"}
                        className="tabular-nums px-2 py-1 text-xs"
                    >
                        {isAvailable ? formatQuantity(qty) : "No Disponible"}
                    </Badge>
                </div>
            )
        },
    },
    {
        id: "unit",
        accessorFn: (row) => row.general_primary_unit?.label ?? "",
        filterFn: (row, id, value) => {
            const raw = String(value ?? "").trim()
            if (!raw) return true
            return String(row.getValue(id) ?? "") === raw
        },
        enableSorting: false,
        header: ({ column }) => (
            <div className="flex justify-center">
                <DataTableColumnHeader
                    column={column}
                    title="Unidad"
                    filterOptions={unitOptions}
                />
            </div>
        ),
        cell: ({ row }) => {
            const unitLabel = row.original.general_primary_unit?.label?.trim()
            const dim = row.original.dimension

            // La unidad base de un artículo dimensionado no describe cómo se
            // maneja: lo que importa es el tamaño de la pieza que se corta.
            if (dim) {
                return (
                    <div className="flex justify-center">
                        <Badge
                            variant="secondary"
                            className="flex items-center gap-1 px-2 py-1 text-xs"
                        >
                            <Ruler className="h-3 w-3" />
                            {dim.axes === 2
                                ? `${dim.piece_length} × ${dim.piece_width} ${dim.measure_unit_label ?? ""}`
                                : `${dim.piece_length} ${dim.measure_unit_label ?? ""}`}
                        </Badge>
                    </div>
                )
            }

            if (!unitLabel) {
                return (
                    <div className="flex justify-center">
                        <span className="text-sm text-muted-foreground">N/A</span>
                    </div>
                )
            }

            return (
                <div className="flex justify-center">
                    <Badge variant="outline" className="px-2 py-1 text-xs">
                        {unitLabel}
                    </Badge>
                </div>
            )
        },
    },
    {
        id: "actions",
        header: ({ column }) => (
            <div className="flex justify-center">
                <DataTableColumnHeader column={column} title="Acciones" />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex justify-center">
                <GeneralArticleDropDownActions article={row.original} />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
]

export const columns = buildGeneralColumns()

/** Unidades presentes en los datos: solo ofrece filtros que devuelven filas. */
export const getUnitOptions = (articles: GeneralArticle[] | undefined) => {
    const labels = new Set<string>()

    for (const article of articles ?? []) {
        const label = article.general_primary_unit?.label?.trim()
        if (label) labels.add(label)
    }

    return Array.from(labels)
        .sort((a, b) => a.localeCompare(b))
        .map((label) => ({ value: label, label }))
}
