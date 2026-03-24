'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import LoadingPage from '@/components/misc/LoadingPage'
import BackButton from '@/components/misc/BackButton'
import { useGetPurchaseOrders } from '@/hooks/mantenimiento/compras/useGetPurchaseOrders'
import { useCompanyStore } from '@/stores/CompanyStore'
import { PurchaseOrder } from '@/types'
import { Row } from '@tanstack/react-table'
import { MapPin } from 'lucide-react'
import { getColumns } from './columns'
import { DataTable } from './data-table'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

// ── Mini-tabla de artículos ────────────────────────────────────────────
const ARTICLE_COLS = ['Parte / Alterno', 'Cant.', 'P. Unit.', 'Tracking USA', 'Tracking OCK', 'Ubicación']

function PurchaseOrderSubRow({ row }: { row: Row<PurchaseOrder> }) {
  const articles = row.original.article_purchase_order

  if (articles.length === 0) {
    return (
      <p className="text-xs text-muted-foreground/50 italic py-1">
        Sin artículos registrados.
      </p>
    )
  }

  return (
    <div className="space-y-0">
      {/* Cabecera de columnas */}
      <div className="grid grid-cols-[1fr_52px_76px_140px_140px_110px] gap-2 px-2 pb-1.5 border-b border-border/40">
        {ARTICLE_COLS.map((h) => (
          <span
            key={h}
            className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60"
          >
            {h}
          </span>
        ))}
      </div>

      {/* Filas de artículos */}
      {articles.map((article) => (
        <div
          key={article.id}
          className="grid grid-cols-[1fr_52px_76px_140px_140px_110px] gap-2 items-start px-2 py-2 border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors"
        >
          {/* Identidad de parte */}
          <div className="space-y-1 min-w-0">
            <div className="font-mono text-[11px] bg-muted/60 px-1.5 py-0.5 rounded border border-border/40 truncate tracking-wide">
              {article.article_part_number}
            </div>
            {article.article_alt_part_number ? (
              <div className="flex items-center gap-1">
                <span className="shrink-0 text-[9px] font-mono font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-1 py-0.5 rounded tracking-widest select-none">
                  ALT
                </span>
                <span className="font-mono text-[11px] text-muted-foreground truncate">
                  {article.article_alt_part_number}
                </span>
              </div>
            ) : (
              <span className="text-[10px] font-mono text-muted-foreground/30 border border-dashed border-border/30 px-1 py-0.5 rounded">
                ALT —
              </span>
            )}
          </div>

          {/* Cantidad */}
          <div className="pt-0.5">
            <span className="font-mono text-xs tabular-nums">{article.quantity}</span>
            {article.unit && (
              <span className="text-[10px] text-muted-foreground ml-0.5">{article.unit.label}</span>
            )}
          </div>

          {/* Precio unitario */}
          <div className="font-mono text-xs tabular-nums text-muted-foreground pt-0.5">
            ${Number(article.unit_price || 0).toFixed(2)}
          </div>

          {/* Tracking USA */}
          <div className="pt-0.5">
            {article.usa_tracking ? (
              <span className="font-mono text-[11px] bg-muted/50 px-1.5 py-0.5 rounded border border-border/30 block truncate">
                {article.usa_tracking}
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground/40 italic">Pendiente</span>
            )}
          </div>

          {/* Tracking OCK */}
          <div className="pt-0.5">
            {article.ock_tracking ? (
              <span className="font-mono text-[11px] bg-muted/50 px-1.5 py-0.5 rounded border border-border/30 block truncate">
                {article.ock_tracking}
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground/40 italic">Pendiente</span>
            )}
          </div>

          {/* Ubicación */}
          <div className="pt-0.5">
            {article.article_location ? (
              <div className="flex items-start gap-1">
                <MapPin className="size-2.5 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-xs leading-tight">{article.article_location}</span>
              </div>
            ) : (
              <span className="text-[11px] text-muted-foreground/40 italic">Pendiente</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Página ─────────────────────────────────────────────────────────────
const PurchaseOrdersPage = () => {
  const { selectedStation, selectedCompany } = useCompanyStore()

  const { data: po, isLoading, isError } = useGetPurchaseOrders(
    selectedCompany?.slug ?? '',
    selectedStation ?? ''
  )

  const columns = getColumns(selectedCompany ?? undefined)

  if (isLoading) return <LoadingPage />

  return (
    <ContentLayout title="Ordenes de Compra">
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
                <BreadcrumbPage>Ordenes de Compra</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-bold">Órdenes de Compra</h1>
          {po && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {po.length} {po.length === 1 ? 'orden' : 'órdenes'}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Haga click en una fila para ver los artículos asociados.
        </p>

        <DataTable
          columns={columns}
          data={po || []}
          renderSubRow={(row) => <PurchaseOrderSubRow row={row as Row<PurchaseOrder>} />}
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

export default PurchaseOrdersPage
