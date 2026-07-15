'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
    CheckCircle2,
    Eye,
    FileWarning,
    Loader2,
    MapPin,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCompanyStore } from '@/stores/CompanyStore'
import { useGetArticleById } from '@/hooks/mantenimiento/almacen/articulos/useGetArticleById'
import { EditTransitArticleDialog } from '@/app/[company]/compras/(aeronautico)/en_transito/_components/EditTransitArticleDialog'
import SecureFileViewer from '@/components/library/SecureFileViewer'
import axiosInstance from '@/lib/axios'
import { cn } from '@/lib/utils'
import type { TransitArticle } from '@/types/purchase/in-transit'
import type { ArticleDocument } from '@/types'

const EDIT_ROLES = ['JEFE_ALMACEN', 'ANALISTA_ALMACEN']

const TRANSIT_STATUS_LABELS: Record<string, string> = {
    TRANSIT: 'En tránsito',
    RECEPTION: 'En recepción',
}

const CATEGORY_LABELS: Record<string, string> = {
    CONSUMIBLE: 'Consumible',
    HERRAMIENTA: 'Herramienta',
    COMPONENTE: 'Componente',
    PARTE: 'Parte',
}

type FieldSpec = { label: string; value?: string | number | null; span?: 1 | 2 }

/** Celda tipo "campo de formulario": etiqueta en versalitas arriba, valor en caja abajo. */
function FieldCell({ label, value, span = 1 }: FieldSpec) {
    const isEmpty = value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
    return (
        <div className={cn('border border-border/60 bg-background', span === 2 && 'col-span-2')}>
            <div className="border-b border-border/60 bg-muted/40 px-3 py-1">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                </span>
            </div>
            <div className="px-3 py-2">
                <span className={cn('text-[13px] font-mono leading-tight', isEmpty && 'text-muted-foreground/50')}>
                    {isEmpty ? 'N/A' : value}
                </span>
            </div>
        </div>
    )
}

function FieldGrid({ fields }: { fields: FieldSpec[] }) {
    return (
        <div className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-3">
            {fields.map((f) => (
                <FieldCell key={f.label} {...f} />
            ))}
        </div>
    )
}

function SheetSection({ index, title, children }: { index: number; title: string; children: React.ReactNode }) {
    return (
        <section>
            <div className="flex items-center gap-2 bg-muted/60 px-5 py-1.5">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-sm bg-foreground/80 text-[9px] font-bold text-background">
                    {index}
                </span>
                <h3 className="text-[11px] font-bold uppercase tracking-wider">{title}</h3>
            </div>
            <div className="p-5">{children}</div>
        </section>
    )
}

export function ArticleDetailDialog({ article }: { article: TransitArticle }) {
    const [open, setOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [previewDoc, setPreviewDoc] = useState<ArticleDocument | null>(null)
    const { user } = useAuth()
    const { selectedCompany } = useCompanyStore()

    const status = article.status?.toUpperCase()
    const isReception = status === 'RECEPTION'

    const roles = user?.roles?.map((r) => r.name) ?? []
    const canEdit = isReception && EDIT_ROLES.some((r) => roles.includes(r))

    const { data: full, isLoading } = useGetArticleById(
        open ? String(article.id) : '',
        selectedCompany?.slug
    )

    const location = article.batch?.warehouse?.location
    const requirements = article.document_requirements ?? []
    const category = full?.batch?.category?.toUpperCase()

    const categoryFields: FieldSpec[] | null = (() => {
        if (category === 'HERRAMIENTA' && full?.tool) {
            return [
                { label: 'Serial', value: full.tool.serial },
                { label: 'Modelo', value: full.tool.model },
                { label: '¿Especial?', value: full.tool.isSpecial ? 'Sí' : 'No' },
                { label: '¿Requiere calibración?', value: full.tool.needs_calibration ? 'Sí' : 'No' },
                { label: 'Fecha de calibración', value: full.tool.calibration_date },
                { label: 'Próxima calibración', value: full.tool.next_calibration },
            ]
        }
        if ((category === 'COMPONENTE' || category === 'PARTE') && full?.partComponent) {
            const fields: FieldSpec[] = [
                { label: 'Fecha de fabricación', value: full.partComponent.fabrication_date },
                { label: 'Fecha de expiración', value: full.partComponent.expiration_date },
                {
                    label: 'Shelf life',
                    value: full.partComponent.shelf_life != null
                        ? `${full.partComponent.shelf_life}${full.partComponent.shelf_life_unit ? ` ${full.partComponent.shelf_life_unit}` : ''}`
                        : null,
                },
            ]
            if (category === 'COMPONENTE') {
                fields.push(
                    { label: 'Aeronave', value: full.partComponent.aircraft_id },
                    { label: 'Vida límite (horas)', value: full.partComponent.life_limit_part_hours },
                    { label: 'Vida límite (ciclos)', value: full.partComponent.life_limit_part_cycles },
                    { label: 'Vida límite (calendario)', value: full.partComponent.life_limit_part_calendar },
                    { label: 'Hard time (horas)', value: full.partComponent.hard_time_hours },
                    { label: 'Hard time (ciclos)', value: full.partComponent.hard_time_cycles },
                    { label: 'Hard time (calendario)', value: full.partComponent.hard_time_calendar },
                )
            }
            return fields
        }
        if (category === 'CONSUMIBLE' && full?.consumable) {
            return [
                { label: 'Lote', value: full.consumable.lot_number },
                { label: 'Fecha de fabricación', value: full.consumable.fabrication_date },
                { label: 'Fecha de expiración', value: full.consumable.expiration_date },
                { label: 'Cantidad mínima', value: full.consumable.min_quantity },
                { label: '¿Manejado?', value: full.consumable.is_managed ? 'Sí' : 'No' },
                { label: 'Shelf life', value: full.consumable.shelf_life },
            ]
        }
        return null
    })()

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(true)}
                title="Ver detalle"
            >
                <Eye className="size-4" />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    className="max-h-[85vh] gap-0 overflow-y-auto p-0 sm:max-w-[620px]"
                    // El visor de documentos se renderiza fuera del content de Radix,
                    // así que sus clics cuentan como "interacción externa": sin estos
                    // guards, cerrar el visor cerraría también esta ficha.
                    onInteractOutside={(e) => {
                        if (previewDoc) e.preventDefault()
                    }}
                    onEscapeKeyDown={(e) => {
                        if (previewDoc) {
                            e.preventDefault()
                            setPreviewDoc(null)
                        }
                    }}
                >
                    <DialogTitle className="sr-only">Detalle del artículo {article.part_number}</DialogTitle>
                    <DialogDescription className="sr-only">
                        Ficha de inventario del artículo {article.part_number}
                    </DialogDescription>

                    {/* Placa de identificación */}
                    <div className="border-b-2 border-foreground/80 bg-muted/30 py-4 pl-5 pr-12">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                                    Ficha de artículo
                                </p>
                                <p className="truncate font-mono text-xl font-bold leading-tight tracking-tight">
                                    {article.part_number}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {article.batch?.name ?? 'N/A'}
                                </p>
                            </div>
                            <span
                                className={cn(
                                    'shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                                    isReception
                                        ? 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-400'
                                        : 'border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-400'
                                )}
                            >
                                {TRANSIT_STATUS_LABELS[status ?? ''] ?? 'Sin estado'}
                            </span>
                        </div>
                    </div>

                    <div className="divide-y divide-border/60">
                        <SheetSection index={1} title="Identificación">
                            <FieldGrid
                                fields={[
                                    { label: 'Número alterno', value: article.alternative_part_number },
                                    { label: 'Serial', value: article.serial },
                                    { label: 'Código ATA', value: article.ata_code },
                                    { label: 'Condición', value: article.condition?.name },
                                    { label: 'Fabricante', value: article.manufacturer?.name },
                                    {
                                        label: 'Cantidad',
                                        value: article.quantity != null
                                            ? `${article.quantity}${article.unit ? ` ${article.unit}` : ''}`
                                            : null,
                                    },
                                    { label: 'Fecha de recepción', value: article.reception_date },
                                    { label: 'N° de requisición', value: article.requisition_order_number },
                                ]}
                            />
                        </SheetSection>

                        <SheetSection index={2} title="Ubicación">
                            {location ? (
                                <div className="flex items-center gap-2 border border-border/60 bg-background px-3 py-2.5 text-sm">
                                    <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                                    <span className="font-mono font-medium">{location.address}</span>
                                    {location.cod_iata && (
                                        <span className="ml-auto rounded border border-border/40 bg-muted/60 px-1 py-0.5 font-mono text-[10px]">
                                            {location.cod_iata}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <p className="border border-dashed border-border/60 px-3 py-2.5 text-sm text-muted-foreground/60">
                                    N/A
                                </p>
                            )}
                        </SheetSection>

                        <SheetSection index={3} title={category ? CATEGORY_LABELS[category] ?? category : 'Datos de categoría'}>
                            {isLoading ? (
                                <div className="flex items-center gap-2 border border-dashed border-border/60 px-3 py-3 text-sm text-muted-foreground">
                                    <Loader2 className="size-3.5 animate-spin" />
                                    Cargando datos de categoría...
                                </div>
                            ) : categoryFields ? (
                                <FieldGrid fields={categoryFields} />
                            ) : (
                                <p className="border border-dashed border-border/60 px-3 py-2.5 text-sm text-muted-foreground/60">
                                    Sin datos adicionales de categoría.
                                </p>
                            )}
                        </SheetSection>

                        <SheetSection index={4} title="Manifiesto documental">
                            {requirements.length > 0 ? (
                                <div className="border border-border/60">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border/60 bg-muted/40">
                                                <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                    Documento
                                                </th>
                                                <th className="px-3 py-1.5 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                    Estado
                                                </th>
                                                <th className="w-10 px-3 py-1.5" />
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/60">
                                            {requirements.map((req) => {
                                                const consigned = req.documents.length > 0
                                                return (
                                                    <tr key={req.id}>
                                                        <td className="px-3 py-2">
                                                            <p className="truncate font-medium">
                                                                {req.document_type?.name ?? 'Documento'}
                                                            </p>
                                                            {req.document_type?.regulation && (
                                                                <p className="truncate text-[10px] text-muted-foreground">
                                                                    {req.document_type.regulation}
                                                                </p>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            <span
                                                                className={cn(
                                                                    'inline-flex items-center gap-1 text-[11px] font-semibold',
                                                                    consigned
                                                                        ? 'text-emerald-700 dark:text-emerald-400'
                                                                        : 'text-amber-700 dark:text-amber-400'
                                                                )}
                                                            >
                                                                {consigned ? (
                                                                    <>
                                                                        <CheckCircle2 className="size-3.5" />
                                                                        Consignado
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FileWarning className="size-3.5" />
                                                                        Pendiente
                                                                    </>
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="px-2 py-2 text-right">
                                                            {req.documents.length > 0 && (
                                                                <div className="flex flex-col items-end gap-1">
                                                                    {req.documents.map((doc, i) => (
                                                                        <Button
                                                                            key={doc.id}
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                                                            title={
                                                                                req.documents.length > 1
                                                                                    ? `Ver documento ${i + 1}`
                                                                                    : 'Ver documento'
                                                                            }
                                                                            onClick={() => setPreviewDoc(doc)}
                                                                        >
                                                                            <Eye className="size-3.5" />
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="border border-dashed border-border/60 px-3 py-2.5 text-sm text-muted-foreground/60">
                                    No hay documentación requerida para este artículo.
                                </p>
                            )}
                        </SheetSection>
                    </div>

                    {canEdit && (
                        <div className="flex justify-end border-t border-border/60 bg-muted/30 px-5 py-3">
                            <Button size="sm" onClick={() => setEditOpen(true)}>
                                Editar artículo
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {canEdit && editOpen && (
                <EditTransitArticleDialog
                    articleId={article.id}
                    open={editOpen}
                    onOpenChange={setEditOpen}
                />
            )}

            {previewDoc && (
                <SecureFileViewer
                    isOpen={!!previewDoc}
                    onClose={() => setPreviewDoc(null)}
                    title={article.part_number}
                    fetchBlobUrl={async () => {
                        const { data } = await axiosInstance.get(
                            `/${selectedCompany?.slug}/article-documents/${previewDoc.id}/view`,
                            { responseType: 'blob' }
                        )
                        return URL.createObjectURL(data)
                    }}
                />
            )}
        </>
    )
}
