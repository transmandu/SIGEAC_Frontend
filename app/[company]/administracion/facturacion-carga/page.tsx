"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetCargoBillingClients } from "@/hooks/administracion/facturacion_carga/useGetCargoBillingClients";
import { useCompanyStore } from "@/stores/CompanyStore";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const FacturacionCargaPage = () => {
  const { selectedCompany } = useCompanyStore();
  const {
    data: clients,
    isLoading,
    isError,
  } = useGetCargoBillingClients(selectedCompany?.slug);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Facturación de Carga">
      <PageHeader className="mb-4" />

      <h1 className="text-4xl font-bold text-center mt-2">
        Facturación de Carga
      </h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Clientes con cobros de carga generados a partir de manifiestos.
      </p>

      {clients && <DataTable columns={columns} data={clients} />}

      {isError && (
        <p className="text-muted-foreground text-sm italic text-center mt-6">
          Ha ocurrido un error al cargar los clientes...
        </p>
      )}
    </ContentLayout>
  );
};

export default FacturacionCargaPage;
