"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { columns } from "./columns";
import LoadingPage from "@/components/misc/LoadingPage";
import { DataTable } from "./data-table";
import { useGetCredit } from "@/hooks/administracion/creditos/useGetCredit";

const CreditPage = () => {
  const { data, isLoading, isError } = useGetCredit();

  if (isLoading) {
    return <LoadingPage />;
  }
  console.log(data);
  return (
    <ContentLayout title="Crédito">
      {" "}
      <h1 className="text-5xl font-bold text-center mt-2">
        Control de Cuentas por Pagar
      </h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
      Aquí puede llevar el control de las cuentas por pagar registradas.
      </p>
      {data && <DataTable columns={columns} data={data} />}
      {isError && (
        <p className="text-muted-foreground text-sm italic text-center">
          Ha ocurrido un error al cargar los créditos de los pagos pendientes por pagar...
        </p>
      )}
    </ContentLayout>
  );
};

export default CreditPage;