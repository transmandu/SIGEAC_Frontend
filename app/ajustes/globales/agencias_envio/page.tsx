'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import BackButton from '@/components/misc/BackButton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { useCompanyStore } from '@/stores/CompanyStore';
import { useGetShippingAgencies } from '@/hooks/general/agencias_envio/useGetShippingAgencies';

import { getColumns } from './columns';
import { DataTable } from './data-table';
import { ShippingAgency } from '@/types';

const ShippingAgenciesPage = () => {
  const { selectedCompany } = useCompanyStore();

  const {
    data: agencies,
    isLoading,
    isError,
  } = useGetShippingAgencies(selectedCompany?.slug);

  const columns = getColumns(selectedCompany ?? undefined);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Agencias de Envío">
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-2">
          <BackButton iconOnly tooltip="Volver" variant="secondary" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}> Inicio </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>Ajustes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>Globales</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Agencias de Envío</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <h1 className="text-4xl font-bold text-center">
          Agencias de Envío
        </h1>

        <p className="text-sm text-muted-foreground text-center italic">
          Administre las agencias de envío disponibles en el sistema. <br />
          Puede crear, editar o eliminar registros según sea necesario.
        </p>

        <DataTable
          columns={columns}
          data={(agencies ?? []) as ShippingAgency[]}
        />
      </div>
    </ContentLayout>
  );
};

export default ShippingAgenciesPage;