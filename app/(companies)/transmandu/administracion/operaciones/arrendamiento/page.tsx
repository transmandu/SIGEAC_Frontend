"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useGetRenting } from "@/hooks/administracion/useGetRenting";
import LoadingPage from "@/components/misc/LoadingPage";

const RentingPage = () => {
  const { data, isLoading, isError } = useGetRenting();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Arrendamiento">
      {" "}
      <h1 className="text-5xl font-bold text-center mt-2">
        Control de Arrendamientos
      </h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Aquí puede llevar el control de los arrendamientos registrados.
      </p>
      {data && <DataTable columns={columns} data={data} />}
      {isError && (
        <p className="text-muted-foreground text-sm italic text-center">
          Ha ocurrido un error al cargar los arrendamientos...
        </p>
      )}
    </ContentLayout>
  );
};

export default RentingPage;