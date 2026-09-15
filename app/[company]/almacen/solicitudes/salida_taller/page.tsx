'use client'

import { buildColumns } from '@/app/[company]/almacen/solicitudes/salida_taller/columns'
import { ContentLayout } from '@/components/layout/ContentLayout'
import { PageHeader } from "@/components/layout/PageHeader"
import { WorkshopDispatchTimelineDialog } from '@/components/dialogs/mantenimiento/almacen/WorkshopDispatchTimelineDialog'
import { useGetWorkshopDispatches } from '@/hooks/mantenimiento/almacen/salida_taller/useGetWorkshopDispatches'
import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DataTable } from './data-table'

const WorkshopDispatchPage = () => {
  const {
    data: dispatches,
    isLoading,
    isFetching,
    isError,
    search,
    setSearch,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    pageIndex,
    pageSize,
    setPageSize,
  } = useGetWorkshopDispatches()
  const [timelineId, setTimelineId] = useState<number | null>(null)

  const columns = useMemo(() => buildColumns((id) => setTimelineId(id)), [])

  return (
    <ContentLayout title='Salida a Taller'>
      <div className='flex flex-col gap-y-2'>
        <PageHeader className="mb-4" />
        {isLoading && (
          <div className='flex w-full h-full justify-center items-center'>
            <Loader2 className='size-24 animate-spin mt-48' />
          </div>
        )}
        {dispatches && (
          <DataTable
            columns={columns}
            data={dispatches}
            search={search}
            onSearchChange={setSearch}
            isFetching={isFetching}
            onNextPage={nextPage}
            onPrevPage={prevPage}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        )}
        {isError && (
          <p className='text-sm text-muted-foreground'>Ha ocurrido un error al cargar las salidas a taller...</p>
        )}
      </div>

      {timelineId !== null && (
        <WorkshopDispatchTimelineDialog
          dispatchId={timelineId}
          open={timelineId !== null}
          onOpenChange={(open) => { if (!open) setTimelineId(null) }}
        />
      )}
    </ContentLayout>
  )
}

export default WorkshopDispatchPage
