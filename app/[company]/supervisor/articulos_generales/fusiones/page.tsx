"use client"

import { ContentLayout } from "@/components/layout/ContentLayout"
import BackButton from "@/components/misc/BackButton"
import LoadingPage from "@/components/misc/LoadingPage"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useGetMergeHistory, useUndoMerge } from "@/hooks/supervisor/useSupervisorGeneralArticles"
import { useCompanyStore } from "@/stores/CompanyStore"
import type { GeneralArticleMerge } from "@/types/supervisor"
import { History, Undo2, User } from "lucide-react"
import SupervisorActionButton from "../_components/SupervisorActionButton"
import {
    dependencyBadgeCls,
    formatQuantity,
    formatSupervisorDateTime,
    mergeStatusBadgeCls,
} from "../_components/utils/uiHelpers"

/**
 * Historial de fusiones de artículos generales.
 *
 * Cada fila conserva el snapshot del estado previo, así que una fusión
 * equivocada se revierte desde aquí: los artículos absorbidos se restauran y
 * cada entrada, cambio de costo, conversión y despacho vuelve a su artículo
 * original.
 */
export default function HistorialFusionesPage() {
    const { selectedCompany } = useCompanyStore()
    const { data: merges, isLoading, isError } = useGetMergeHistory()

    if (isLoading) return <LoadingPage />

    return (
        <ContentLayout title="Historial de Fusiones">
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

                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    href={`/${selectedCompany?.slug}/supervisor/articulos_generales`}
                                >
                                    Artículos Generales
                                </BreadcrumbLink>
                            </BreadcrumbItem>

                            <BreadcrumbSeparator />

                            <BreadcrumbItem>
                                <BreadcrumbPage>Fusiones</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="flex flex-col gap-2 border-b border-border/60 pb-4">
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                        Historial de Fusiones
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Cada fusión conserva el estado previo y puede deshacerse.
                    </p>
                </div>

                {/* ── Listado ─────────────────────────────────────────────── */}
                {isError ? (
                    <EmptyState message="No se pudo cargar el historial" />
                ) : (merges ?? []).length === 0 ? (
                    <EmptyState message="Aún no se ha realizado ninguna fusión" />
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {(merges ?? []).map((merge) => (
                            <MergeCard key={merge.id} merge={merge} />
                        ))}
                    </div>
                )}
            </div>
        </ContentLayout>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="relative rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 p-5 shadow-sm">
            <div className="min-h-[140px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground/60 select-none">
                    <History className="size-4 opacity-60" />
                    <span className="text-[11px] tracking-widest uppercase">{message}</span>
                </div>
            </div>
        </div>
    )
}

function MergeCard({ merge }: { merge: GeneralArticleMerge }) {
    const { undoMerge } = useUndoMerge()
    const isUndone = !!merge.undone_at
    const final = merge.resolution?.final

    return (
        <div className="relative rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 shadow-sm overflow-hidden">

            {/* Encabezado */}
            <div className="flex items-center gap-3 px-5 pt-4 pb-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="truncate text-sm font-medium">
                            {final?.description ?? merge.survivor?.description ?? "—"}
                        </span>
                        <Badge className={mergeStatusBadgeCls(isUndone)}>
                            {isUndone ? "DESHECHA" : "APLICADA"}
                        </Badge>
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground/70 mt-0.5">
                        {final?.brand_model || "Sin marca"}
                        {final?.variant_type ? ` · ${final.variant_type}` : ""}
                    </div>
                </div>

                {!isUndone && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <SupervisorActionButton emphasis="subtle" className="h-9 shrink-0">
                                <Undo2 className="mr-2 size-4" />
                                Deshacer
                            </SupervisorActionButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Deshacer esta fusión?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Se restaurarán los {merge.absorbed_ids.length} artículos absorbidos
                                    y cada entrada, cambio de costo, conversión y despacho volverá a su
                                    artículo original. Las cantidades regresarán a los valores que
                                    tenían antes de la fusión.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => undoMerge.mutate({ id: merge.id })}>
                                    Deshacer fusión
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-5 pb-4">
                <MetaCell label="Absorbidos" value={String(merge.absorbed_ids.length)} />
                <MetaCell
                    label="Cantidad final"
                    value={final?.quantity != null ? formatQuantity(final.quantity) : "—"}
                    tabular
                />
                <MetaCell label="Fusionado por" value={merge.merged_by} icon={User} />
                <MetaCell label="Fecha" value={formatSupervisorDateTime(merge.merged_at)} />
            </div>

            {/* Pie: rastro de reversión */}
            {isUndone && (
                <div className="flex items-center gap-2 px-5 py-2.5 border-t border-border/50 bg-muted/20">
                    <span className={dependencyBadgeCls()}>
                        Deshecha por {merge.undone_by} · {formatSupervisorDateTime(merge.undone_at)}
                    </span>
                </div>
            )}
        </div>
    )
}

function MetaCell({
    label,
    value,
    icon: Icon,
    tabular,
}: {
    label: string
    value: string
    icon?: React.ElementType
    tabular?: boolean
}) {
    return (
        <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 select-none">
                {label}
            </span>
            <span
                className={`text-sm font-medium flex items-center gap-1.5 truncate ${tabular ? "tabular-nums" : ""}`}
            >
                {Icon && <Icon className="size-3.5 text-muted-foreground/50 shrink-0" />}
                {value}
            </span>
        </div>
    )
}
