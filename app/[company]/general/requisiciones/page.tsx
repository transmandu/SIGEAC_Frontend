'use client';

import { useEffect, useState, useMemo } from 'react';

import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { useAuth } from '@/contexts/AuthContext';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useGetRequisition } from '@/hooks/mantenimiento/compras/useGetRequisitions';

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

  const fullAccessRoles = useMemo(
    () => [
      'SUPERUSER',
      'ANALISTA_COMPRAS',
      'JEFE_COMPRAS',
      'JEFE_ALMACEN',
    ],
    []
  );

  const hasFullAccess = useMemo(() => {
    return (
      user?.roles?.some(role => fullAccessRoles.includes(role.name)) ?? false
    );
  }, [user, fullAccessRoles]);

  const filteredRequisitions = useMemo(() => {
    if (!requisitions) return [];

    if (hasFullAccess) {
      return requisitions;
    }

    return requisitions.filter(req => {
      return req.created_by?.id === user?.id;
    });
  }, [requisitions, hasFullAccess, user]);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Inventario">
      <div className="flex flex-col gap-y-2">

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>General</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Solicitudes de Compra</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-4xl font-bold text-center">
          Solicitudes de Compra
        </h1>

        <p className="text-sm text-muted-foreground text-center italic">
          Aquí puede observar todas las solicitudes de compra generales.
          <br />
          Filtre y/o busque si desea una en específico.
        </p>

        {isError && (
          <p className="text-muted-foreground italic">
            Ha ocurrido un error al cargar las solicitudes de compra...
          </p>
        )}

        <DataTable
          columns={columns}
          data={filteredRequisitions}
        />

      </div>
    </ContentLayout>
  );
};

export default RequisitionsPage;