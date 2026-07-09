'use client'

import { useDeferredValue, useMemo, useState } from 'react'

import { ContentLayout } from '@/components/layout/ContentLayout'
import BackButton from '@/components/misc/BackButton'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

import { useCompanyStore } from '@/stores/CompanyStore'
import { useGetArticlesByStatus } from '@/hooks/mantenimiento/almacen/articulos/useGetArticlesByStatus'

import { DataTable } from '../../data-table'
import { columns } from './columns'

import type { DestinationArticle } from '@/types/purchase'
import UnknownDestinationToolbar from './_components/UnknownDestinationToolbar'

export default function UnknownDestinationPage() {
  const { selectedCompany } = useCompanyStore()

  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)

  const { data = [], isLoading, isError } =
    useGetArticlesByStatus('TO_DETERMINATE')

  const articles = data as DestinationArticle[]

  /**
   * 🔥 Loading pattern unificado
   */

  const filteredArticles = useMemo(() => {
    if (!articles) return []

    if (!deferredSearch.trim()) return articles

    const q = deferredSearch.toLowerCase()

    return articles.filter((article) =>
      [
        article.part_number,
        article.alternative_part_number,
        article.serial,
        article.article_type,
        article.description,
        article.batch?.name,
        article.manufacturer?.name,
      ].some((value) =>
        value?.toLowerCase?.().includes(q)
      )
    )
  }, [articles, deferredSearch])

  return (
    <ContentLayout title="Destino indeterminado">
      <div className="flex flex-col gap-6">

        {/* Breadcrumb */}
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
                Compras
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>
                  Destino indeterminado
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-2 border-b pb-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            Destino indeterminado
          </h1>

          <p className="text-sm text-muted-foreground">
            Artículos pendientes de confirmación de destino dentro del sistema logístico.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 px-3 py-2 rounded-xl border bg-slate-200/40 border-slate-200/40 dark:bg-slate-800/70 dark:border-slate-700/60 backdrop-blur-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]">

          <UnknownDestinationToolbar
            search={search}
            setSearch={setSearch}
          />

          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {filteredArticles.length}{' '}
            {filteredArticles.length === 1
              ? 'artículo'
              : 'artículo(s)'}
          </span>

        </div>

        {/* TABLE / LOADING SPLIT */}
          <DataTable
            columns={columns}
            data={filteredArticles}
            loading={isLoading}
            loadingText="Cargando artículos..."
            emptyText="No se encontraron artículos"
            persistKey="destino_indeterminado"
          />

        {/* Error */}
        {isError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-500">
              Error al cargar los artículos con destino indeterminado.
            </p>
          </div>
        )}

      </div>
    </ContentLayout>
  )
}