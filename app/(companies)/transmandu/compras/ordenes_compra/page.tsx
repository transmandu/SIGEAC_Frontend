'use client'
import { ContentLayout } from '@/components/layout/ContentLayout'
import { useGetPurchaseOrders } from '@/hooks/compras/useGetPurchaseOrders'
import { useCompanyStore } from '@/stores/CompanyStore'
import { Loader2 } from 'lucide-react'
import { columns } from './columns'
import { DataTable } from './data-table'
import LoadingPage from '@/components/misc/LoadingPage'

const PurchaseOrdersPage = () => {
  const { selectedStation, selectedCompany } = useCompanyStore();
  const { data: po, isLoading, isError } = useGetPurchaseOrders(selectedCompany && selectedCompany.split(' ').join('') || null,
    selectedStation || null);

  if (isLoading) {
    <LoadingPage />
  }

  return (
    <ContentLayout title='Cotizaciones'>
      <div className='flex flex-col gap-y-2'>
        {
          po && (
            <DataTable columns={columns} data={po} />

          )
        }
        {
          isError && <p className='text-sm text-muted-foreground'>Ha ocurrido un error al cargar las cotizaciones...</p>
        }
      </div>
    </ContentLayout>
  )
}

export default PurchaseOrdersPage
