'use client'

import { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import {
  ChevronRight,
  FilePen,
  FileWarning,
  Loader2,
  MapPin,
  ArrowRight,
  PackageCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableColumnHeader } from '@/components/tables/DataTableHeader'
import { cn } from '@/lib/utils'
import { useUpdateArticleStatus } from '@/actions/mantenimiento/almacen/inventario/articulos/actions'
import type { TransitArticle } from '@/types/purchase'
import { EditTransitArticleDialog } from './_components/EditTransitArticleDialog'
import { PendingDocumentsDialog } from './_components/PendingDocumentsDialog'

const getPendingRequirements = (article: TransitArticle) =>
  (article.document_requirements ?? []).filter(
    (req) => req.documents.length === 0
  )

function TransitActionButton({
  article,
}: {
  article: TransitArticle
}) {
  const { updateArticleStatus } = useUpdateArticleStatus()
  const [docsDialogOpen, setDocsDialogOpen] = useState(false)

  const pending = updateArticleStatus.isPending
  const status = article.status?.toUpperCase()
  const isReception = status === 'RECEPTION'
  const isTransit = status === 'TRANSIT'

  const pendingDocs = getPendingRequirements(article)

  const moveToReception = async () => {
    try {
      await updateArticleStatus.mutateAsync({
        id: article.id,
        status: 'RECEPTION',
      })
    } catch (error) {
      // Respaldo del servidor: si el backend reporta documentación pendiente
      // (datos locales desactualizados), abrimos el bloque de consignación.
      const pendingFromServer = (error as {
        response?: { data?: { pending_documents?: unknown[] } }
      })?.response?.data?.pending_documents

      if (pendingFromServer && pendingFromServer.length > 0) {
        setDocsDialogOpen(true)
      }
    }
  }

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (pending) return

    if (isTransit) {
      // La documentación requerida debe estar consignada antes de recepcionar.
      if (pendingDocs.length > 0) {
        setDocsDialogOpen(true)
        return
      }

      await moveToReception()
    }

    if (isReception) {
      await updateArticleStatus.mutateAsync({
        id: article.id,
        status: 'INCOMING',
      })
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={handleAction}
        className="
          h-7 px-3 gap-1.5
          text-[11px]
          rounded-full
          border border-slate-200/60 dark:border-slate-700/60
          bg-white/50 dark:bg-slate-800/40
          hover:bg-slate-100 dark:hover:bg-slate-800
        "
      >
        {pending ? (
          <Loader2 className="size-3 animate-spin" />
        ) : isReception ? (
          <>
            <ArrowRight className="size-3" />
            Incoming
          </>
        ) : (
          <>
            {pendingDocs.length > 0 ? (
              <FileWarning className="size-3 text-amber-500" />
            ) : (
              <PackageCheck className="size-3" />
            )}
            Recepción
          </>
        )}
      </Button>

      <PendingDocumentsDialog
        article={article}
        open={docsDialogOpen}
        onOpenChange={setDocsDialogOpen}
        onCompleted={moveToReception}
      />
    </>
  )
}

function EditTransitArticleAction({
  article,
}: {
  article: TransitArticle
}) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const pendingCount = getPendingRequirements(article).length

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                setEditDialogOpen(true)
              }}
              className={cn(
                'relative h-7 w-7',
                pendingCount > 0 ? 'text-amber-500' : 'text-muted-foreground'
              )}
            >
              <FilePen className="size-3.5" />
              {pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-semibold text-white">
                  {pendingCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs px-2 py-1">
            {pendingCount > 0
              ? `Editar artículo (${pendingCount} documento${pendingCount === 1 ? '' : 's'} pendiente${pendingCount === 1 ? '' : 's'})`
              : 'Editar información del artículo'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {editDialogOpen && (
        <EditTransitArticleDialog
          articleId={article.id}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </>
  )
}

export const getColumns = (
  selectedCompany?: { slug: string }
): ColumnDef<TransitArticle>[] => [

  {
    id: 'expander',
    size: 50,
    header: () => null,
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        {row.getCanExpand() && (
          <ChevronRight
            className={cn(
              'size-3.5 text-muted-foreground/50 transition-transform',
              row.getIsExpanded() && 'rotate-90 text-emerald-500'
            )}
          />
        )}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: 'part_number',
    size: 210,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Número de Parte" />
      </div>
    ),

    cell: ({ row }) => {
      const hasAlt = !!row.original.alternative_part_number

      return (
        <div className="flex w-full justify-start">
          <div className="space-y-1 min-w-0">

            <div className="flex items-center gap-2">

              <span className="
                text-[9px] font-semibold uppercase tracking-widest
                px-1.5 py-0.5 rounded-md
                bg-emerald-100/60 dark:bg-emerald-900/30
                text-emerald-700 dark:text-emerald-300
                border border-emerald-200/50 dark:border-emerald-800/40
              ">
                P/N
              </span>

              <span className="
                text-[13px] font-semibold tracking-tight
                text-slate-900 dark:text-slate-100
                px-1 py-0.5 rounded
              ">
                {row.original.part_number}
              </span>

            </div>
            {hasAlt ? (
              <div className="flex items-center gap-2">

                <span className="
                  text-[9px] font-semibold uppercase tracking-widest
                  px-1.5 py-0.5 rounded-md
                  bg-slate-200/60 dark:bg-slate-700/40
                  text-slate-600 dark:text-slate-300
                  border border-slate-300/40 dark:border-slate-600/40
                ">
                  ALT
                </span>

                <span className="font-mono text-[11px] text-muted-foreground">
                  {row.original.alternative_part_number}
                </span>

              </div>
            ) : (
              <div className="flex items-center gap-2">

                <span className="
                  text-[9px] font-semibold uppercase tracking-widest
                  px-1.5 py-0.5 rounded-md
                  bg-slate-100 dark:bg-slate-800
                  text-slate-400
                ">
                  ALT
                </span>

                <span className="text-[11px] text-muted-foreground/40 italic">
                  Sin alternativo
                </span>

              </div>
            )}

          </div>
        </div>
      )
    },
  },

  {
    accessorKey: 'batch',
    size: 210,

    header: ({ column }) => (
      <div className="flex justify-center items-center w-full text-center">
        <DataTableColumnHeader column={column} title="Descripción" />
      </div>
    ),

    cell: ({ row }) => (
      <div className="flex items-center justify-center w-full text-center px-2">
        <span className="block w-full text-sm font-medium text-slate-800 dark:text-slate-200 break-words">
          {row.original.batch?.name ?? 'Sin descripción'}
        </span>
      </div>
    ),
  },

  {
    accessorKey: 'status_date',
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Fecha de Movimiento" />
      </div>
    ),

    cell: ({ row }) => {
      const status = row.original.status?.toUpperCase()
      const isTransit = status === 'TRANSIT'
      const isReception = status === 'RECEPTION'

      const date = isTransit
        ? row.original.created_at
        : isReception
          ? row.original.reception_date
          : null

      const label = isTransit
        ? 'ESTÁ EN TRÁNSITO'
        : isReception
          ? 'ESTÁ EN RECEPCIÓN'
          : null

      const formatDate = (value?: string | null) => {
        if (!value) return null

        const [year, month, day] = value.split('-').map(Number)
        const safeDate = new Date(year, month - 1, day)

        return new Intl.DateTimeFormat('es-ES', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).format(safeDate).toUpperCase()
      }

      if (!date) {
        return (
          <div className="flex justify-center w-full">
            <span className="text-xs text-muted-foreground/40">
              -
            </span>
          </div>
        )
      }

      return (
        <div className="flex flex-col items-center justify-center w-full leading-tight">

          <span className="text-[10px] text-muted-foreground/60">
            DESDE EL
          </span>

          <span className="text-sm font-medium">
            {formatDate(date)}
          </span>

          {label && (
            <span className="text-[10px] text-muted-foreground/60">
              {label}
            </span>
          )}

        </div>
      )
    },
  },

  {
    accessorKey: 'location',
    size: 150,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Ubicación" />
      </div>
    ),

    cell: ({ row }) => {
      const location = row.original.batch?.warehouse?.location

      return (
        <div className="flex justify-center w-full">
          {location ? (
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <MapPin className="size-3.5 opacity-60" />
              <span className="truncate">{location.address}</span>
            </div>
          ) : (
            <span className="text-muted-foreground/40">—</span>
          )}
        </div>
      )
    },
  },

  {
    accessorKey: 'status',
    size: 150,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Estado" />
      </div>
    ),

    cell: ({ row }) => {
      const status = row.original.status?.toUpperCase()
      const isTransit = status === 'TRANSIT'
      const isReception = status === 'RECEPTION'

      return (
        <div className="flex justify-center w-full">

          <Badge
                className={cn(
                  `
                    rounded-md
                    border
                    px-2 py-0.5
                    text-[10px]
                    font-semibold
                    tracking-wide
                    shadow-sm
                    transition-colors duration-150
                    cursor-default
                  `,

                  isTransit && `
                    border-yellow-500/30
                    bg-yellow-500/10
                    text-yellow-700
                    dark:text-yellow-300
                    hover:bg-yellow-500/15
                  `,

                  isReception && `
                    border-emerald-500/30
                    bg-emerald-500/10
                    text-emerald-700
                    dark:text-emerald-300
                    hover:bg-emerald-500/15
                  `,

                  !isTransit &&
                    !isReception &&
                    `
                      border-red-500/30
                      bg-red-500/10
                      text-red-700
                      dark:text-red-300
                      hover:bg-red-500/15
                    `
                )}
          >
            {isTransit ? 'En tránsito' : 'En recepción'}
          </Badge>

        </div>
      )
    },
  },

  {
    id: 'edit_info',
    size: 70,

    header: () => (
      <div className="flex justify-center w-full text-xs font-medium text-muted-foreground">
        Editar
      </div>
    ),

    cell: ({ row }) => (
      <div className="flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
        <EditTransitArticleAction article={row.original} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    id: 'actions',
    size: 160,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),

    cell: ({ row }) => (
      <div className="flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
        <TransitActionButton article={row.original} />
      </div>
    ),
  },
]