"use client";

import { useMemo } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetCatalogServices } from "@/hooks/mantenimiento/catalogo/useGetCatalogServices";
import { useCompanyStore } from "@/stores/CompanyStore";
import { getColumns } from "./columns";
import { DataTable } from "./data-table";

const ServicesPage = () => {
  const { selectedCompany } = useCompanyStore();
  const companySlug = selectedCompany?.slug ?? "";
  const { data: services, isLoading } = useGetCatalogServices(companySlug);
  const columns = useMemo(() => getColumns(companySlug), [companySlug]);

  if (isLoading) return <LoadingPage />;

  return (
    <ContentLayout title="Servicios y Certificados">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div className="flex flex-col gap-2 border-b pb-4">
          <h1 className="text-3xl font-semibold tracking-tight">Servicios y Certificados</h1>
          <p className="text-sm text-muted-foreground">
            El programa de mantenimiento: qué servicio/certificado aplica a cada aeronave, sus tareas y los
            materiales que exige el manual.
          </p>
        </div>

        <DataTable columns={columns} data={services ?? []} />
      </div>
    </ContentLayout>
  );
};

export default ServicesPage;
