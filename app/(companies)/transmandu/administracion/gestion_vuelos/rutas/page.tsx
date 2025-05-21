"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetRoute } from "@/hooks/administracion/useGetRoutes";
import LoadingPage from "@/components/misc/LoadingPage";
import { RouteDialog } from "@/components/dialogs/CreateRouteDialog";

const FehaPage = () => {
  const { data, isLoading, isError } = useGetRoute();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Rutas">
      {" "}
      <h1 className="text-5xl font-bold text-center mt-2">Control de Rutas</h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Aquí puede llevar el control de las rutas registrados para las
        aeronaves.
      </p>
      {data && <DataTable columns={columns} data={data} />}
      {isError && (
        <p className="text-muted-foreground text-sm italic text-center">
          Ha ocurrido un error al cargar las rutas...
        </p>
      )}
    </ContentLayout>
  );
};

export default FehaPage;
