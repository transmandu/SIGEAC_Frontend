'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useCompanyStore } from '@/stores/CompanyStore';
import { columns } from './columns';
import { DataTable } from './data-table';

const RequisitionsPage = () => {
  const { selectedCompany} = useCompanyStore();
  return (
    <ContentLayout title="Inventario">
      <div className="flex flex-col gap-y-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>General</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Solicitudes de Compra</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-4xl font-bold text-center">Control de Incoming</h1>
        <p className="text-sm text-muted-foreground text-center italic">
          Aquí puede observar todas los articulos en espera de Incoming. <br />Filtre y/o busque si desea una en específico.
        </p>
        <DataTable columns={columns} data={[]}/>
      </div>
    </ContentLayout>
  );
};

export default RequisitionsPage;
