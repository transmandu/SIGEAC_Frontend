"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetBankAccounts } from "@/hooks/general/cuentas_bancarias/useGetBankAccounts";
import { useCompanyStore } from "@/stores/CompanyStore";

const BankAccountsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const {
    data: accounts,
    isLoading,
    error,
  } = useGetBankAccounts();
  return (
    <ContentLayout title={"Almacenes"}>
      <h1 className="text-4xl font-bold text-center mb-2">
        Control de Cuentas
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
            Ha ocurrido un error al cargar los almacenes...
          </p>
        </div>
      )}
      {accounts && <DataTable columns={columns} data={accounts} />}
    </ContentLayout>
  );
};

export default BankAccountsPage;
