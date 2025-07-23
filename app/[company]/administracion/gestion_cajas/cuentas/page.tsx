"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetAccountant } from "@/hooks/aerolinea/cuentas_contables/useGetAccountant";

const ClientsPage = () => {
  const { data, isLoading, isError } = useGetAccountant();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Cuentas">
      {" "}
      <h1 className="text-5xl font-bold text-center mt-2">
        Control de Cuentas
      </h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Aquí puede llevar el control de las cuentas.
      </p>
      {data && <DataTable columns={columns} data={data} />}
      {isError && (
        <p className="text-muted-foreground text-sm italic text-center">
          Ha ocurrido un error al cargar las cuentas...
        </p>
      )}
    </ContentLayout>
  );
};

export default ClientsPage;
