'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import { useGetQuotes } from '@/hooks/compras/useGetQuotes'
import { useCompanyStore } from '@/stores/CompanyStore'
import { Loader2 } from 'lucide-react'
import { columns } from './columns'
import { DataTable } from './data-table'
import LoadingPage from '@/components/misc/LoadingPage'

const QuotesOrdersPage = () => {
  const { selectedStation, selectedCompany } = useCompanyStore();
  const { data: quotes, isLoading, isError } = useGetQuotes(selectedCompany && selectedCompany.split(' ').join('') || null,
    selectedStation || null);

  if (isLoading) {
    <LoadingPage />
  }

  return (
    <ContentLayout title='Cotizaciones'>
      <div className='flex flex-col gap-y-2'>
        {
          quotes && (
            <DataTable columns={columns} data={quotes} />

          )
        }
        {
          isError && <p className='text-sm text-muted-foreground'>Ha ocurrido un error al cargar las cotizaciones...</p>
        }
      </div>
    </ContentLayout>
  )
}

export default QuotesOrdersPage
