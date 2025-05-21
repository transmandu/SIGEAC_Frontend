"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetAdministrationCompany } from "@/hooks/administracion/useGetAdministrationCompany";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const AdminCompany = () => {
  const { data, isLoading, isError } = useGetAdministrationCompany();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Empresa">
      {" "}
      <h1 className="text-5xl font-bold text-center mt-2">
        Control de Empresas
      </h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Aquí puede llevar el control de las empresas.
      </p>
      {data && <DataTable columns={columns} data={data} />}
      {isError && (
        <p className="text-muted-foreground text-sm italic text-center">
          Ha ocurrido un error al cargar las empresas...
        </p>
      )}
    </ContentLayout>
  );
};

export default AdminCompany;