"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { columns } from "./columns";
import LoadingPage from "@/components/misc/LoadingPage";
import { DataTable } from "./data-table";
import { useGetCreditFlight } from "@/hooks/aerolinea/creditos/useGetCreditFlight";

const CreditPage = () => {
  const { data, isLoading, isError } = useGetCreditFlight();

  if (isLoading) {
    return <LoadingPage />;
  }
  return (
    <ContentLayout title="Crédito">
      {" "}
      <h1 className="text-5xl font-bold text-center mt-2">
        Control de Pagos de los Vuelos
      </h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
      Aquí puede llevar el control de las cuentas por cobrar con respecto a los vuelos registrados.
      </p>
      {data && <DataTable columns={columns} data={data} />}
      {isError && (
        <p className="text-muted-foreground text-sm italic text-center">
          Ha ocurrido un error al cargar los créditos de los vuelos...
        </p>
      )}
    </ContentLayout>
  );
};

export default CreditPage;
