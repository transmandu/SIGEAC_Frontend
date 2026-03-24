'use client'

import { useUpdateArticleStatus } from '@/actions/mantenimiento/almacen/inventario/articulos/actions'
import { ContentLayout } from '@/components/layout/ContentLayout'
import BackButton from '@/components/misc/BackButton'
import LoadingPage from '@/components/misc/LoadingPage'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useGetPurchaseOrders } from '@/hooks/mantenimiento/compras/useGetPurchaseOrders'
import { useCompanyStore } from '@/stores/CompanyStore'
import { Article, PurchaseOrder } from '@/types'
import { Row } from '@tanstack/react-table'
import { Loader2, PackageCheck, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { getColumns } from './columns'
import { DataTable } from './data-table'

// ── Fila de artículo individual ────────────────────────────────────────
function ArticleRow({ article, company }: { article: Article; company: string }) {
  const router = useRouter()
  const { updateArticleStatus } = useUpdateArticleStatus()
  const [pending, setPending] = useState(false)

  const isReception =
    article.status === 'Reception' ||
    article.status === 'EN_RECEPCION' ||
    article.status === 'EN RECEPCION'

  const handleReception = async () => {
    setPending(true)
    await updateArticleStatus.mutateAsync({ id: article.id, status: 'Reception' })
    setPending(false)
  }

  return (
    <div className="grid grid-cols-[1fr_120px_auto] gap-3 items-center px-2 py-2 border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
      {/* Identidad de parte */}
      <div className="space-y-1 min-w-0">
        <div className="font-mono text-[11px] bg-muted/60 px-1.5 py-0.5 rounded border border-border/40 truncate tracking-wide">
          {article.part_number}
        </div>
        {article.alternative_part_number && article.alternative_part_number.length > 0 ? (
          <div className="flex items-center gap-1">
            <span className="shrink-0 text-[9px] font-mono font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-1 py-0.5 rounded tracking-widest select-none">
              ALT
            </span>
            <span className="font-mono text-[11px] text-muted-foreground truncate">
              {article.alternative_part_number[0]}
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-mono text-muted-foreground/30 border border-dashed border-border/30 px-1 py-0.5 rounded">
            ALT —
          </span>
        )}
        {article.serial && (
          <span className="font-mono text-[10px] text-muted-foreground/60 block">
            S/N: {article.serial}
          </span>
        )}
      </div>

      {/* Status */}
      <div>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wide ${
          isReception
            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
            : 'bg-muted/40 text-muted-foreground border-border/40'
        }`}>
          {article.status ?? 'TRANSIT'}
        </span>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs gap-1"
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/${company}/almacen/inventario_articulos/editar/${article.id}`)
          }}
        >
          <Pencil className="size-3" />
          Editar
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs gap-1"
          disabled={pending || isReception}
          onClick={(e) => {
            e.stopPropagation()
            handleReception()
          }}
        >
          {pending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <>
              <PackageCheck className="size-3" />
              {isReception ? 'En recepción' : 'Recepción'}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// ── Mini-tabla de artículos ────────────────────────────────────────────
const ARTICLE_COLS = ['Parte / Alterno / S/N', 'Estado', 'Acciones']

function PurchaseOrderSubRow({ row, company }: { row: Row<PurchaseOrder>; company: string }) {
  const articles = row.original.articles

  if (!articles || articles.length === 0) {
    return (
      <p className="text-xs text-muted-foreground/50 italic py-1">
        Sin artículos creados.
      </p>
    )
  }

  return (
    <div className="space-y-0">
      {/* Cabecera */}
      <div className="grid grid-cols-[1fr_120px_auto] gap-3 px-2 pb-1.5 border-b border-border/40">
        {ARTICLE_COLS.map((h) => (
          <span key={h} className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
            {h}
          </span>
        ))}
      </div>

      {articles.map((article) => (
        <ArticleRow key={article.id} article={article} company={company} />
      ))}
    </div>
  )
}

// ── Página ─────────────────────────────────────────────────────────────
const EnTransitoPage = () => {
  const { selectedStation, selectedCompany } = useCompanyStore()

  const { data: po, isLoading, isError } = useGetPurchaseOrders(
    selectedCompany?.slug ?? '',
    selectedStation ?? ''
  )

  const columns = getColumns(selectedCompany ?? undefined)

  if (isLoading) return <LoadingPage />

  return (
    <ContentLayout title="Artículos en Tránsito">
      <div className="flex flex-col gap-y-2">

        <div className="flex items-center gap-2">
          <BackButton iconOnly tooltip="Volver" variant="secondary" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${selectedCompany?.slug ?? ''}/dashboard`}>
                  Inicio
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>Compras</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Art. en Tránsito</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-bold">Artículos en Tránsito</h1>
          {po && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {po.length} {po.length === 1 ? 'orden' : 'órdenes'}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Haga click en una fila para ver y gestionar los artículos de cada orden.
        </p>

        <DataTable
          columns={columns}
          data={po || []}
          renderSubRow={(row) => (
            <PurchaseOrderSubRow
              row={row as Row<PurchaseOrder>}
              company={selectedCompany?.slug ?? ''}
            />
          )}
        />

        {isError && (
          <p className="text-sm text-muted-foreground italic">
            Ha ocurrido un error al cargar las órdenes de compra.
          </p>
        )}
      </div>
    </ContentLayout>
  )
}

export default EnTransitoPage
