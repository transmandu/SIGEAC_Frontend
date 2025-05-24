'use client'
import { ContentLayout } from '@/components/layout/ContentLayout'
import { useGetPurchaseOrders } from '@/hooks/compras/useGetPurchaseOrders'
import { useCompanyStore } from '@/stores/CompanyStore'
import { columns } from './columns'
import { DataTable } from './data-table'
import LoadingPage from '@/components/misc/LoadingPage'

const PurchaseOrdersPage = () => {
  const { selectedStation, selectedCompany } = useCompanyStore();
  const { data, isLoading, isError } = useGetPurchaseOrders(selectedCompany && selectedCompany.split(' ').join('') || null,
    selectedStation || null);

  if (isLoading) {
    <LoadingPage />
  }

  return (
    <ContentLayout title="Ordenes de Compras">
      {" "}
      <h1 className="text-5xl font-bold text-center mt-2">
        Ordenes de Compras
      </h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Aquí puede llevar el control de las ordenes de compra
      </p>
      {data && <DataTable columns={columns} data={data} />}
      {isError && (
        <p className="text-muted-foreground text-sm italic text-center">
          Ha ocurrido un error al cargar las ordenes de compra...
        </p>
      )}
    </ContentLayout>
  )
}

export default PurchaseOrdersPage
