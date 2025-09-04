"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useGetClients } from "@/hooks/general/clientes/useGetClients";
import LoadingPage from "@/components/misc/LoadingPage";
import { useCompanyStore } from "@/stores/CompanyStore";


// CAMBIAR ID POR CDI, RIF O LO QUE SEA
const ClientsPage = () => {
const {selectedCompany} = useCompanyStore();
const { data, isLoading, isError } = useGetClients(selectedCompany?.slug);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Clientes">
      {" "}
      <h1 className="text-5xl font-bold text-center mt-2">
        Control de Clientes
      </h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Aquí puede llevar el control de los clientes registrados.
      </p>
      {data && <DataTable columns={columns} data={data} />}
      {isError && (
        <p className="text-muted-foreground text-sm italic text-center">
          Ha ocurrido un error al cargar los clientes...
        </p>
      )}
    </ContentLayout>
  );
};

export default ClientsPage;
