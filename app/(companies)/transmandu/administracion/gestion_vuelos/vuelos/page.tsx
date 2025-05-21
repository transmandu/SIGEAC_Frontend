"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useGetFlights } from "@/hooks/administracion/vuelos/useGetFlights";
import LoadingPage from "@/components/misc/LoadingPage";

const FlightPage = () => {
  const { data, isLoading, isError } = useGetFlights();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Vuelos">
      {" "}
      <h1 className="text-5xl font-bold text-center mt-2">Control de Vuelos</h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Aquí puede llevar el control de los vuelos registrados.
      </p>
      {data && <DataTable columns={columns} data={data} />}
      {isError && (
        <p className="text-muted-foreground text-sm italic text-center">
          Ha ocurrido un error al cargar los vuelos...
        </p>
      )}
    </ContentLayout>
  );
};

export default FlightPage;