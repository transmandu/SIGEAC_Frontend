"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetSell } from "@/hooks/administracion/useGetSell";

const SellPage = () => {
  const { data, isLoading, isError } = useGetSell();

  if (isLoading) {
    return <LoadingPage />;
  }
  console.log(data);
  return (
    <ContentLayout title="Clientes">
      {" "}
      <h1 className="text-5xl font-bold text-center mt-2">
        Control de Ventas
      </h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Aquí puede llevar el control de las ventas que han sido registradas.
      </p>
      {data && <DataTable columns={columns} data={data} />}
      {isError && (
        <p className="text-muted-foreground text-sm italic text-center">
          Ha ocurrido un error al cargar las ventas...
        </p>
      )}
    </ContentLayout>
  );
};

export default SellPage;