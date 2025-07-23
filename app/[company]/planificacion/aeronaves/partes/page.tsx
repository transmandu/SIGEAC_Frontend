"use client"

import { ContentLayout } from '@/components/layout/ContentLayout'
import LoadingPage from '@/components/misc/LoadingPage'
import React from 'react'
import { DataTable } from './data-table'
import { columns } from './columns'
import { useGetAircraftsParts } from '@/hooks/mantenimiento/planificacion/useGetAircraftParts'

const AircraftsPage = () => {

  const { data: parts, isLoading, isError } = useGetAircraftsParts()

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <ContentLayout title='Aeronaves'>
      <div className='flex flex-col text-center justify-center gap-2'>
        <h1 className='font-bold text-5xl'>Gestión de Partes</h1>
        <p className='text-muted-foreground italic text-sm'>Aquí puede llevar un registro de todas las aeronaves registradas en el sistema. <br />Puede crear o editar las aeronaves de ser necesarios.</p>
      </div>
      {
        parts && <DataTable columns={columns} data={parts} />
      }
      {
        isError && <p className='text-muted-foreground italic text-center'>Ha ocurrido un error al cargar los datos...</p>
      }
    </ContentLayout>
  )
}

export default AircraftsPage
