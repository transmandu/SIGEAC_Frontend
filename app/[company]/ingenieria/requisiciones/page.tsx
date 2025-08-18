'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { useGetRequisition } from '@/hooks/mantenimiento/compras/useGetRequisitions';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useEffect, useState } from 'react';
import { columns } from './columns';
import { DataTable } from './data-table';
import { Requisition } from '@/types';

const RequisitionsPage = () => {
  const { user } = useAuth();
  const { selectedCompany, selectedStation } = useCompanyStore();
  const { data: requisitions, isLoading, isError } = useGetRequisition(
    selectedCompany?.slug,
    selectedStation ?? undefined
  );

  const [filteredRequisitions, setFilteredRequisitions] = useState<Requisition[]>([]);

  useEffect(() => {
    if (!requisitions) {
      setFilteredRequisitions([]);
      return;
    }
    const fullAccessRoles = ['SUPERUSER', 'ANALISTA_COMPRAS', "JEFE_COMPRAS"];
    const hasFullAccess = user?.roles?.some(role => fullAccessRoles.includes(role.name)) ?? false;
    if (hasFullAccess) {
      setFilteredRequisitions(requisitions);
    } else {
      setFilteredRequisitions(requisitions.filter(req => req.created_by?.id === user?.id));
    }
  }, [requisitions, user]);

  if (isLoading) {
    return <LoadingPage />;
  }

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
        <h1 className="text-4xl font-bold text-center">Solicitudes de Compra</h1>
        <p className="text-sm text-muted-foreground text-center italic">
          Aquí puede observar todas las solicitudes de compra generales. <br />Filtre y/o busque si desea una en específico.
        </p>
        {filteredRequisitions.length > 0 ? (
          <DataTable columns={columns} data={filteredRequisitions} />
        ) : (
          <DataTable columns={columns} data={[]} />
        )}
        {isError && <p className="text-muted-foreground italic">Ha ocurrido un error al cargar las solicitudes de compra...</p>}
      </div>
    </ContentLayout>
  );
};

export default RequisitionsPage;
