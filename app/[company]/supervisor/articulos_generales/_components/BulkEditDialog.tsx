"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits"
import { useBulkEditArticles } from "@/hooks/supervisor/useSupervisorGeneralArticles"
import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/stores/CompanyStore"
import type { BulkEditRow, BulkTextField, SupervisorGeneralArticle } from "@/types/supervisor"
import { ArrowRight, ListChecks, Loader2, Wand2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { DecimalInput } from "./DecimalInput"
import SupervisorActionButton from "./SupervisorActionButton"
import { dependencyBadgeCls } from "./utils/uiHelpers"

const TEXT_FIELDS: { key: BulkTextField; label: string }[] = [
    { key: "description", label: "Descripción" },
    { key: "brand_model", label: "Marca / Modelo" },
    { key: "variant_type", label: "Variante" },
]

/** Estado editable de una fila. Todo string: se normaliza al guardar. */
type DraftRow = {
    id: number
    description: string
    brand_model: string
    variant_type: string
    minimum_quantity: string
    quantity: string
    primary_unit_id: number | null
}

/**
 * Edición masiva: una tabla con los artículos seleccionados, editables celda a
 * celda.
 *
 * El buscar-y-reemplazar es una herramienta para RELLENAR esas celdas de golpe,
 * no una regla que se envíe al servidor: aplica el cambio sobre los borradores
 * y el supervisor puede seguir ajustando a mano antes de guardar. Lo que viaja
 * al backend son siempre los valores finales que se ven en pantalla, así que lo
 * guardado nunca puede diferir de lo mostrado.
 */
export function BulkEditDialog({
    open,
    onOpenChange,
    articles,
    onDone,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    articles: SupervisorGeneralArticle[]
    onDone: () => void
}) {
    const [rows, setRows] = useState<DraftRow[]>([])
    const [stockUnlocked, setStockUnlocked] = useState(false)

    const { selectedCompany } = useCompanyStore()
    const { data: units } = useGetUnits(selectedCompany?.slug)
    const { bulkEditArticles } = useBulkEditArticles()

    useEffect(() => {
        if (!open) return

        setRows(
            articles.map((article) => ({
                id: article.id,
                description: article.description ?? "",
                brand_model: article.brand_model ?? "",
                variant_type: article.variant_type ?? "",
                minimum_quantity:
                    article.minimum_quantity != null ? String(article.minimum_quantity) : "",
                quantity: String(article.quantity ?? ""),
                primary_unit_id: article.primary_unit_id,
            })),
        )
        setStockUnlocked(false)
    }, [open, articles])

    /** Valores originales, para resaltar qué celdas cambiaron. */
    const originals = useMemo(
        () => new Map(articles.map((article) => [article.id, article])),
        [articles],
    )

    const changedCount = useMemo(
        () =>
            rows.filter((row) => {
                const original = originals.get(row.id)
                if (!original) return false

                const textChanged =
                    row.description !== (original.description ?? "") ||
                    row.brand_model !== (original.brand_model ?? "") ||
                    row.variant_type !== (original.variant_type ?? "") ||
                    row.minimum_quantity !==
                        (original.minimum_quantity != null ? String(original.minimum_quantity) : "")

                const stockChanged =
                    stockUnlocked &&
                    (Number(row.quantity) !== Number(original.quantity) ||
                        row.primary_unit_id !== original.primary_unit_id)

                return textChanged || stockChanged
            }).length,
        [rows, originals, stockUnlocked],
    )

    const updateCell = (id: number, field: keyof DraftRow, value: string | number | null) =>
        setRows((current) =>
            current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
        )

    const handleSave = async () => {
        const payload: BulkEditRow[] = rows.map((row) => ({
            id: row.id,
            description: row.description.trim(),
            brand_model: row.brand_model.trim() || null,
            variant_type: row.variant_type.trim() || null,
            minimum_quantity: row.minimum_quantity === "" ? null : Number(row.minimum_quantity),
            // Solo si el supervisor desbloqueó la columna: omitir y enviar null
            // no significan lo mismo para el backend.
            ...(stockUnlocked
                ? {
                      quantity: Number(row.quantity),
                      primary_unit_id: row.primary_unit_id ?? undefined,
                  }
                : {}),
        }))

        await bulkEditArticles.mutateAsync({ articles: payload })
        onOpenChange(false)
        onDone()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b border-border/60 pb-4">
                    <DialogTitle className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2.5">
                        <ListChecks className="size-5 text-muted-foreground/70" />
                        Editar {articles.length} artículo(s)
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Edite cada artículo directamente en la tabla. Use buscar y reemplazar para
                        corregir un error repetido de golpe y ajuste después lo que haga falta.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-1">
                    <FindReplaceBar
                        onApply={(field, search, replace) =>
                            setRows((current) =>
                                current.map((row) => ({
                                    ...row,
                                    [field]: replaceInsensitive(row[field], search, replace),
                                })),
                            )
                        }
                    />

                    {/* ── Tabla editable ──────────────────────────────────── */}
                    <div className="rounded-xl border border-border/60 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/40">
                                    <tr>
                                        {TEXT_FIELDS.map((field) => (
                                            <th
                                                key={field.key}
                                                className="text-left px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 select-none"
                                            >
                                                {field.label}
                                            </th>
                                        ))}
                                        <th className="text-left px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 select-none w-24">
                                            Mínimo
                                        </th>
                                        <th
                                            colSpan={2}
                                            className="text-left px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 select-none"
                                        >
                                            <div className="flex items-center gap-2">
                                                Existencia
                                                {!stockUnlocked && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                                                        onClick={() => setStockUnlocked(true)}
                                                    >
                                                        Habilitar
                                                    </Button>
                                                )}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row) => {
                                        const original = originals.get(row.id)

                                        return (
                                            <tr
                                                key={row.id}
                                                className="border-t border-border/50 hover:bg-muted/20"
                                            >
                                                {TEXT_FIELDS.map((field) => (
                                                    <td key={field.key} className="px-2 py-1.5">
                                                        <Input
                                                            value={row[field.key]}
                                                            onChange={(event) =>
                                                                updateCell(
                                                                    row.id,
                                                                    field.key,
                                                                    event.target.value,
                                                                )
                                                            }
                                                            className={cn(
                                                                "h-8 min-w-[150px] bg-background/70 border-border/60",
                                                                row[field.key] !==
                                                                    (original?.[field.key] ?? "") &&
                                                                    "border-sky-400/60 bg-sky-500/[0.06]",
                                                            )}
                                                        />
                                                    </td>
                                                ))}

                                                <td className="px-2 py-1.5">
                                                    <DecimalInput
                                                        value={row.minimum_quantity}
                                                        onValueChange={(value) =>
                                                            updateCell(
                                                                row.id,
                                                                "minimum_quantity",
                                                                value,
                                                            )
                                                        }
                                                        className="h-8 w-20 bg-background/70 border-border/60"
                                                    />
                                                </td>

                                                <td className="px-2 py-1.5">
                                                    {stockUnlocked ? (
                                                        <DecimalInput
                                                            value={row.quantity}
                                                            onValueChange={(value) =>
                                                                updateCell(row.id, "quantity", value)
                                                            }
                                                            className="h-8 w-24 bg-background/70 border-border/60"
                                                        />
                                                    ) : (
                                                        <span className="tabular-nums text-muted-foreground/70">
                                                            {Number(row.quantity).toFixed(2)}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-2 py-1.5">
                                                    {stockUnlocked ? (
                                                        <Select
                                                            value={String(row.primary_unit_id ?? "")}
                                                            onValueChange={(value) =>
                                                                updateCell(
                                                                    row.id,
                                                                    "primary_unit_id",
                                                                    Number(value),
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="h-8 w-[120px] text-xs bg-background/70 border-border/60">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {(units ?? []).map((unit) => (
                                                                    <SelectItem
                                                                        key={unit.id}
                                                                        value={String(unit.id)}
                                                                        className="text-xs"
                                                                    >
                                                                        {unit.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <span className="text-muted-foreground/70 text-xs">
                                                            {original?.general_primary_unit?.label ??
                                                                "—"}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {stockUnlocked && (
                        <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                            Está editando stock real. Cambiar la unidad{" "}
                            <strong className="text-foreground/80">no</strong> reconvierte la
                            cantidad: ajuste ambas para que reflejen la existencia física.
                        </p>
                    )}
                </div>

                <DialogFooter className="gap-2 border-t border-border/60 pt-4 sm:items-center">
                    <span className="mr-auto text-[11px] text-muted-foreground text-left">
                        {changedCount > 0
                            ? `${changedCount} artículo(s) con cambios`
                            : "Sin cambios"}
                    </span>

                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>

                    <SupervisorActionButton
                        emphasis="primary"
                        onClick={handleSave}
                        disabled={changedCount === 0 || bulkEditArticles.isPending}
                    >
                        {bulkEditArticles.isPending && (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        )}
                        Guardar cambios
                    </SupervisorActionButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

/**
 * Herramienta de relleno: aplica un buscar-y-reemplazar sobre los borradores de
 * la tabla. No envía nada — solo escribe en las celdas, que siguen siendo
 * editables a mano.
 */
function FindReplaceBar({
    onApply,
}: {
    onApply: (field: BulkTextField, search: string, replace: string) => void
}) {
    const [field, setField] = useState<BulkTextField>("description")
    const [search, setSearch] = useState("")
    const [replace, setReplace] = useState("")

    const canApply = !!search.trim()

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
            <Wand2 className="size-3.5 text-muted-foreground/50 shrink-0" />

            <Select value={field} onValueChange={(value) => setField(value as BulkTextField)}>
                <SelectTrigger className="h-8 w-[150px] text-xs bg-background border-border/60">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {TEXT_FIELDS.map((item) => (
                        <SelectItem key={item.key} value={item.key} className="text-xs">
                            {item.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Input
                placeholder="Buscar..."
                className="h-8 w-40 bg-background border-border/60"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
            />

            <ArrowRight className="size-3.5 text-muted-foreground/40 shrink-0" />

            <Input
                placeholder="Reemplazar por..."
                className="h-8 w-40 bg-background border-border/60"
                value={replace}
                onChange={(event) => setReplace(event.target.value)}
            />

            <Button
                variant="ghost"
                size="sm"
                className="h-8 text-muted-foreground hover:text-foreground"
                disabled={!canApply}
                onClick={() => onApply(field, search, replace)}
            >
                Aplicar a la tabla
            </Button>

            <span className={cn(dependencyBadgeCls(), "ml-auto")}>
                Rellena las celdas · aún puede editarlas
            </span>
        </div>
    )
}

/**
 * Reemplazo insensible a mayúsculas: los duplicados por mal tipeo suelen
 * mezclar ambas formas. Escapa el patrón porque el texto viene del usuario.
 */
function replaceInsensitive(value: string, search: string, replace: string): string {
    if (!search) return value

    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

    return value.replace(new RegExp(escaped, "gi"), replace)
}
