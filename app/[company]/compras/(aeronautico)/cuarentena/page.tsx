'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuarantineLegalDays } from '@/hooks/general/useCompanySettings'
import { useGetQuarantineArticles } from '@/hooks/mantenimiento/control_calidad/useGetQuarantineArticles'
import { quarantineRisk } from '@/lib/warehouse/quarantine'
import type { QuarantineStatusFilter } from '@/types/quarantine'
import { AlertTriangle, PackageSearch, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { DataTable } from '../../data-table'
import { getColumns } from './columns'
import { QuarantineCycleHistory } from './_components/QuarantineCycleHistory'
import QuarantineToolBar from './_components/QuarantineToolBar'

const QuarantinePurchasesPage = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<QuarantineStatusFilter>('UNRESOLVED')

  const deferredSearch = useDeferredValue(search)
  const legalDays = useQuarantineLegalDays()

  const { data: records, isLoading } = useGetQuarantineArticles(status)
  // Las métricas deben contar todo el ciclo, no solo lo que el filtro muestra.
  const { data: allRecords } = useGetQuarantineArticles('ALL')

  const filteredRecords = useMemo(() => {
    const list = records ?? []

    if (!deferredSearch.trim()) return list

    const q = deferredSearch.toLowerCase()

    return list.filter((record) => {
      const article = record.article

      return (
        article?.part_number?.toLowerCase().includes(q) ||
        article?.serial?.toLowerCase().includes(q) ||
        article?.batch?.name?.toLowerCase().includes(q) ||
        record.reason?.toLowerCase().includes(q)
      )
    })
  }, [records, deferredSearch])

  const metrics = useMemo(() => {
    const list = allRecords ?? []

    const open = list.filter((record) => record.status === 'OPEN')
    const pending = list.filter((record) => record.status === 'PENDING_REINSPECTION')
    const overdue = open.filter((record) => record.is_overdue)

    // El más urgente entre los que esperan corrección: es lo que compras debe
    // atender primero, y con qué margen.
    const mostUrgent = [...open]
      .map((record) => ({
        record,
        risk: quarantineRisk(record.quarantine_entry_date, legalDays, record.days_in_quarantine),
      }))
      .filter((entry) => entry.risk.remaining !== null)
      .sort((a, b) => (a.risk.remaining ?? 0) - (b.risk.remaining ?? 0))[0]

    return {
      openCount: open.length,
      pendingCount: pending.length,
      overdueCount: overdue.length,
      mostUrgent,
    }
  }, [allRecords, legalDays])

  const columns = useMemo(() => getColumns(legalDays), [legalDays])

  return (
    <ContentLayout title="Cuarentena">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div className="flex flex-col gap-2 border-b pb-4">
          <h1 className="text-3xl font-semibold tracking-tight">Cuarentena</h1>

          <p className="text-sm text-muted-foreground">
            Artículos retenidos por Control de Calidad que requieren corrección de Compras.
            Corrija el artículo o su documentación y envíelo a re-inspección.
          </p>
        </div>

        {/* MÉTRICAS */}
        <div className="grid gap-3 md:grid-cols-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <ShieldAlert className="size-3.5" />
                Por corregir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.openCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">Esperan acción de Compras</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <ShieldCheck className="size-3.5" />
                En re-inspección
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.pendingCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">Ya corregidos, en manos de Calidad</p>
            </CardContent>
          </Card>

          <Card
            className={
              metrics.overdueCount > 0
                ? 'rounded-2xl border-red-500/40 bg-red-500/5'
                : 'rounded-2xl'
            }
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <AlertTriangle className="size-3.5" />
                Plazo vencido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.overdueCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Superaron los {legalDays} días de retención
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Más urgente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!metrics.mostUrgent ? (
                <p className="text-sm text-muted-foreground">Nada pendiente de corrección.</p>
              ) : (
                <div className="flex items-start gap-2">
                  <PackageSearch className="mt-0.5 size-4 shrink-0" />
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-sm font-semibold">
                      {metrics.mostUrgent.record.article?.part_number ?? 'Sin parte'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(metrics.mostUrgent.risk.remaining ?? 0) >= 0
                        ? `Vence en ${metrics.mostUrgent.risk.remaining} días`
                        : `Vencido por ${Math.abs(metrics.mostUrgent.risk.remaining ?? 0)} días`}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* TOOLBAR */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/40 bg-slate-200/40 px-3 py-2 backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-800/70 dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
          <QuarantineToolBar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredRecords}
          loading={isLoading}
          loadingText="Cargando artículos en cuarentena..."
          emptyText="No hay artículos en cuarentena para este filtro."
          persistKey="compras-cuarentena"
          // El historial se consulta aquí y no en el diálogo: ahí es contexto que
          // compite con la corrección, que es a lo que se entra.
          canExpandRow={(row) => (row.original.cycles?.length ?? 0) > 0}
          renderSubRow={(row) => (
            <div className="px-4 py-3">
              <QuarantineCycleHistory cycles={row.original.cycles ?? []} />
            </div>
          )}
        />
      </div>
    </ContentLayout>
  )
}

export default QuarantinePurchasesPage
