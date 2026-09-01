"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetCatalogManuals } from "@/hooks/mantenimiento/catalogo/useGetCatalogManuals";
import { useCompanyStore } from "@/stores/CompanyStore";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const ManualsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data: manuals, isLoading } = useGetCatalogManuals(selectedCompany?.slug);

  if (isLoading) return <LoadingPage />;

  return (
    <ContentLayout title="Manuales">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div className="flex flex-col gap-2 border-b pb-4">
          <h1 className="text-3xl font-semibold tracking-tight">Manuales</h1>
          <p className="text-sm text-muted-foreground">
            AMM, MPD, CMM y Directivas de Aeronavegabilidad/Boletines de Servicio de donde salen los servicios y
            certificados del catálogo.
          </p>
        </div>

        <DataTable columns={columns} data={manuals ?? []} />
      </div>
    </ContentLayout>
  );
};

export default ManualsPage;
