"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { useBankingPermissions } from "@/hooks/general/cuentas_bancarias/useBankingPermissions";
import { useGetBankCards } from "@/hooks/general/tarjetas/useGetBankCards";
import { useCompanyStore } from "@/stores/CompanyStore";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const CompanyBankCardsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { canSeeFullNumber } = useBankingPermissions();
  const {
    data: cards,
    isLoading,
    isError,
  } = useGetBankCards(
    selectedCompany?.id ? Number(selectedCompany.id) : undefined,
  );

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Tarjetas">
      <PageHeader />

      <h1 className="text-4xl font-bold text-center mt-2">Tarjetas Bancarias</h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Tarjetas de {selectedCompany?.name ?? "la empresa"} y la cuenta de la
        que sale el dinero de cada una.
        {!canSeeFullNumber && " Los números se muestran parcialmente."}
      </p>

      {cards && <DataTable columns={columns} data={cards} />}

      {isError && (
        <p className="text-muted-foreground text-sm italic text-center mt-6">
          Ha ocurrido un error al cargar las tarjetas...
        </p>
      )}
    </ContentLayout>
  );
};

export default CompanyBankCardsPage;
