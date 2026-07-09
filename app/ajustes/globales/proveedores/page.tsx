'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import BackButton from '@/components/misc/BackButton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useGetVendors } from '@/hooks/general/proveedores/useGetVendors';
import { getColumns } from './columns';
import { DataTable } from './data-table';
import { Vendor } from '@/types';
import VendorsToolBar from './_components/VendorsToolBar';
import VendorsSubRow from './_components/VendorsSubRow';

const VendorsPage = () => {
  const { selectedCompany } = useCompanyStore();

  const {
    data: vendors,
    isLoading,
    isError,
  } = useGetVendors(selectedCompany?.slug);

  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL');

  const deferredSearch = useDeferredValue(search);

  const filteredVendors = useMemo<Vendor[]>(() => {
    if (!vendors) return [];
    const q = deferredSearch.toLowerCase();
    return vendors.filter((vendor: Vendor) => {
      const matchesSearch =
        !deferredSearch.trim() ||
        vendor.name?.toLowerCase?.().includes(q) ||
        vendor.email?.toLowerCase?.().includes(q) ||
        vendor.phone?.toLowerCase?.().includes(q) ||
        vendor.address?.toLowerCase?.().includes(q);

      const matchesType =
        type === 'ALL' ||
        vendor.type === type;

      return matchesSearch && matchesType;
    });
  }, [vendors, deferredSearch, type]);

  const columns = useMemo(
    () => getColumns(selectedCompany ?? undefined),
    [selectedCompany]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingPage />
      </div>
    );
  }

  return (
    <ContentLayout title="Proveedores">
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
                <BreadcrumbPage> Proveedores </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">
                Proveedores
              </h1>

              <p className="text-sm text-muted-foreground">
                Visualiza y administra los proveedores y beneficiarios registrados
                dentro de la configuración global del sistema.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 px-3 py-2 rounded-xl border bg-slate-200/40 border-slate-200/40 dark:bg-slate-800/70 dark:border-slate-700/60 backdrop-blur-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
          <VendorsToolBar search={search} setSearch={setSearch} type={type} setType={setType}/>

          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {(vendors ?? []).length}{' '}
            {(vendors ?? []).length === 1 ? 'proveedor' : 'proveedores'}
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filteredVendors}
          renderSubRow={(vendor: Vendor) => (
            <VendorsSubRow vendor={vendor} />
          )}
        />

        {isError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-500">
              Ha ocurrido un error al cargar los proveedores.
            </p>
          </div>
        )}

      </div>
    </ContentLayout>
  );
};

export default VendorsPage;
