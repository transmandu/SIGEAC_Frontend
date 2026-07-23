"use client"

import { ContentLayout } from "@/components/layout/ContentLayout"
import BackButton from "@/components/misc/BackButton"
import LoadingPage from "@/components/misc/LoadingPage"
import { Badge } from "@/components/ui/badge"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    useGetDuplicateCandidates,
    useGetSupervisorGeneralArticles,
} from "@/hooks/supervisor/useSupervisorGeneralArticles"
import { useCompanyStore } from "@/stores/CompanyStore"
import type { SupervisorGeneralArticle } from "@/types/supervisor"
import { History, ListChecks, Merge, PackageX } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { ArticleSelectionTable } from "./_components/ArticleSelectionTable"
import { ArticleTimelineDialog } from "./_components/ArticleTimelineDialog"
import { BulkEditDialog } from "./_components/BulkEditDialog"
import { DuplicateSuggestions } from "./_components/DuplicateSuggestions"
import { EditArticleDialog } from "./_components/EditArticleDialog"
import { MergeDialog } from "./_components/MergeDialog"
import SupervisorActionButton from "./_components/SupervisorActionButton"

/**
 * SUPERVISAR ARTÍCULOS GENERALES — exclusivo de SUPERUSER.
 *
 * Existe para sanear el inventario que el flujo de compras ensucia: cuando una
 * entrega se confirma, el backend exige coincidencia exacta en descripción,
 * variante, marca, unidad y almacén, así que una diferencia de escritura en la
 * marca o una unidad distinta crean un artículo nuevo en vez de sumar stock.
 *
 * Las sugerencias automáticas van primero por comodidad, pero el inventario
 * completo está siempre disponible: el supervisor puede agrupar y fusionar
 * cualquier conjunto de artículos aunque el detector no los haya relacionado.
 */
export default function SupervisarArticulosGeneralesPage() {
    const { selectedCompany } = useCompanyStore()
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [mergeOpen, setMergeOpen] = useState(false)
    /**
     * La selección la puso una sugerencia, no el usuario a mano. Al cerrar el
     * asistente sin fusionar hay que descartarla: fue un atajo del propio
     * diálogo, no una elección deliberada que convenga conservar. Una selección
     * hecha a mano en el inventario sí sobrevive a cancelar.
     */
    const [selectionFromSuggestion, setSelectionFromSuggestion] = useState(false)
    const [bulkEditOpen, setBulkEditOpen] = useState(false)
    // Artículo sobre el que actúan los diálogos de una sola fila.
    const [editing, setEditing] = useState<SupervisorGeneralArticle | null>(null)
    const [timelineOf, setTimelineOf] = useState<SupervisorGeneralArticle | null>(null)

    const { data: articles, isLoading, isError } = useGetSupervisorGeneralArticles()
    const { data: candidates } = useGetDuplicateCandidates()

    const selectedArticles = useMemo(
        () => (articles ?? []).filter((article) => selectedIds.includes(article.id)),
        [articles, selectedIds],
    )

    const toggle = (id: number) => {
        setSelectedIds((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        )

        // Tocar la selección a mano la vuelve deliberada, aunque partiera de una
        // sugerencia: desde aquí ya no debe descartarse al cancelar.
        setSelectionFromSuggestion(false)
    }

    if (isLoading) return <LoadingPage />

    return (
        <ContentLayout title="Supervisar Artículos Generales">
            <div className="flex flex-col gap-6">

                {/* ── Breadcrumb ──────────────────────────────────────────── */}
                <div className="flex items-center gap-3">
                    <BackButton iconOnly tooltip="Volver" variant="secondary" />

                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                                    Inicio
                                </BreadcrumbLink>
                            </BreadcrumbItem>

                            <BreadcrumbSeparator />

                            <BreadcrumbItem>Supervisor</BreadcrumbItem>

                            <BreadcrumbSeparator />

                            <BreadcrumbItem>
                                <BreadcrumbPage>Artículos Generales</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="flex flex-col gap-2 border-b border-border/60 pb-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                        <div className="flex flex-col min-w-0 w-full">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight min-w-0 break-words">
                                    Artículos Generales
                                </h1>

                                {!!candidates?.length && (
                                    <Badge className="rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-sky-700 shadow-sm select-none hover:bg-sky-500/15 dark:text-sky-300 dark:hover:text-sky-200">
                                        {candidates.length} POSIBLES DUPLICADOS
                                    </Badge>
                                )}
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Supervisión de inventario · fusione duplicados y consolide stock,
                                conversiones e historial de costo. Toda fusión se puede deshacer.
                            </p>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center gap-2 shrink-0">
                            <SupervisorActionButton emphasis="subtle" asChild>
                                <Link
                                    href={`/${selectedCompany?.slug}/supervisor/articulos_generales/fusiones`}
                                >
                                    <History className="mr-2 size-4" />
                                    Historial
                                </Link>
                            </SupervisorActionButton>

                            <SupervisorActionButton
                                emphasis="subtle"
                                disabled={selectedIds.length < 1}
                                onClick={() => setBulkEditOpen(true)}
                            >
                                <ListChecks className="mr-2 size-4" />
                                Editar
                                {selectedIds.length > 0 && ` (${selectedIds.length})`}
                            </SupervisorActionButton>

                            <SupervisorActionButton
                                emphasis="primary"
                                disabled={selectedIds.length < 2}
                                onClick={() => setMergeOpen(true)}
                            >
                                <Merge className="mr-2 size-4" />
                                Fusionar
                                {selectedIds.length > 0 && ` (${selectedIds.length})`}
                            </SupervisorActionButton>
                        </div>
                    </div>
                </div>

                {/* ── Contenido ───────────────────────────────────────────── */}
                {isError ? (
                    <div className="relative rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 p-5 shadow-sm">
                        <div className="min-h-[140px] flex items-center justify-center">
                            <div className="flex flex-col items-center gap-1.5 text-muted-foreground/60 select-none">
                                <PackageX className="size-4 opacity-60" />
                                <span className="text-[11px] tracking-widest uppercase">
                                    No se pudieron cargar los artículos
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Tabs defaultValue="sugerencias" className="flex flex-col gap-4">
                        <TabsList className="w-fit">
                            <TabsTrigger value="sugerencias" className="text-xs">
                                Sugerencias
                                {!!candidates?.length && (
                                    <span className="ml-1.5 tabular-nums text-muted-foreground">
                                        {candidates.length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="inventario" className="text-xs">
                                Inventario completo
                                <span className="ml-1.5 tabular-nums text-muted-foreground">
                                    {articles?.length ?? 0}
                                </span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="sugerencias" className="mt-0">
                            <DuplicateSuggestions
                                groups={candidates ?? []}
                                onSelectGroup={(ids) => {
                                    setSelectedIds(ids)
                                    setSelectionFromSuggestion(true)
                                    setMergeOpen(true)
                                }}
                            />
                        </TabsContent>

                        <TabsContent value="inventario" className="mt-0">
                            <ArticleSelectionTable
                                articles={articles ?? []}
                                selectedIds={selectedIds}
                                onToggle={toggle}
                                onEdit={setEditing}
                                onViewTimeline={setTimelineOf}
                            />
                        </TabsContent>
                    </Tabs>
                )}
            </div>

            <MergeDialog
                open={mergeOpen}
                onOpenChange={(open) => {
                    setMergeOpen(open)

                    // Al cerrar sin fusionar, la selección que vino de una
                    // sugerencia se descarta; la hecha a mano se conserva.
                    if (!open && selectionFromSuggestion) {
                        setSelectedIds([])
                        setSelectionFromSuggestion(false)
                    }
                }}
                articles={selectedArticles}
                onMerged={() => {
                    setSelectedIds([])
                    setSelectionFromSuggestion(false)
                }}
            />

            {/* La edición masiva solo se abre desde una selección hecha a mano,
                así que cancelar la conserva: descartarla obligaría a volver a
                marcar los artículos uno por uno. */}
            <BulkEditDialog
                open={bulkEditOpen}
                onOpenChange={setBulkEditOpen}
                articles={selectedArticles}
                onDone={() => setSelectedIds([])}
            />

            <EditArticleDialog
                open={!!editing}
                onOpenChange={(open) => !open && setEditing(null)}
                article={editing}
            />

            <ArticleTimelineDialog
                open={!!timelineOf}
                onOpenChange={(open) => !open && setTimelineOf(null)}
                article={timelineOf}
            />
        </ContentLayout>
    )
}
