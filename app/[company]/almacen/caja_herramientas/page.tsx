'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import { useGetPendingDispatches } from '@/hooks/mantenimiento/almacen/solicitudes/useGetPendingDispatchRequests'
import { useCompanyStore } from '@/stores/CompanyStore'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { DataTable } from './data-table'
import { columns } from './columns'
import { useGetToolBoxes } from '@/hooks/mantenimiento/almacen/caja_herramientas/useGetToolBoxes'
import LoadingPage from '@/components/misc/LoadingPage'

const DispatchRequestPage = () => {
  const { selectedStation } = useCompanyStore();
  const { data: toolBoxes, isLoading, isError } = useGetToolBoxes(selectedStation ?? null)
  if (isLoading) {
    return <LoadingPage />
  }
  return (
    <ContentLayout title='Salida'>
      <div className='flex flex-col gap-y-2'>
        {
          toolBoxes && <DataTable columns={columns} data={toolBoxes} />
        }
      </div>
    </ContentLayout>
  )
}

export default DispatchRequestPage
