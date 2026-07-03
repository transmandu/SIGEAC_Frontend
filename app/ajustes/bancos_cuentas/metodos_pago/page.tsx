"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetPaymentMethods } from "@/hooks/general/metodos_pago/useGetPaymentMethods";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const PaymentMethodsPage = () => {
  const { data: paymentMethods, isLoading, error } = useGetPaymentMethods();
  return (
    <ContentLayout title={"Métodos de Pago"}>
      <h1 className="text-4xl font-bold text-center mb-2">
        Control de Métodos de Pago
      </h1>
      <p className="text-sm text-muted-foreground text-center">
        Catálogo fijo definido por el sistema (solo lectura): el nombre del registro es el tipo de pago. Cada cuenta bancaria define cuáles puede usar.
      </p>
      {isLoading && (
        <div className="grid mt-72 place-content-center">
          <Loader2 className="w-12 h-12 animate-spin" />
        </div>
      )}
      {error && (
        <div className="grid mt-72 place-content-center">
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar los métodos de pago...
          </p>
        </div>
      )}
      {paymentMethods && <DataTable columns={columns} data={paymentMethods} />}
    </ContentLayout>
  );
};

export default PaymentMethodsPage;
