"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetConditions } from "@/hooks/administracion/useGetConditions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const ClientsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data, isLoading, isError } = useGetConditions();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Condiciones">
      {" "}
      <h1 className="text-5xl font-bold text-center mt-2">
        Control de Condiciones
      </h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Aquí puede llevar el control de las condiciones registradas.
      </p>
      {data && <DataTable columns={columns} data={data} />}
      {isError && (
        <p className="text-muted-foreground text-sm italic text-center">
          Ha ocurrido un error al cargar las condiciones...
        </p>
      )}
    </ContentLayout>
  );
};

export default ClientsPage;
