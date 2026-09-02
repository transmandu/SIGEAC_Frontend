'use client'

import { useMemo, useState, useDeferredValue } from 'react'
import { ContentLayout } from '@/components/layout/ContentLayout'
import { useGetRequisition } from '@/hooks/mantenimiento/compras/useGetRequisitions'
import { useCompanyStore } from '@/stores/CompanyStore'
import { getColumns } from './columns'
import { useCompanyTimezone } from '@/hooks/general/useCompanyTimezone'
import { DataTable } from '@/app/[company]/compras/data-table'
import type { Requisition } from '@/types/purchase'
import RequisitionToolBar from './_components/RequisitionToolBar'
import { PurchasesRequisitionDialog } from '@/components/dialogs/mantenimiento/compras/PurchasesRequisitionDialog'
import { GenerateInProgressRequisitionsPdfButton } from '@/components/misc/GenerateInProgressRequisitionsPdfButton'
import RequisitionSubRow from './_components/RequisitionSubRow'
import GroupedRequisitionTable from './_components/GroupedRequisitionTable'
import RequisitionSplitView, { useRequisitionPreview, useRequisitionPreviewSelectedId } from '@/components/side-panels/RequisitionSplitView'
import { PageHeader } from "@/components/layout/PageHeader";

const RequisitionsPage = () => {
  return (
    <RequisitionSplitView>
      <RequisitionsPageContent />
    </RequisitionSplitView>
  )
}

const RequisitionsPageContent = () => {
  const { selectedCompany, selectedStation } = useCompanyStore()
  const timeZone = useCompanyTimezone()
  const onPreview = useRequisitionPreview()
  const selectedPreviewId = useRequisitionPreviewSelectedId()

  const {
    data: requisitions,
    isLoading,
    isError,
  } = useGetRequisition(
    selectedCompany?.slug,
    selectedStation || undefined,
    'GENERAL'
  )

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [type, setType] = useState('ALL')
  const [priority, setPriority] = useState('ALL')
  const [groupBy, setGroupBy] = useState('NONE')

  const deferredSearch = useDeferredValue(search)

  const filteredRequisitions = useMemo<Requisition[]>(() => {
    if (!requisitions) return []

    const q = deferredSearch.toLowerCase()

    return requisitions.filter((req: Requisition) => {
      const matchesSearch =
        !deferredSearch.trim() ||
        req.order_number?.toLowerCase?.().includes(q) ||
        req.justification?.toLowerCase?.().includes(q) ||
        req.requested_by?.toLowerCase?.().includes(q) ||
        req.created_by?.username?.toLowerCase?.().includes(q)

      const matchesStatus =
        status === 'ALL' || req.status === status

      const matchesType =
        type === 'ALL' || req.type === type

      const matchesPriority =
        priority === 'ALL' || req.priority === priority

      return matchesSearch && matchesStatus && matchesType && matchesPriority
    })
  }, [requisitions, deferredSearch, status, type, priority])

  // Memoizadas: antes se reconstruian en cada render, y dos veces por
  // pantalla (la vista agrupada y la plana llamaban a getColumns aparte).
  const columns = useMemo(
    () => getColumns(selectedCompany ?? undefined, onPreview ?? undefined, selectedPreviewId, timeZone),
    [selectedCompany, onPreview, selectedPreviewId, timeZone]
  )


  return (
    <ContentLayout title="Requisiciones Generales">
      <div className="flex flex-col gap-6">

        <PageHeader />

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">
                Requisiciones Generales
              </h1>

              <p className="text-sm text-muted-foreground">
                Visualiza y gestiona las solicitudes de compra generales
                registradas dentro del sistema de compras y abastecimiento.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 px-3 py-2 rounded-xl border bg-slate-200/40 border-slate-200/40 dark:bg-slate-800/70 dark:border-slate-700/60 backdrop-blur-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]">

          <RequisitionToolBar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            type={type}
            setType={setType}
            priority={priority}
            setPriority={setPriority}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
          />

          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {filteredRequisitions.length}{' '}
            {filteredRequisitions.length === 1
              ? 'requisición'
              : 'requisiciones'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <PurchasesRequisitionDialog />
          <GenerateInProgressRequisitionsPdfButton />
        </div>

        {groupBy === 'requested_by' ? (
          <GroupedRequisitionTable
            data={filteredRequisitions}
            renderTable={(rows) => (
              <DataTable
                columns={columns}
                data={rows}
                renderSubRow={(row) => (
                  <RequisitionSubRow
                    requisition={row.original}
                    selectedCompany={selectedCompany}
                  />
                )}
                canExpandRow={(row) =>
                  !!row.original.quotes?.length
                }
                loading={isLoading}
                overflowVisible
                persistKey="requisiciones_generales"
              />
            )}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredRequisitions}
            renderSubRow={(row) => (
              <RequisitionSubRow
                requisition={row.original}
                selectedCompany={selectedCompany}
              />
            )}
            canExpandRow={(row) =>
              !!row.original.quotes?.length
            }
            loading={isLoading}
            persistKey="requisiciones_generales"
          />
        )}

        {isError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-500">
              Ha ocurrido un error al cargar las solicitudes de compra generales.
            </p>
          </div>
        )}

      </div>
    </ContentLayout>
  )
}

export default RequisitionsPage