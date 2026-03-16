'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import LoadingPage from '@/components/misc/LoadingPage'
import BackButton from '@/components/misc/BackButton'
import { useGetPurchaseOrders } from '@/hooks/mantenimiento/compras/useGetPurchaseOrders'
import { useCompanyStore } from '@/stores/CompanyStore'
import { getColumns } from './columns'
import { DataTable } from './data-table'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

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
                <BreadcrumbLink href={`/${selectedCompany?.slug ?? ''}/dashboard`}>Inicio</BreadcrumbLink>
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

        <h1 className="text-4xl font-bold text-center">Ordenes de Compra</h1>
        <p className="text-sm text-muted-foreground text-center italic">
          Aquí puede ver todas las ordenes de compra generadas a partir de las cotizaciones. <br />
          Filtre y/o busque si desea una específica.
        </p>

        <DataTable columns={columns} data={po || []} />

        {isError && (
          <p className="text-muted-foreground italic">
            Ha ocurrido un error al cargar las ordenes de compra...
          </p>
        )}
      </div>
    </ContentLayout>
  )
}

export default PurchaseOrdersPage