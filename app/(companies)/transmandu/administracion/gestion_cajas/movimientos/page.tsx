"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetCashMovements } from "@/hooks/administracion/movimientos/useGetMovement";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const CashMovement = () => {
  const { data, isLoading, isError } = useGetCashMovements();
  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Movimientos">
      {" "}
      <h1 className="text-5xl font-bold text-center mt-2">
        Control de Movimientos
      </h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Aquí puede llevar el control de los movimientos.
      </p>
      {data && <DataTable columns={columns} data={data} />}
      {isError && (
        <p className="text-muted-foreground text-sm italic text-center">
          Ha ocurrido un error al cargar los movimientos...
        </p>
      )}
    </ContentLayout>
  );
};

export default CashMovement;
