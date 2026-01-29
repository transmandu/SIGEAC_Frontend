'use client'

import { ContentLayout } from '@/components/layout/ContentLayout'
import React, { useEffect } from 'react'
import { columns } from '@/app/[company]/almacen/solicitudes/salida/columns'
import { DataTable } from './data-table'
import { useGetDispatchesByLocation } from '@/hooks/mantenimiento/almacen/solicitudes/useGetDispatchesRequests'
import { useCompanyStore } from '@/stores/CompanyStore'
import { Loader2 } from 'lucide-react'
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Department, MaintenanceAircraft, WorkOrder } from '@/types'


export type DispatchArticle = {
  id: number | null;
  part_number?: string;
  serial?: string;
  description?: string;
  dispatch_quantity: string;
};

export type DispatchGroupRow = {
  id: number;
  status: string;
  requested_by: string;
  created_by: string;
  aircraft?: MaintenanceAircraft
  justification: string | null;
  department?: Department;
  submission_date: string | null;
  work_order?: string;
  articles: DispatchArticle[];
};

const DispatchRequestPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data: dispatches, isLoading: isDispatchesLoading, isError } = useGetDispatchesByLocation()

  return (
    <ContentLayout title='Salida'>
      <div className='flex flex-col gap-y-2'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Almacen</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>
                    <BreadcrumbLink href={`/${selectedCompany?.slug}/almacen/solicitudes/pendiente`}>Pendientes</BreadcrumbLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BreadcrumbLink href={`/${selectedCompany?.slug}/almacen/solicitudes/salida`}>Salida</BreadcrumbLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Salida</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
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
