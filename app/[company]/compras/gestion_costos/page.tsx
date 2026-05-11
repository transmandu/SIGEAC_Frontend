'use client'

import {
  useMemo,
  useState,
  useCallback,
  useDeferredValue,
  useEffect,
} from 'react'

import { ContentLayout } from '@/components/layout/ContentLayout'
import LoadingPage from '@/components/misc/LoadingPage'
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

import { DataTable } from './data-table'
import { getColumns } from './columns'

import GroupedCostTable from './_components/GroupedCostTable'

import CostToolbar from './_components/CostToolbar'
import CostTypeToggle from './_components/CostTypeToggle'
import CostSaveBar from './_components/CostSaveBar'

import { useCostDrafts } from './hooks/useCostDrafts'

import { useGetAllWarehouseArticlesByCategory } from '@/hooks/mantenimiento/almacen/articulos/useGetWarehouseArticlesByCategory'
import { useGetGeneralArticles } from '@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles'

import {
  useBulkUpdateArticleCost,
  useBulkUpdateGeneralCost,
} from '@/actions/mantenimiento/compras/gestion_costos/actions'

type CostType = 'ARTICLE' | 'GENERAL'

type Category =
  | 'all'
  | 'COMPONENT'
  | 'PART'
  | 'CONSUMABLE'
  | 'TOOL'

type BaseRow = {
  id: number
  cost?: number
  batch_name?: string
  part_number?: string
  serial?: string
  quantity?: number
  name?: string
  description?: string
  brand_model?: string
  variant_type?: string
  unit_label?: string
}

const CostManagementPage = () => {
  const { selectedCompany } = useCompanyStore()

  const [type, setType] = useState<CostType>('ARTICLE')
  const [category, setCategory] = useState<Category>('all')
  const [search, setSearch] = useState('')

  const [groupBy, setGroupBy] = useState<string>('NONE')

  const deferredSearch = useDeferredValue(search)

  /**
   * 🔥 FIX: reset de filtros incompatibles al cambiar tipo
   */
  useEffect(() => {
    setGroupBy('NONE')
    setSearch('')
  }, [type])

  const { data: warehouseData, isLoading: loadingArticles } =
    useGetAllWarehouseArticlesByCategory(
      category === 'all' ? 'all' : category,
      type === 'ARTICLE'
    )

  const { data: generalArticles, isLoading: loadingGeneral } =
    useGetGeneralArticles()

  const isInitialLoading =
    type === 'ARTICLE'
      ? loadingArticles && !warehouseData
      : loadingGeneral && !generalArticles

  const isUpdating =
    type === 'ARTICLE'
      ? loadingArticles && !!warehouseData
      : loadingGeneral && !!generalArticles

  const articleData = useMemo<BaseRow[]>(() => {
    if (!warehouseData?.batches) return []

    return warehouseData.batches.flatMap((batch) =>
      batch.articles.map((article) => ({
        id: article.id,
        batch_name: batch.name,
        part_number: article.part_number,
        serial: article.serial,
        unit_label: article.unit?.label,
        cost: Number(article.cost ?? 0),
      }))
    )
  }, [warehouseData])

  const baseData = useMemo<BaseRow[]>(() => {
    if (type === 'GENERAL') {
      return (generalArticles ?? []).map((a: any) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        brand_model: a.brand_model,
        variant_type: a.variant_type,
        cost: Number(a.cost ?? 0),
        unit_label: a.general_primary_unit?.label,
      }))
    }

    return articleData
  }, [type, generalArticles, articleData])

  const filteredData = useMemo<BaseRow[]>(() => {
    if (!deferredSearch.trim()) return baseData

    const q = deferredSearch.toLowerCase()

    return baseData.filter((item: any) => {
      if (type === 'ARTICLE') {
        return (
          item.part_number?.toLowerCase?.().includes(q) ||
          item.serial?.toLowerCase?.().includes(q) ||
          item.batch_name?.toLowerCase?.().includes(q)
        )
      }

      return (
        item.name?.toLowerCase?.().includes(q) ||
        item.description?.toLowerCase?.().includes(q) ||
        item.brand_model?.toLowerCase?.().includes(q) ||
        item.variant_type?.toLowerCase?.().includes(q)
      )
    })
  }, [baseData, deferredSearch, type])

  const {
    drafts: costDrafts,
    hasChanges,
    onCostChange,
    setDrafts,
    getChangedRows,
  } = useCostDrafts<BaseRow>({
    data: filteredData,
  })

  const bulkArticleMutation = useBulkUpdateArticleCost()
  const bulkGeneralMutation = useBulkUpdateGeneralCost()

  const handleSave = useCallback(() => {
    const updates = Object.entries(costDrafts).map(([id, value]) => ({
      id: Number(id),
      cost: Number(value),
    }))

    if (!updates.length) return

    const payload = {
      company: selectedCompany?.slug!,
      updates,
    }

    if (type === 'ARTICLE') {
      bulkArticleMutation.mutate(payload, {
        onSuccess: () => setDrafts({}),
      })
    } else {
      bulkGeneralMutation.mutate(payload, {
        onSuccess: () => setDrafts({}),
      })
    }
  }, [
    costDrafts,
    type,
    selectedCompany,
    bulkArticleMutation,
    bulkGeneralMutation,
    setDrafts,
  ])

  const columns = useMemo(
    () =>
      getColumns({
        type,
        onCostChange,
      }),
    [type, onCostChange]
  )

  return (
    <ContentLayout title="Gestión de Costos">
      <div className="flex flex-col gap-6">

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
              <BreadcrumbItem>Compras</BreadcrumbItem>
              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>Gestión de Costos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">
                Gestión de Costos
              </h1>

              <p className="text-sm text-muted-foreground">
                Administra y actualiza los costos unitarios de artículos y otros elementos del inventario aeronáutico y general.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <CostTypeToggle
            type={type}
            setType={setType}
            category={category}
            setCategory={setCategory}
          />
        </div>

        <div className="
          flex items-center justify-between gap-4
          px-3 py-2
          rounded-xl border
          bg-slate-200/40 border-slate-200/40
          dark:bg-slate-800/70 dark:border-slate-700/60
          backdrop-blur-md
          dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]
        ">
          <CostToolbar
            search={search}
            setSearch={setSearch}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            type={type}
          />

          <span className="text-xs text-muted-foreground tabular-nums">
            {filteredData.length}{' '}
            {filteredData.length === 1 ? 'artículo' : 'artículos'}
          </span>
        </div>

        <CostSaveBar
          hasChanges={hasChanges}
          modifiedCount={getChangedRows().length}
          onSave={handleSave}
        />

        {isInitialLoading && filteredData.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <LoadingPage />
          </div>
        ) : groupBy !== 'NONE' ? (
          <GroupedCostTable
            data={filteredData}
            groupBy={groupBy as any}
            renderTable={(rows) => (
              <DataTable
                columns={columns}
                data={rows}
                loading={isUpdating}
                costDrafts={costDrafts}
              />
            )}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            loading={isUpdating}
            costDrafts={costDrafts}
          />
        )}

      </div>
    </ContentLayout>
  )
}

export default CostManagementPage