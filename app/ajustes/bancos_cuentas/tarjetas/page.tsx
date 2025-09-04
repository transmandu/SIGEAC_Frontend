"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetCards } from "@/hooks/general/tarjetas/useGetCards";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const BankAccountsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data: cards, isLoading, error } = useGetCards();
  return (
    <ContentLayout title={"Almacenes"}>
      <h1 className="text-4xl font-bold text-center mb-2">
        Control de Tarjetas
      </h1>
      <p className="text-sm text-muted-foreground text-center">
        Lleve un control de las diferentes cuentas que se han registrado.
      </p>
      {isLoading && (
        <div className="grid mt-72 place-content-center">
          <Loader2 className="w-12 h-12 animate-spin" />
        </div>
      )}
      {error && (
        <div className="grid mt-72 place-content-center">
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar las tarjetas...
          </p>
        </div>
      )}
      {cards && <DataTable columns={columns} data={cards} />}
    </ContentLayout>
  );
};

export default BankAccountsPage;
