"use client"

import { ContentLayout } from '@/components/layout/ContentLayout'
import LoadingPage from '@/components/misc/LoadingPage'
import { useGetMaintenanceServices } from '@/hooks/mantenimiento/planificacion/useGetMaintenanceServices'
import { columns } from './columns'
import { DataTable } from './data-table'
import { useCompanyStore } from '@/stores/CompanyStore'

const AircraftsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data: services, isLoading } = useGetMaintenanceServices(selectedCompany?.slug)
  if (isLoading) return <LoadingPage />
  return (
    <ContentLayout title='Aeronaves'>
      <div className='flex flex-col text-center justify-center gap-2'>
        <h1 className='font-bold text-5xl'>Gestión de Servicios</h1>
        <p className='text-muted-foreground italic text-sm'>Aquí puede llevar un registro de todas los servicios registrados en el sistema.</p>
      </div>

      {
        services && <DataTable columns={columns} data={services} />
      }

    </ContentLayout>
  )
}

export default AircraftsPage
