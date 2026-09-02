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
  unit?: string;
  // Identifica la LÍNEA de la salida, no el artículo: es lo que devuelve la
  // devolución, porque un mismo artículo puede figurar en varias líneas.
  article_dispatch_order_id?: number;
  returned_quantity?: number;
  pending_quantity?: number;
  status?: "DISPATCHED" | "PARTIALLY_RETURNED" | "RETURNED";
  // Solo la unidad serializada puede mandarse a incoming: un consumible es un
  // renglón con cantidad, no una pieza que un inspector pueda retener.
  is_inspectable?: boolean;
  // La devolución se captura en la unidad en que se despachó: si salieron 30
  // UNIDADES de un artículo con base METRO, se devuelve en unidades.
  return_unit?: string;
  pending_in_return_unit?: number;
  base_unit?: string;
  uses_alternate_unit?: boolean;
  /** Fotos de cómo se entregó el artículo; opcionales. */
  evidences?: { id: number; url: string | null }[];
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
