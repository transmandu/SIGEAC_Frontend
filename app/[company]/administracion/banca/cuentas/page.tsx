"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { useBankingPermissions } from "@/hooks/general/cuentas_bancarias/useBankingPermissions";
import { useGetBankAccounts } from "@/hooks/general/cuentas_bancarias/useGetBankAccounts";
import { useCompanyStore } from "@/stores/CompanyStore";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const CompanyBankAccountsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { canSeeFullNumber } = useBankingPermissions();
  const {
    data: accounts,
    isLoading,
    isError,
  } = useGetBankAccounts(
    selectedCompany?.id ? Number(selectedCompany.id) : undefined,
  );

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Cuentas Bancarias">
      <PageHeader />

      <h1 className="text-4xl font-bold text-center mt-2">Cuentas Bancarias</h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Cuentas de {selectedCompany?.name ?? "la empresa"} y los métodos de pago
        habilitados para cada una.
        {!canSeeFullNumber && " Los números se muestran parcialmente."}
      </p>

      {accounts && <DataTable columns={columns} data={accounts} />}

      {isError && (
        <p className="text-muted-foreground text-sm italic text-center mt-6">
          Ha ocurrido un error al cargar las cuentas...
        </p>
      )}
    </ContentLayout>
  );
};

export default CompanyBankAccountsPage;
