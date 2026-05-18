'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import BackButton from '@/components/misc/BackButton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useGetShippingAgencies } from '@/hooks/general/agencias_envio/useGetShippingAgencies';
import { getColumns } from './columns';
import { DataTable } from './data-table';
import { ShippingAgency } from '@/types';
import ShippingAgenciesToolBar from './_components/ShippingAgenciesToolBar';
import ShippingAgenciesSubRow from './_components/ShippingAgenciesSubRow';

const ShippingAgenciesPage = () => {
  const { selectedCompany } = useCompanyStore();

  const {
    data: agencies,
    isLoading,
    isError,
  } = useGetShippingAgencies(selectedCompany?.slug);

  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL');

  const deferredSearch = useDeferredValue(search);

  const filteredAgencies = useMemo<ShippingAgency[]>(() => {
    if (!agencies) return [];
    const q = deferredSearch.toLowerCase();
    return agencies.filter((agency: ShippingAgency) => {
      const matchesSearch =
        !deferredSearch.trim() ||
        agency.name?.toLowerCase?.().includes(q) ||
        agency.code?.toLowerCase?.().includes(q) ||
        agency.description?.toLowerCase?.().includes(q) ||
        agency.phone?.toLowerCase?.().includes(q) ||
        agency.email?.toLowerCase?.().includes(q);

      const matchesType =
        type === 'ALL' ||
        agency.type === type;

      return matchesSearch && matchesType;
    });
  }, [agencies, deferredSearch, type]);

  const columns = useMemo(
    () => getColumns(selectedCompany ?? undefined),
    [selectedCompany]
  );

  if (isLoading && !agencies) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingPage />
      </div>
    );
  }

  return (
    <ContentLayout title="Agencias de Envío">
      <div className="flex flex-col gap-6">

        <div className="flex items-center gap-3">
          <BackButton iconOnly tooltip="Volver" variant="secondary"/>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                  Inicio
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                ...
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage> Agencias de Envío </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">
                Agencias de Envío
              </h1>

              <p className="text-sm text-muted-foreground">
                Visualiza y administra las agencias/agentes de envío registradas
                dentro de la configuración global del sistema.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 px-3 py-2 rounded-xl border bg-slate-200/40 border-slate-200/40 dark:bg-slate-800/70 dark:border-slate-700/60 backdrop-blur-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
          <ShippingAgenciesToolBar search={search} setSearch={setSearch} type={type} setType={setType}/>

          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {(agencies ?? []).length}{' '}
            {(agencies ?? []).length === 1 ? 'agencia' : 'agencias'}
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filteredAgencies}
          renderSubRow={(agency: ShippingAgency) => (
            <ShippingAgenciesSubRow agency={agency} />
          )}
        />

        {isError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-500">
              Ha ocurrido un error al cargar las agencias de envío.
            </p>
          </div>
        )}

      </div>
    </ContentLayout>
  );
};

export default ShippingAgenciesPage;