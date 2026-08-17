"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { addDays, format, parseISO } from "date-fns";
import ArticleDropdownActions from "@/components/dropdowns/mantenimiento/almacen/ArticleDropdownActions";
import { WarehouseResponse } from "@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory";
import { StatusColumnHeader } from "@/components/tables/StatusColumnHeader";
import { Unit } from "@/types";
import { CONDITION_OPTIONS, formatCondition } from "@/lib/warehouse/conditions";
import {
    formatStatusLabel,
    parseToolStatusFilter,
    statusOptionLabel,
} from "@/lib/warehouse/statuses";
import { zoneMatches } from "@/lib/warehouse/zones";
import { dateSortingFn, numericSortingFn, textSortingFn } from "@/lib/warehouse/sorting";
import StatusCellWithPopover from "@/components/misc/StatusCellWithPopover";
import ArticleImageCell from "@/components/misc/ArticleImageCell";
import ArticleStatusSincePopover, {
    tracksStatusSince,
} from "@/components/misc/ArticleStatusSincePopover";
import { Aircraft } from "@/types";
export interface IArticleSimple {
    id: number;
    part_number: string;
    alternative_part_number?: string[];
    description?: string;
    unit?: Unit;
    quantity: number;
    stock?: number;
    zone: string;
    article_type: string;
    serial?: string;
    lot_number?: string;
    status: string;
    status_since?: string | null;
    condition: string;
    image?: string;
    is_hazardous?: boolean;
    batch_name: string;
    batch_id: number;
    min_quantity?: number | string;
    has_documentation?: boolean;
    certificates?: string[];
    aircraft?: Aircraft;
    tool?: {
        status?: string | null;
        needs_calibration?: boolean | null;
        calibration_date?: string | null;
        next_calibration_date?: string | null;
        next_calibration?: number | string | null;
        model?: string | null;
    };
    component?: {
        expiration_date?: string | null;
        fabrication_date?: string | null;
    };
    consumable?: {
        expiration_date?: string | Date | null;
        fabrication_date?: string | Date | null;
        shelf_life?: string | Date | null;
        unit?: Unit;
    };

    // ✅ grouping helpers
    __isGroup?: boolean;
    __groupCount?: number;
    subRows?: IArticleSimple[];
}

export const getStatusBadge = (status: string | null | undefined) => {
    if (!status) {
        return (
            <Badge variant="outline" className="flex items-center gap-1 w-fit uppercase">
                <XCircle className="h-3 w-3" />
            </Badge>
        );
    }

    const statusConfig: Record<
        string,
        {
            variant: "default" | "secondary" | "destructive" | "outline" | "warning";
            icon: any;
        }
    > = {
        STORED: { variant: "default", icon: CheckCircle2 },
        CHECKING: { variant: "warning", icon: Clock },
        QUARANTINE: { variant: "destructive", icon: Clock },
        PENDING_REINSPECTION: { variant: "warning", icon: Clock },
        INCOMING: { variant: "outline", icon: Clock },
        RECEPTION: { variant: "outline", icon: Clock },
        WAITING_FOR_FORMAT: { variant: "warning", icon: Clock },
        WAITING_TO_LOCATE: { variant: "warning", icon: Clock },
        TO_DETERMINATE: { variant: "warning", icon: Clock },
        RESERVED: { variant: "secondary", icon: Clock },
        INTOOLBOX: { variant: "secondary", icon: Clock },
        INUSE: { variant: "warning", icon: Clock },
        DISPATCHED: { variant: "secondary", icon: Clock },
        TRANSIT: { variant: "outline", icon: Clock },
        SHELTERED: { variant: "outline", icon: Clock },
        MAINTENANCE: { variant: "outline", icon: Clock },
    };

    const key = status.trim().toUpperCase();
    const config = statusConfig[key] ?? {
        variant: "outline" as const,
        icon: XCircle,
    };
    const Icon = config.icon;
    const label = formatStatusLabel(key);

    return (
        // uppercase por CSS: el estado viene crudo del backend, no es un
        // literal que se pueda escribir ya en mayúsculas.
        <Badge variant={config.variant} className="flex items-center gap-1 w-fit uppercase">
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    );
};

export const flattenArticles = (
    data: WarehouseResponse | undefined,
): IArticleSimple[] => {
    if (!data?.batches) return [];
    return data.batches.flatMap((batch) =>
        batch.articles.map((article) => {
            const articleWithDoc = article as typeof article & {
                has_documentation?: boolean;
                certificates?: string[];
            };

            return {
                id: article.id,
                part_number: article.part_number,
                alternative_part_number: article.alternative_part_number,
                serial: article.serial,
                lot_number: article.lot_number,
                description: article.description,
                zone: article.zone,

                // ✅ No normalizar 0 -> 1
                quantity: Number(article.quantity ?? 0),
                stock: article.stock ?? undefined,

                status: article.status,
                status_since: article.status_since ?? null,
                condition: article.condition ? article.condition.name : "N/A",
                // Solo la URL ya resuelta: el File del formulario no aplica aquí.
                image: typeof article.image === "string" ? article.image : undefined,
                article_type: article.article_type ?? "N/A",
                batch_name: batch.name,
                is_hazardous: batch.is_hazardous ?? undefined,
                batch_id: batch.batch_id,

                min_quantity: article.min_quantity,
                has_documentation: articleWithDoc.has_documentation ?? false,
                certificates: articleWithDoc.certificates ?? [],
                unit: article.unit ?? undefined,
                aircraft: article.aircraft ?? undefined,
                tool: article.tool
                    ? {
                        status: article.tool.status,
                        calibration_date: article.tool.calibration_date,
                        next_calibration_date: article.tool.next_calibration_date,
                        next_calibration: article.tool.next_calibration,
                    }
                    : undefined,

                component:
                    batch.category === "COMPONENT" &&
                        ((article as any).expiration_date != null ||
                            article.component?.shell_time)
                        ? {
                            expiration_date:
                                (article as any).expiration_date ??
                                article.component?.shell_time?.expiration_date ??
                                null,
                            fabrication_date:
                                article.component?.shell_time?.fabrication_date ?? null,
                        }
                        : undefined,

                consumable:
                    batch.category === "CONSUMABLE"
                        ? {
                            expiration_date: (article as any).expiration_date ?? null,
                            fabrication_date: (article as any).fabrication_date ?? null,
                            shelf_life: (article as any).shelf_life ?? null, // ✅ AGREGAR ESTA LÍNEA
                            unit: article.unit ?? undefined,
                        }
                        : undefined,
            };
        }),
    );
};

/** Minúsculas y sin acentos: el almacén escribe indistintamente con y sin tilde. */
const normalizeText = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim();

// Helper parse local date
const parseDateLocal = (dateString: string): Date => {
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split("-").map(Number);
        return new Date(year, month - 1, day);
    }
    return parseISO(dateString);
};

const toDate = (value: string | Date | null | undefined): Date | null => {
    if (!value) return null;
    const date = value instanceof Date ? value : parseDateLocal(value);
    return isNaN(date.getTime()) ? null : date;
};

// ✅ Columna cantidad (solo consumible y all)
// Ahora: si es grupo, muestra __groupCount aquí (sin badge en PN)
const quantityCol: ColumnDef<IArticleSimple> = {
    accessorKey: "quantity",
    sortingFn: numericSortingFn((row) =>
        row.stock != null
            ? Number(row.stock)
            : row.__isGroup
                ? Number(row.__groupCount ?? 0)
                : Number(row.quantity ?? 0),
    ),
    // El texto se compara contra la cantidad mostrada, que en un grupo es el conteo.
    filterFn: (row, _id, value) => {
        const raw = String(value ?? "").trim();
        if (!raw) return true;

        const shown = row.original.stock != null
            ? Number(row.original.stock)
            : row.original.__isGroup
                ? Number(row.original.__groupCount ?? 0)
                : Number(row.original.quantity ?? 0);

        const range = raw.match(/^(<=|>=|<|>)\s*(\d+(?:\.\d+)?)$/);
        if (range) {
            const n = Number(range[2]);
            if (range[1] === "<") return shown < n;
            if (range[1] === "<=") return shown <= n;
            if (range[1] === ">") return shown > n;
            return shown >= n;
        }

        return String(shown).includes(raw);
    },
    header: ({ column }) => (
        <DataTableColumnHeader filter column={column} title="Cantidad" />
    ),
    cell: ({ row }) => {
        const isGroup = !!row.original.__isGroup;

        const q = row.original.stock != null
            ? Number(row.original.stock)
            : isGroup
                ? Number(row.original.__groupCount ?? 0)
                : Number(row.original.quantity ?? 0);

        const unit = row.original.unit?.value ?? "u";

        return (
            <div className="flex justify-center items-center">
                <Badge
                    variant={q > 5 ? "default" : q > 0 ? "secondary" : "destructive"}
                    className="text-xs font-bold px-3 py-1"
                >
                    {q} {unit}
                </Badge>
            </div>
        );
    },
};

/**
 * Las cuatro categorías comparten la misma columna de acciones. El menú se
 * muestra en cualquier estado —el historial siempre se puede consultar— y es el
 * propio dropdown el que decide qué ítems ofrece según el estado y el rol.
 */
const actionsCol: ColumnDef<IArticleSimple> = {
    id: "actions",
    // El sticky y el fondo los aplica la celda desde meta.sticky: repetirlos
    // aquí pintaba un bloque opaco que no seguía el hover de la fila.
    header: () => <div className="text-center">Acciones</div>,
    cell: ({ row }) => {
        const item = row.original;
        if (item.__isGroup) return null;

        return (
            <div className="flex justify-center">
                <ArticleDropdownActions
                    id={item.id}
                    status={item.status}
                    hasDocumentation={
                        item.has_documentation || (item.certificates?.length ?? 0) > 0
                    }
                    partNumber={item.part_number}
                />
            </div>
        );
    },
    meta: { sticky: "right" } as any,
};

const buildBaseCols = (
    statusFilter?: string,
    onStatusFilterChange?: (value: string | undefined) => void,
    showToolStatuses = false,
): ColumnDef<IArticleSimple>[] => [
    {
        accessorKey: "part_number",
        sortingFn: textSortingFn((row) => row.part_number),
        // El alterno cuenta como el mismo artículo, igual que en el backend.
        filterFn: (row, _id, value) => {
            const raw = String(value ?? "").trim().toLowerCase();
            if (!raw) return true;

            const matches = (article: IArticleSimple) =>
                [article.part_number, ...(article.alternative_part_number ?? [])]
                    .filter(Boolean)
                    .some((pn) => String(pn).toLowerCase().includes(raw));

            return row.original.__isGroup
                ? matches(row.original) ||
                      (row.original.subRows ?? []).some(matches)
                : matches(row.original);
        },
        header: ({ column }) => (
            <DataTableColumnHeader filter column={column} title="Part Number" />
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <span className="font-bold text-base">{row.original.part_number}</span>
            </div>
        ),
    },
    {
        accessorKey: "serial",
        // La celda cae a lot_number cuando no hay serial; ordenar/filtrar sigue lo mostrado.
        sortingFn: textSortingFn((row) => row.serial || row.lot_number),
        // La fila agrupada muestra "—", pero se queda si alguno de sus artículos
        // tiene el serial buscado.
        filterFn: (row, _id, value) => {
            const raw = String(value ?? "").trim().toLowerCase();
            if (!raw) return true;

            const matches = (article: IArticleSimple) =>
                (article.serial || article.lot_number || "")
                    .toLowerCase()
                    .includes(raw);

            return row.original.__isGroup
                ? (row.original.subRows ?? []).some(matches)
                : matches(row.original);
        },
        header: ({ column }) => (
            <DataTableColumnHeader filter column={column} title="Serial / Lote" />
        ),
        cell: ({ row }) => (
            <div className="text-center text-sm font-medium">
                {row.original.__isGroup ? (
                    <span className="text-muted-foreground italic">—</span>
                ) : row.original.serial ? (
                    row.original.serial
                ) : row.original.lot_number ? (
                    row.original.lot_number
                ) : (
                    <span className="text-muted-foreground italic">N/A</span>
                )}
            </div>
        ),
    },
    {
        accessorKey: "batch_name",
        sortingFn: textSortingFn((row) => row.batch_name),
        // Acentos aparte: "DESCRIPCION" debe encontrar "Descripción".
        filterFn: (row, _id, value) => {
            const raw = normalizeText(String(value ?? ""));
            if (!raw) return true;

            const matches = (article: IArticleSimple) =>
                normalizeText(article.batch_name ?? "").includes(raw);

            return row.original.__isGroup
                ? matches(row.original) ||
                      (row.original.subRows ?? []).some(matches)
                : matches(row.original);
        },
        header: ({ column }) => (
            <DataTableColumnHeader filter column={column} title="Descripción" />
        ),
        cell: ({ row }) => (
            <div className="text-muted-foreground font-bold text-center max-w-xs line-clamp-2">
                {row.original.__isGroup
                    ? row.original.batch_name || "Grupo"
                    : row.original.batch_name || "Sin descripción"}
            </div>
        ),
    },
    {
        id: "image",
        header: () => (
            <div className="flex justify-center">
                <span className="text-sm font-medium">Img.</span>
            </div>
        ),
        cell: ({ row }) =>
            // La fila de grupo no representa un artículo concreto.
            row.original.__isGroup ? null : (
                <ArticleImageCell
                    image={row.original.image}
                    alt={row.original.description || row.original.part_number}
                />
            ),
        enableSorting: false,
        enableHiding: false,
        // Solo el icono más un respiro lateral: sin esto la columna se reparte
        // el ancho sobrante y queda desproporcionada para lo que muestra.
        meta: { className: "w-[64px] px-2" } as any,
    },
    {
        accessorKey: "condition",
        // Se muestra traducida: ordenar por el código crudo daría otro orden.
        sortingFn: textSortingFn(
            (row) => formatCondition(row.condition)?.es ?? row.condition,
        ),
        // El valor del selector es el `conditions.name` crudo; un grupo calza si
        // alguno de sus artículos tiene la condición pedida.
        filterFn: (row, _id, value) => {
            const wanted = String(value ?? "").trim().toUpperCase();
            if (!wanted) return true;

            const matches = (article: IArticleSimple) =>
                String(article.condition ?? "").trim().toUpperCase() === wanted;

            return row.original.__isGroup
                ? (row.original.subRows ?? []).some(matches)
                : matches(row.original);
        },
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Condición"
                filterOptions={CONDITION_OPTIONS}
            />
        ),
        cell: ({ row }) => {
            const condition = row.original.condition;

            if (row.original.__isGroup) {
                return (
                    <div className="text-muted-foreground font-bold text-center max-w-xs line-clamp-2">
                        {"-"}
                    </div>
                );
            }

            const c = formatCondition(condition);

            return (
                <div className="flex-col text-center max-w-xs line-clamp-2 leading-tight">
                    {c ? (
                        <>
                            <span className="font-bold text-foreground">{c.es}</span>{" "}
                            <span className="text-xs text-muted-foreground italic">
                                ({c.en})
                            </span>
                        </>
                    ) : (
                        <span className="text-muted-foreground font-bold">
                            SIN CONDICIÓN
                        </span>
                    )}
                    {(c?.en === 'Safekeeping' || c?.en === 'As Removed') && (
                        <span className="text-xs text-muted-foreground italic">
                            - {row.original.aircraft ? row.original.aircraft.acronym : 'N/A'}
                        </span>
                    )}
                </div>
            );
        },
    },

    {
        accessorKey: "status",
        sortingFn: textSortingFn((row) => formatStatusLabel(row.status ?? "")),
        // Un mismo filtro cubre dos campos: los subestados de calibración viven
        // en tools.status, el resto en articles.status.
        filterFn: (row, _id, value) => {
            const raw = String(value ?? "").trim();
            if (!raw) return true;

            const toolStatus = parseToolStatusFilter(raw);

            const matches = (article: IArticleSimple) =>
                toolStatus
                    ? String(article.tool?.status ?? "").trim().toUpperCase() ===
                      toolStatus.toUpperCase()
                    : String(article.status ?? "").trim().toUpperCase() ===
                      raw.toUpperCase();

            return row.original.__isGroup
                ? (row.original.subRows ?? []).some(matches)
                : matches(row.original);
        },
        header: ({ column }) => (
            <StatusColumnHeader
                column={column}
                value={statusFilter}
                onValueChange={onStatusFilterChange}
                showToolStatuses={showToolStatuses}
            />
        ),
        cell: ({ row }) => {
            if (row.original.__isGroup) {
                return (
                    <div className="flex justify-center">
                        <Badge variant="outline" className="text-xs">
                            <p>
                                GRUPO{" "}
                                <span className="text-xs text-muted-foreground">
                                    ({row.original.__groupCount ?? 0})
                                </span>
                            </p>
                        </Badge>
                    </div>
                );
            }

            const calibrating = row.original.tool?.status === "IN_CALIBRATION";
            const status = row.original.status?.toUpperCase();
            const badge = getStatusBadge(status);

            return (
                <div className="flex flex-col justify-center items-center space-y-2">
                    {!calibrating &&
                        (tracksStatusSince(status) ? (
                            <ArticleStatusSincePopover
                                statusLabel={statusOptionLabel(status ?? "")}
                                statusSince={row.original.status_since}
                            >
                                {badge}
                            </ArticleStatusSincePopover>
                        ) : (
                            badge
                        ))}

                    {row.original.tool && <StatusCellWithPopover tool={row.original} />}
                </div>
            );
        },
    },
    {
        accessorKey: "zone",
        sortingFn: textSortingFn((row) => row.zone),
        // La ubicación vive en el artículo, no en el grupo: la fila agrupada
        // muestra "—" pero debe quedarse si alguno de sus artículos calza.
        filterFn: (row, _id, value) => {
            const raw = String(value ?? "").trim();
            if (!raw) return true;

            return row.original.__isGroup
                ? (row.original.subRows ?? []).some((a) => zoneMatches(a.zone, raw))
                : zoneMatches(row.original.zone, raw);
        },
        header: ({ column }) => (
            <DataTableColumnHeader
                filter
                column={column}
                title="Ubicación"
                filterHint="Por tramo: C-1, A-2, A-2-1. También sirve 'C1' o 'a 2'."
            />
        ),
        cell: ({ row }) => (
            <div className="text-center font-medium text-sm">
                {row.original.__isGroup ? (
                    <span className="text-muted-foreground italic">—</span>
                ) : row.original.zone ? (
                    row.original.zone
                ) : (
                    <span className="text-muted-foreground">Sin asignar</span>
                )}
            </div>
        ),
    },
];

// COMPONENTE (sin cantidad)
export const buildComponenteCols = (
    statusFilter?: string,
    onStatusFilterChange?: (value: string | undefined) => void,
    showQuantity = true,
): ColumnDef<IArticleSimple>[] => [
    ...buildBaseCols(statusFilter, onStatusFilterChange),
    ...(showQuantity ? [quantityCol] : []),
    actionsCol,
];

// CONSUMIBLE (con cantidad)
export const buildConsumibleCols = (
    statusFilter?: string,
    onStatusFilterChange?: (value: string | undefined) => void,
): ColumnDef<IArticleSimple>[] => [
    ...buildBaseCols(statusFilter, onStatusFilterChange),
    quantityCol,
    {
        id: "expiration_date",
        sortingFn: dateSortingFn((row) => toDate(row.consumable?.expiration_date)),
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Proximo Vencimiento" />
        ),
        cell: ({ row }) => {
            if (row.original.__isGroup) {
                return (
                    <div className="text-center">
                        <span className="text-muted-foreground italic">—</span>
                    </div>
                );
            }

            const caducateDate = row.original.consumable?.expiration_date;
            if (!caducateDate) {
                return (
                    <div className="text-center">
                        <span className="text-muted-foreground italic">N/A</span>
                    </div>
                );
            }

            const date =
                caducateDate instanceof Date
                    ? caducateDate
                    : typeof caducateDate === "string"
                        ? parseDateLocal(caducateDate)
                        : null;

            if (!date || isNaN(date.getTime())) {
                return (
                    <div className="text-center">
                        <span className="text-muted-foreground italic">N/A</span>
                    </div>
                );
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            date.setHours(0, 0, 0, 0);
            const daysUntilExpiry = Math.ceil(
                (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            );

            let variant: "default" | "secondary" | "destructive" | "outline" =
                "default";
            if (daysUntilExpiry < 0) variant = "destructive";
            else if (daysUntilExpiry <= 30) variant = "secondary";

            return (
                <div className="text-center">
                    <Badge variant={variant} className="text-sm font-medium">
                        {format(date, "dd/MM/yyyy") === "01/01/1900"
                            ? "N/A"
                            : format(date, "dd/MM/yyyy")}
                    </Badge>
                </div>
            );
        },
    },
    {
        id: "shelf_life",
        sortingFn: dateSortingFn((row) => toDate(row.consumable?.shelf_life)),
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Shelf Life" />
        ),
        cell: ({ row }) => {
            if (row.original.__isGroup) {
                return (
                    <div className="text-center">
                        <span className="text-muted-foreground italic">—</span>
                    </div>
                );
            }

            const shelf_date = row.original.consumable?.shelf_life;
            if (!shelf_date) {
                return (
                    <div className="text-center">
                        <span className="text-muted-foreground italic">N/A</span>
                    </div>
                );
            }

            const date =
                shelf_date instanceof Date
                    ? shelf_date
                    : typeof shelf_date === "string"
                        ? parseDateLocal(shelf_date)
                        : null;

            if (!date || isNaN(date.getTime())) {
                return (
                    <div className="text-center">
                        <span className="text-muted-foreground italic">N/A</span>
                    </div>
                );
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            date.setHours(0, 0, 0, 0);
            const daysUntilExpiry = Math.ceil(
                (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            );

            let variant: "default" | "secondary" | "destructive" | "outline" =
                "default";
            if (daysUntilExpiry < 0) variant = "destructive";
            else if (daysUntilExpiry <= 30) variant = "secondary";

            return (
                <div className="text-center">
                    <Badge variant={variant} className="text-sm font-medium">
                        {format(date, "dd/MM/yyyy") === "01/01/1900"
                            ? "N/A"
                            : format(date, "dd/MM/yyyy")}
                    </Badge>
                </div>
            );
        },
    },
    actionsCol,
];

// HERRAMIENTA (sin cantidad)
export const buildHerramientaCols = (
    statusFilter?: string,
    onStatusFilterChange?: (value: string | undefined) => void,
): ColumnDef<IArticleSimple>[] => [
    ...buildBaseCols(statusFilter, onStatusFilterChange, true),
    {
        id: "model",
        accessorFn: (row) => row.tool?.model ?? "",
        sortingFn: textSortingFn((row) => row.tool?.model),
        header: ({ column }) => (
            <DataTableColumnHeader filter column={column} title="Modelo" />
        ),
        cell: ({ row }) => (
            <div className="text-center text-sm font-bold text-muted-foreground">
                {row.original.tool?.model ?? 'N/A'}
            </div>
        ),
    },
    {
        id: "calibration_date",
        accessorFn: (row) => row.tool?.calibration_date ?? "",
        sortingFn: dateSortingFn((row) =>
            row.tool?.calibration_date ? parseDateLocal(row.tool.calibration_date) : null,
        ),
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Fech. Calibración" />
        ),
        cell: ({ row }) => (
            <div className="text-center text-sm font-bold text-muted-foreground">
                {row.original.__isGroup
                    ? "—"
                    : row.original.tool?.calibration_date
                        ? format(
                            parseDateLocal(row.original.tool.calibration_date),
                            "dd/MM/yyyy",
                        )
                        : "N/A"}
            </div>
        ),
    },
    {
        id: "next_calibration",
        sortingFn: dateSortingFn((row) =>
            row.tool?.next_calibration && row.tool.calibration_date
                ? addDays(
                    parseDateLocal(row.tool.calibration_date),
                    Number(row.tool.next_calibration),
                )
                : null,
        ),
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Prox. Cal." />
        ),
        cell: ({ row }) => {
            if (row.original.__isGroup) {
                return (
                    <div className="text-center text-sm font-bold text-muted-foreground">
                        —
                    </div>
                );
            }

            return (
                <div className="text-center text-sm font-bold text-muted-foreground">
                    {row.original.tool?.next_calibration &&
                        row.original.tool.calibration_date
                        ? format(
                            addDays(
                                parseDateLocal(row.original.tool.calibration_date),
                                Number(row.original.tool.next_calibration),
                            ),
                            "dd/MM/yyyy",
                        )
                        : "N/A"}
                </div>
            );
        },
    },
    actionsCol,
];

// ALL (con cantidad porque mezcla categorías)
export const buildAllCategoriesCols = (
    statusFilter?: string,
    onStatusFilterChange?: (value: string | undefined) => void,
): ColumnDef<IArticleSimple>[] => [
    // "Todos" mezcla categorías, así que también trae herramientas: el selector
    // de estado necesita sus subestados de calibración.
    ...buildBaseCols(statusFilter, onStatusFilterChange, true),
    quantityCol,
    actionsCol,
];

export const getColumnsByCategory = (
    cat: "all" | "COMPONENT" | "PART" | "CONSUMABLE" | "TOOL",
    statusFilter?: string,
    onStatusFilterChange?: (value: string | undefined) => void,
    showQuantity = true,
): ColumnDef<IArticleSimple>[] => {
    if (cat === "TOOL") return buildHerramientaCols(statusFilter, onStatusFilterChange);
    if (cat === "CONSUMABLE") return buildConsumibleCols(statusFilter, onStatusFilterChange);
    if (cat === "COMPONENT") return buildComponenteCols(statusFilter, onStatusFilterChange, showQuantity);
    if (cat === "PART") return buildComponenteCols(statusFilter, onStatusFilterChange, showQuantity);
    return buildAllCategoriesCols(statusFilter, onStatusFilterChange);
};

/**
 * Agrupa artículos CONSECUTIVOS con la misma clave. A diferencia de
 * groupByPartNumber, respeta el orden en que llegó la lista — necesario cuando
 * el servidor ya la ordenó.
 */
export function groupSequentially(
    list: IArticleSimple[],
    keyOf: (article: IArticleSimple) => string | number,
) {
    const result: IArticleSimple[] = [];
    let bucket: IArticleSimple[] = [];
    let currentKey: string | number | null = null;

    const flush = () => {
        if (!bucket.length) return;
        result.push(
            bucket.length === 1
                ? bucket[0]
                : { ...bucket[0], __isGroup: true, __groupCount: bucket.length, subRows: bucket },
        );
        bucket = [];
    };

    for (const item of list) {
        const key = keyOf(item);
        if (currentKey !== null && key !== currentKey) flush();
        currentKey = key;
        bucket.push(item);
    }

    flush();
    return result;
}

export function groupByPartNumber(list: IArticleSimple[]) {
    const byPn: Record<string, IArticleSimple[]> = {};

    for (const item of list) {
        const pn = (item.part_number || "").trim();
        if (!pn) continue;
        if (!byPn[pn]) byPn[pn] = [];
        byPn[pn].push(item);
    }

    const result: IArticleSimple[] = [];

    for (const pn of Object.keys(byPn)) {
        const items = byPn[pn];

        if (items.length <= 1) {
            result.push(items[0]);
            continue;
        }

        const first = items[0];
        result.push({
            ...first,
            __isGroup: true,
            __groupCount: items.length,
            subRows: items,
        });
    }

    return result;
}
