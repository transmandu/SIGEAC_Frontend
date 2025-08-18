"use client"

import { ContentLayout } from '@/components/layout/ContentLayout'
import LoadingPage from '@/components/misc/LoadingPage'
import { useGetMaintenanceAircrafts } from '@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts'
import React from 'react'
import { DataTable } from './data-table'
import { columns } from './columns'
import { useCompanyStore } from '@/stores/CompanyStore'

const AircraftsPage = () => {

  const { selectedCompany } = useCompanyStore();
  const { data: aircrafts, isLoading, isError } = useGetMaintenanceAircrafts(selectedCompany?.slug)

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <ContentLayout title='Aeronaves'>
      <div className='flex flex-col text-center justify-center gap-2'>
        <h1 className='font-bold text-5xl'>Gestión de Aeronaves</h1>
        <p className='text-muted-foreground italic text-sm'>Aquí puede llevar un registro de todas las aeronaves registradas en el sistema. <br />Puede crear o editar las aeronaves de ser necesarios.</p>
      </div>
      {
        aircrafts && <DataTable columns={columns} data={aircrafts} />
      }
      {
        isError && <p className='text-muted-foreground italic text-center'>Ha ocurrido un error al cargar los datos...</p>
      }
    </ContentLayout>
  )
}

export default AircraftsPage
