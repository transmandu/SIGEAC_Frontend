'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { useGetCertificates } from '@/hooks/mantenimiento/ingenieria/useGetCertificates';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useCompanyStore } from '@/stores/CompanyStore';

const InventarioPage = () => {
  const { user } = useAuth();
  const { selectedCompany } = useCompanyStore();
  const { data: certificates, isLoading, isError } = useGetCertificates(selectedCompany?.slug)

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
              <BreadcrumbPage>Requisiciones de Compra</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-4xl font-bold text-center">Certificados</h1>
        <p className="text-sm text-muted-foreground text-center italic">
          Aquí se gestionan los diferentes certificados y/o documentos que un articulo pueda requerir para verificiar su autenticidad.
        </p>
        {
          certificates && <DataTable columns={columns} data={certificates} />
        }
        {isError && <p className="text-muted-foreground italic">Ha ocurrido un error al cargar las requisiciones...</p>}
      </div>
    </ContentLayout>
  );
};

export default InventarioPage;
