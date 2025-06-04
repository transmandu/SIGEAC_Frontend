'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import LoadingPage from '@/components/misc/LoadingPage'
import { useGetUnits } from '@/hooks/general/unidades/useGetPrimaryUnits'
import { useGetSecondaryUnits } from '@/hooks/general/unidades/useGetSecondaryUnits'
import { columns } from './columns'
import { PrimaryDataTable } from './primary-data-table'
import { secondary_columns } from './secondary-columns'
import { SecondaryDataTable } from './secondary-data-table'

const UnitsPage = () => {
  const { data: primaryUnits, isLoading: primaryLoading, isError: primaryError } = useGetUnits()
  const { data: secondaryUnits, isLoading: secondaryLoading, isError: secondaryError } = useGetSecondaryUnits()
  if (primaryLoading || secondaryLoading) {
    return <LoadingPage />
  }
  return (
    <ContentLayout title="Unidades">
      <h1 className='text-5xl font-bold text-center mt-2'>
        Control de Unidades
      </h1>
      <p className='text-sm text-muted-foreground text-center italic mt-2'>Aquí puede llevar el control de las unidades primarias para las diferentes conversiones necesarias.</p>
      <div className='flex flex-col lg:flex-row gap-2'>
        {
          primaryUnits && <PrimaryDataTable columns={columns} data={primaryUnits} />
        }
        {
          secondaryUnits && <SecondaryDataTable columns={secondary_columns} data={secondaryUnits} />
        }
      </div>
    </ContentLayout>
  )
}

export default UnitsPage
