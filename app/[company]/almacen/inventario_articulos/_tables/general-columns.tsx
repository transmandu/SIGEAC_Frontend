"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { GeneralArticle } from "@/types"
import GeneralArticleDropDownActions from "@/components/dropdowns/mantenimiento/almacen/GeneralArticleDropDownActions"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ImageIcon, ImageOff, Loader2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { numericSortingFn, textSortingFn } from "@/lib/warehouse/sorting"

/**
 * Popover por fila en vez de un Dialog global: permite recorrer el inventario
 * viendo referencias sin el ciclo abrir/cerrar de un modal.
 *
 * El costo en reposo sigue siendo un botón — Radix no monta el contenido ni
 * el portal hasta que se abre, así que la imagen se descarga en el primer
 * clic y el navegador la cachea para las siguientes veces.
 */
const ArticleImageCell = ({ article }: { article: GeneralArticle }) => {
    const [hasOpened, setHasOpened] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    const image = article.image?.trim()

    if (!image) {
        return (
            <div className="flex justify-center">
                <span className="text-xs text-muted-foreground">—</span>
            </div>
        )
    }

    return (
        <div className="flex justify-center">
            <Popover onOpenChange={(open) => open && setHasOpened(true)}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Ver imagen de referencia</span>
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-2" side="left" align="center">
                    <div className="relative flex h-[240px] w-[240px] items-center justify-center overflow-hidden rounded-md bg-muted/30">
                        {isLoading && !hasError && (
                            <Loader2 className="absolute h-5 w-5 animate-spin text-muted-foreground" />
                        )}

                        {hasError ? (
                            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                                <ImageOff className="h-6 w-6" />
                                <p className="text-xs">No se pudo cargar.</p>
                            </div>
                        ) : (
                            // hasOpened evita pedir la imagen antes del primer clic.
                            hasOpened && (
                                <Image
                                    src={image}
                                    alt={article.description?.trim() || "Artículo"}
                                    fill
                                    sizes="240px"
                                    className="object-contain"
                                    onLoad={() => setIsLoading(false)}
                                    onError={() => {
                                        setIsLoading(false)
                                        setHasError(true)
                                    }}
                                />
                            )
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

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
                <span className="text-sm font-medium">Ref.</span>
            </div>
        ),
        cell: ({ row }) => <ArticleImageCell article={row.original} />,
        enableSorting: false,
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

            return (
                <div className="flex justify-center">
                    <Badge
                        variant={isAvailable ? "default" : "destructive"}
                        className="tabular-nums px-2 py-1 text-xs"
                    >
                        {isAvailable ? qty : "No Disponible"}
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
