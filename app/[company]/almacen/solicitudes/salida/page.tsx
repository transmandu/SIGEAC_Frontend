'use client'

import { columns } from '@/app/[company]/almacen/solicitudes/salida/columns'
import { ContentLayout } from '@/components/layout/ContentLayout'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useGetDispatchesByLocation } from '@/hooks/mantenimiento/almacen/solicitudes/useGetDispatchesRequests'
import { useCompanyStore } from '@/stores/CompanyStore'
import { Department, MaintenanceAircraft } from '@/types'
import { Loader2 } from 'lucide-react'
import { DataTable } from './data-table'
import { PageHeader } from "@/components/layout/PageHeader";


export type DispatchArticle = {
  id: number | null;
  part_number?: string;
  serial?: string;
  description?: string;
  dispatch_quantity: string;
  category?: string;
};

export type DispatchGroupRow = {
  id: number;
  request_number: string;
  status: string;
  requested_by: string;
  created_by: string;
  aircraft?: MaintenanceAircraft
  justification: string | null;
  department?: Department;
  submission_date: string | null;
  authorized_employee?: {
    full_name: string;
    from_company_db: string;
  }
  work_order?: string;
  articles: DispatchArticle[];
};

const DispatchRequestPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data: dispatches, isLoading: isDispatchesLoading, isError } = useGetDispatchesByLocation()

  return (
    <ContentLayout title='Salida'>
      <div className='flex flex-col gap-y-2'>
        <PageHeader className="mb-4" />
        {
          isDispatchesLoading && (
            <div className='flex w-full h-full justify-center items-center'>
              <Loader2 className='size-24 animate-spin mt-48' />
            </div>
          )
        }
        {
          dispatches && (
            <DataTable columns={columns} data={dispatches} />

          )
        }
        {
          isError && <p className='text-sm text-muted-foreground'>Ha ocurrido un error al cargar las solicitudes...</p>
        }
      </div>
    </ContentLayout>
  )
}

export default DispatchRequestPage
