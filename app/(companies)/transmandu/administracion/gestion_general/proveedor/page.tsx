"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetAdministrationVendor } from "@/hooks/administracion/useGetAdministrationVendor";

const AdministrationVendor = () => {
  const { data, isLoading, isError } = useGetAdministrationVendor();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Empresa">
      {" "}
      <h1 className="text-5xl font-bold text-center mt-2">
        Control de Proveedores
      </h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Aquí puede llevar el control de los proveedores.
      </p>
      {data && <DataTable columns={columns} data={data} />}
      {isError && (
        <p className="text-muted-foreground text-sm italic text-center">
          Ha ocurrido un error al cargar los proveedores...
        </p>
      )}
    </ContentLayout>
  );
};

export default AdministrationVendor;