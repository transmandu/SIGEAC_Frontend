'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import { useGetWorkOrders } from '@/hooks/planificacion/useGetWorkOrders';
import { useCompanyStore } from '@/stores/CompanyStore';
import { Loader2 } from 'lucide-react';
import { columns } from './columns';
import { DataTable } from './data-table';

const WorkOrdersPage = () => {

  const { selectedStation } = useCompanyStore();

  const { data: work_orders, isLoading, isError } = useGetWorkOrders(selectedStation ?? null);


  if (isLoading) return <LoadingPage />

  return (
    <ContentLayout title='Ordenes de Trabajo'>
      <div className='flex flex-col gap-y-2'>
        <h1 className='text-5xl font-bold text-center'>Gestión de Ord. de Trabajo</h1>
        <p className='text-sm text-muted-foreground text-center'>
          Aquí puede observar todos las ordenes de trabajo realizadas. <br />Filtre y/o busque sí desea una orden en específico.
        </p>
        {
          work_orders && (
            <DataTable
              columns={columns}
              data={work_orders}
            />
          )
        }
        {
          isError && (
            <p className='text-center text-muted-foreground text-sm'>Ha ocurrido un error al cargar las ordens de trabajo...</p>
          )
        }
      </div>
    </ContentLayout>
  )
}

export default WorkOrdersPage
