'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import { useGetQuotes } from '@/hooks/mantenimiento/compras/useGetQuotes'
import { useCompanyStore } from '@/stores/CompanyStore'
import { Loader2 } from 'lucide-react'
import { columns } from './columns'
import { DataTable } from './data-table'
import LoadingPage from '@/components/misc/LoadingPage'
import BackButton from '@/components/misc/BackButton'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

const QuotesOrdersPage = () => {
  const { selectedStation, selectedCompany } = useCompanyStore();
  const { data: quotes, isLoading, isError } = useGetQuotes(selectedCompany && selectedCompany.slug || null,
    selectedStation || null);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title='Cotizaciones'>
      <div className='flex flex-col gap-y-2'>

        <div className="flex items-center gap-2">
          <BackButton iconOnly tooltip="Volver" variant="secondary" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>Compras</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Cotizaciones</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <h1 className="text-4xl font-bold text-center">Lista de Cotizaciones</h1>
        <p className="text-sm text-muted-foreground text-center italic">
          Aquí puede observar todas las cotizaciones generales. <br />Filtre y/o busque si desea una en específico.
        </p>

        {
          quotes && (
            <DataTable columns={columns} data={quotes} />
          )
        }
        {
          isError && <p className='text-muted-foreground italic'>Ha ocurrido un error al cargar las cotizaciones...</p>
        }
      </div>
    </ContentLayout>
  )
}

export default QuotesOrdersPage