"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetCash } from "@/hooks/administracion/cajas/useGetCash";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const Cash = () => {
  const { data, isLoading, isError } = useGetCash();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Caja">
      {" "}
      <h1 className="text-5xl font-bold text-center mt-2">Control de Cajas</h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Aquí puede llevar el control de las cajas.
      </p>
      {data && <DataTable columns={columns} data={data} />}
      {isError && (
        <p className="text-muted-foreground text-sm italic text-center">
          Ha ocurrido un error al cargar las cajas...
        </p>
      )}
    </ContentLayout>
  );
};

export default Cash;
