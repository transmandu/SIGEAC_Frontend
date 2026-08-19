"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { SupervisorGeneralArticle } from "@/types/supervisor"
import { History, PackageSearch, PencilLine, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { dependencyBadgeCls, formatQuantity } from "./utils/uiHelpers"

/**
 * Inventario COMPLETO de artículos generales con selección libre.
 *
 * Deliberadamente no filtra por sospecha de duplicado: las sugerencias
 * automáticas son una ayuda de arranque, pero el supervisor tiene que poder
 * agrupar y fusionar cualquier conjunto de artículos aunque el detector no los
 * haya relacionado.
 */
export function ArticleSelectionTable({
    articles,
    selectedIds,
    onToggle,
    onEdit,
    onViewTimeline,
}: {
    articles: SupervisorGeneralArticle[]
    selectedIds: number[]
    onToggle: (id: number) => void
    onEdit: (article: SupervisorGeneralArticle) => void
    onViewTimeline: (article: SupervisorGeneralArticle) => void
}) {
    const [search, setSearch] = useState("")

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return articles

        return articles.filter((article) =>
            [article.description, article.brand_model, article.variant_type]
                .filter(Boolean)
                .some((field) => field!.toLowerCase().includes(term)),
        )
    }, [articles, search])

    return (
        <div className="flex flex-col gap-4">

            {/* ── Buscador ────────────────────────────────────────────────── */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
                <Input
                    placeholder="Buscar por descripción, marca o variante..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="pl-9 h-9 bg-background/70 border-border/60"
                />
            </div>

            {/* ── Listado ─────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-1.5 max-h-[480px] overflow-y-auto pr-1">
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 py-12 text-muted-foreground/60 select-none">
                        <PackageSearch className="size-4 opacity-60" />
                        <span className="text-[11px] tracking-widest uppercase">
                            Sin resultados
                        </span>
                    </div>
                )}

                {filtered.map((article) => (
                    <ArticleRow
                        key={article.id}
                        article={article}
                        selected={selectedIds.includes(article.id)}
                        onToggle={() => onToggle(article.id)}
                        onEdit={() => onEdit(article)}
                        onViewTimeline={() => onViewTimeline(article)}
                    />
                ))}
            </div>

            {/* ── Pie ─────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground/60 select-none">
                <span>
                    {filtered.length} de {articles.length} artículos
                </span>
                {selectedIds.length > 0 && (
                    <span className="text-foreground/70 font-medium">
                        {selectedIds.length} seleccionados
                    </span>
                )}
            </div>
        </div>
    )
}

/**
 * Fila-tarjeta de artículo. Toda la fila es clicable porque la acción
 * dominante de esta pantalla es seleccionar para fusionar.
 */
function ArticleRow({
    article,
    selected,
    onToggle,
    onEdit,
    onViewTimeline,
}: {
    article: SupervisorGeneralArticle
    selected: boolean
    onToggle: () => void
    onEdit: () => void
    onViewTimeline: () => void
}) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onToggle}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    onToggle()
                }
            }}
            className={cn(
                "group rounded-lg border bg-background/70 px-3 py-2.5 cursor-pointer transition-colors duration-150",
                "hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/30",
                selected
                    ? "border-sky-400/50 bg-sky-500/[0.06] dark:border-sky-300/30"
                    : "border-border/60",
            )}
        >
            <div className="flex items-center gap-3">

                <Checkbox
                    checked={selected}
                    onCheckedChange={onToggle}
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`Seleccionar ${article.description}`}
                    className="shrink-0"
                />

                {/* Identidad */}
                <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                        {article.description}
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground/70">
                        {article.brand_model || "Sin marca"}
                        {article.variant_type ? ` · ${article.variant_type}` : ""}
                    </div>
                </div>

                {/* Dependencias */}
                <DependencyBadges article={article} />

                {/* Cantidad */}
                <div className="flex flex-col items-end shrink-0 min-w-[92px]">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60 select-none">
                        Cantidad
                    </span>
                    <span className="text-sm font-medium tabular-nums">
                        {formatQuantity(article.quantity)}{" "}
                        <span className="text-muted-foreground/70 font-normal">
                            {article.general_primary_unit?.label ?? ""}
                        </span>
                    </span>
                </div>

                {/* Acciones por artículo. stopPropagation en cada una: la fila
                    entera alterna la selección. */}
                <TooltipProvider>
                    <div
                        className="flex items-center gap-0.5 shrink-0"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-foreground"
                                    onClick={onEdit}
                                >
                                    <PencilLine className="size-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar artículo</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-foreground"
                                    onClick={onViewTimeline}
                                >
                                    <History className="size-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver recorrido</TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>
        </div>
    )
}

/**
 * Qué arrastra consigo el artículo si se fusiona. Se muestra antes de decidir
 * porque un artículo con muchas entradas o despachos suele ser el que conviene
 * conservar como superviviente.
 */
function DependencyBadges({ article }: { article: SupervisorGeneralArticle }) {
    const items = [
        { label: "E", value: article.intakes_count, title: "Entradas confirmadas" },
        { label: "C", value: article.cost_changes_count, title: "Cambios de costo" },
        { label: "CV", value: article.conversions_count, title: "Conversiones" },
        { label: "D", value: article.dispatches_count, title: "Despachos" },
    ].filter((item) => item.value > 0)

    if (items.length === 0) {
        return (
            <span className="hidden sm:block shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground/40 select-none">
                Sin dependencias
            </span>
        )
    }

    return (
        <TooltipProvider>
            <div className="hidden sm:flex items-center gap-1 shrink-0">
                {items.map((item) => (
                    <Tooltip key={item.label}>
                        <TooltipTrigger asChild>
                            <span className={dependencyBadgeCls()}>
                                {item.label}:{item.value}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            {item.title}: {item.value}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    )
}
