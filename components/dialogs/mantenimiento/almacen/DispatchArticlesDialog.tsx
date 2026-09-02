"use client"

import * as React from "react"
import Image from "next/image"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ClipboardList, PackageOpen, Hash, Barcode, X, Package } from "lucide-react"
import EvidenceGallery from "@/components/misc/EvidenceGallery"
import { useDeleteDispatchEvidence } from "@/actions/mantenimiento/almacen/solicitudes/salida/action"
import { useCompanyStore } from "@/stores/CompanyStore"


type Article = {
    description?: string
    serial?: string
    dispatch_quantity: string
    part_number?: string
    article_id?: string | number
    unit?: string
    returned_quantity?: number
    status?: "DISPATCHED" | "PARTIALLY_RETURNED" | "RETURNED"
    /** Cómo se entregó el artículo; opcional. */
    evidences?: { id: number; url: string | null }[]
}

/** Cómo se lee el estado de una línea; DISPATCHED no se rotula por ser lo normal. */
const RETURN_LABELS: Record<string, { label: string; className: string }> = {
    PARTIALLY_RETURNED: {
        label: "Devuelto en parte",
        className: "border-amber-500/50 text-amber-600 dark:text-amber-500",
    },
    RETURNED: {
        label: "Devuelto",
        className: "border-emerald-500/50 text-emerald-600 dark:text-emerald-500",
    },
}

interface DispatchArticlesDialogProps {
    articles?: Article[]
    work_order?: string
    justification?: string | null
}

// maximumFractionDigits y no maximumSignificantDigits: este último cuenta
// cifras significativas, no decimales, y mostraba 1500 como "1.5" y 0.6667
// como "0.67". Las cantidades convertidas arrastran decimales largos, así que
// se recortan a 4 sin tocar la parte entera.
function formatQty(value: string) {
    const n = Number(value);

    if (!Number.isFinite(n)) return "0.00";

    return n.toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    });
}

const DispatchArticlesDialog = ({ articles = [], work_order, justification }: DispatchArticlesDialogProps) => {
    const hasArticles = articles.length > 0
    const { selectedCompany } = useCompanyStore()
    const { deleteDispatchEvidence } = useDeleteDispatchEvidence()

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span className="font-medium text-foreground">{articles?.length ?? 0}</span>
                    </div>
                </Button>
            </DialogTrigger>

            <DialogContent className="p-0 overflow-hidden sm:max-w-lg [&>button]:hidden">
                {/* Header */}
                <DialogHeader className="px-6 py-6 border-b space-y-4">
                    {/* Top row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-md border bg-muted/40 p-2"> <ClipboardList className="h-5 w-5" /> </div>
                            <DialogTitle className="text-base font-semibold"> Artículos despachados </DialogTitle>
                        </div>
                        <div className="flex items-center gap-3">
                            <Image
                                src="/h74_logo.png"
                                width={44}
                                height={44}
                                alt="logo"
                                priority
                                className="h-11 w-11 rounded-md border bg-white object-contain"
                            />
                        </div>
                    </div>
                    {/* Metadata row */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div> {work_order ? `WO ${work_order}` : "WO N/A"} </div>
                        <div> {hasArticles ? `${articles.length} ítem(s)` : "Sin artículos"} </div>

                    </div>

                </DialogHeader>

                {/* Body */}
                <div className="px-6 py-4 max-w-full overflow-x-hidden">
                    {!hasArticles ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                            <div className="rounded-full border bg-muted/40 p-3">
                                <PackageOpen className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="truncate text-sm font-medium">Sin artículos</p>
                                <p className="truncate text-sm text-muted-foreground">
                                    Cuando haya despacho, aparecerá la lista aquí.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <ScrollArea className="h-[320px] pr-3 max-w-full">
                                <div className="space-y-2">
                                    {articles.map((a, idx) => {
                                        const key =
                                            a.article_id ??
                                            a.part_number ??
                                            a.serial ??
                                            `${a.description ?? "item"}-${idx}`;

                                        const title =
                                            a.part_number !== "N/A"
                                                ? a.part_number?.trim() ||
                                                a.description?.trim() ||
                                                "Artículo sin identificar"
                                                : a.description?.trim() || "Artículo sin identificar";
                                        const hasPnTitle =
                                            !!a.part_number?.trim() &&
                                            a.part_number?.trim() !== "N/A";

                                        return (
                                            <div
                                                key={key}
                                                className="w-full min-w-0 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/30"
                                            >
                                                <div className="flex items-start justify-between gap-3 min-w-0 w-full">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">
                                                            {title}
                                                        </p>

                                                        {hasPnTitle &&
                                                            a.description?.trim() &&
                                                            a.description !== "N/A" && (
                                                                <p className="mt-1 text-xs text-muted-foreground truncate">
                                                                    {a.description.trim()}
                                                                </p>
                                                            )}
                                                        {(a.part_number || a.serial) && (
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {a.part_number && (
                                                                    <Badge variant="secondary" className="gap-1">
                                                                        <Hash className="h-3.5 w-3.5" />
                                                                        <span className="font-normal">
                                                                            {a.part_number}
                                                                        </span>
                                                                    </Badge>
                                                                )}
                                                                {a.serial && (
                                                                    <Badge variant="secondary" className="gap-1">
                                                                        <Barcode className="h-3.5 w-3.5" />
                                                                        <span className="font-normal">
                                                                            {a.serial}
                                                                        </span>
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex shrink-0 flex-col items-end gap-1.5 whitespace-nowrap">
                                                        <Badge className="text-sm">
                                                            {formatQty(a.dispatch_quantity)}
                                                            {a.unit ? ` ${a.unit}` : ""}
                                                        </Badge>
                                                        {a.status && RETURN_LABELS[a.status] && (
                                                            <Badge
                                                                variant="outline"
                                                                className={RETURN_LABELS[a.status].className}
                                                            >
                                                                {RETURN_LABELS[a.status].label}
                                                                {a.status === "PARTIALLY_RETURNED" && a.returned_quantity
                                                                    ? `: ${a.returned_quantity}`
                                                                    : ""}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {!!a.evidences?.length && (
                                                    <div className="mt-3 border-t pt-3">
                                                        <p className="mb-1.5 text-xs text-muted-foreground">
                                                            Cómo fue entregado
                                                        </p>
                                                        <EvidenceGallery
                                                            images={a.evidences}
                                                            title="Evidencia de entrega"
                                                            onDelete={
                                                                selectedCompany?.slug
                                                                    ? (id) =>
                                                                          deleteDispatchEvidence.mutate({
                                                                              id,
                                                                              company: selectedCompany.slug,
                                                                          })
                                                                    : undefined
                                                            }
                                                            isDeleting={deleteDispatchEvidence.isPending}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t flex items-start justify-between sm:justify-between">
                    {/* Justificación - izquierda */}
                    <div className="flex flex-col text-sm max-w-[70%]">
                        <span className="font-medium text-foreground"> Justificación: </span>
                        <span className="text-muted-foreground italic break-words"> {justification?.trim() || "Sin justificación"} </span>
                    </div>
                    {/* Botón cerrar - derecha */}
                    <DialogClose asChild>
                        <Button variant="outline"> Cerrar </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DispatchArticlesDialog
