"use client"

import { ContentLayout } from '@/components/layout/ContentLayout'
import LoadingPage from '@/components/misc/LoadingPage'
import { useGetFlightControl } from '@/hooks/mantenimiento/planificacion/useGetFlightsControl'
import { columns } from './columns'
import { DataTable } from './data-table'
import { useCompanyStore } from '@/stores/CompanyStore'

const FlightControlPage = () => {
  const {selectedCompany} = useCompanyStore()
  const { data: flights, isLoading, isError } = useGetFlightControl(selectedCompany?.slug)
  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <ContentLayout title='Aeronaves'>
      <div className='flex flex-col text-center justify-center gap-2'>
        <h1 className='font-bold text-5xl'>Control de Vuelos</h1>
        <p className='text-muted-foreground italic text-sm'>Aquí puede llevar un registro de todas los vuelos registrados por aeronave.</p>
      </div>
      {
        flights && <DataTable columns={columns} data={flights} />
      }
      {
        isError && <p className='text-muted-foreground italic text-center'>Ha ocurrido un error al cargar los datos...</p>
      }
    </ContentLayout>
  )
}

export default FlightControlPage
