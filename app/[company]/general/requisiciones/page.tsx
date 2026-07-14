'use client';

import { useEffect, useState, useMemo } from 'react';

import { ContentLayout } from '@/components/layout/ContentLayout';
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
import { cn } from '@/lib/utils';
import type { RequisitionType } from '@/types/purchase';

import { getColumns } from './columns';
import { DataTable } from './data-table';

type TypeFilter = 'ALL' | RequisitionType;

const RequisitionsPage = () => {
  const { user } = useAuth();
  const { selectedCompany, selectedStation } = useCompanyStore();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');

  const { data: requisitions, isLoading, isError } = useGetRequisition(
    selectedCompany?.slug,
    selectedStation ?? undefined
  );

  const fullAccessRoles = useMemo(
    () => [
      'SUPERUSER',
      'ANALISTA_COMPRAS',
      'JEFE_COMPRAS',
      'JEFE_ADMINISTRACION',
    ],
    []
  );

  const warehouseRoles = useMemo(
    () => ['JEFE_ALMACEN', 'ANALISTA_ALMACEN'],
    []
  );

  const userRoleNames = useMemo(
    () => user?.roles?.map(role => role.name) ?? [],
    [user]
  );

  const hasFullAccess = useMemo(() => {
    return userRoleNames.some(role => fullAccessRoles.includes(role));
  }, [userRoleNames, fullAccessRoles]);

  // JEFE_ALMACEN / ANALISTA_ALMACEN, cuando no tienen además un rol
  // full-access (compras/administración), solo deben ver las solicitudes
  // que se mueven dentro del módulo almacén (creadas por gente de almacén).
  const isWarehouseOnly = useMemo(() => {
    return (
      !hasFullAccess &&
      userRoleNames.some(role => warehouseRoles.includes(role))
    );
  }, [hasFullAccess, userRoleNames, warehouseRoles]);

  const canSeeRequisition = useMemo(() => {
    if (hasFullAccess) {
      return () => true;
    }

    if (isWarehouseOnly) {
      // Las solicitudes generadas automáticamente por stock mínimo no
      // tienen un usuario creador (created_by = "SYSTEM" en el backend,
      // por lo que llega como null), pero nacen del propio inventario de
      // almacén, así que siempre deben ser visibles para estos roles.
      return (req: NonNullable<typeof requisitions>[number]) =>
        !req.created_by ||
        (req.created_by.roles?.some(role => warehouseRoles.includes(role.name)) ?? false);
    }

    return (req: NonNullable<typeof requisitions>[number]) => req.created_by?.id === user?.id;
  }, [hasFullAccess, isWarehouseOnly, warehouseRoles, user]);

  const { accessFilteredRequisitions, totalAeronautical, totalGeneral } = useMemo(() => {
    if (!requisitions) {
      return { accessFilteredRequisitions: [], totalAeronautical: 0, totalGeneral: 0 };
    }

    const accessFilteredRequisitions = [];
    let totalAeronautical = 0;
    let totalGeneral = 0;

    for (const req of requisitions) {
      if (!canSeeRequisition(req)) continue;

      accessFilteredRequisitions.push(req);
      if (req.type === 'AERONAUTICAL') totalAeronautical++;
      else if (req.type === 'GENERAL') totalGeneral++;
    }

    return { accessFilteredRequisitions, totalAeronautical, totalGeneral };
  }, [requisitions, canSeeRequisition]);

  const filteredRequisitions = useMemo(() => {
    if (typeFilter === 'ALL') return accessFilteredRequisitions;

    return accessFilteredRequisitions.filter(req => req.type === typeFilter);
  }, [accessFilteredRequisitions, typeFilter]);

  const columns = useMemo(
    () => getColumns(selectedCompany ?? undefined),
    [selectedCompany]
  )
  
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

        <div className="flex rounded-md border border-border overflow-hidden w-fit">
          {(
            [
              { value: 'ALL', label: 'Todas', count: totalAeronautical + totalGeneral },
              { value: 'AERONAUTICAL', label: 'Aeronáutica', count: totalAeronautical },
              { value: 'GENERAL', label: 'General', count: totalGeneral },
            ] as { value: TypeFilter; label: string; count: number }[]
          ).map(({ value, label, count }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors border-r last:border-r-0',
                typeFilter === value
                  ? 'bg-muted text-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted/50'
              )}
            >
              {label}
              <span
                className={cn(
                  'ml-1.5 px-1 py-0 rounded text-[10px] font-semibold',
                  typeFilter === value ? 'bg-background/60' : 'bg-muted'
                )}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={filteredRequisitions}
          loading={isLoading}
        />

      </div>
    </ContentLayout>
  );
};

export default RequisitionsPage;