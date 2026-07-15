"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetBankCards } from "@/hooks/general/tarjetas/useGetBankCards";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useEffect } from "react";
import { useTourContext } from "@/components/tour/TourProvider";
import { tarjetasSteps } from "@/components/tour/steps/ajustes/banca/tarjeras";

const BankAccountsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data: cards, isLoading, error } = useGetBankCards();
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (cards && cards.length > 0) {
      registerTour("tarjetas", "Tarjetas", tarjetasSteps);
    }
    return () => unregisterTour("tarjetas");
  }, [registerTour, unregisterTour, cards]);

  return (
    <ContentLayout title={"Tarjetas"}>
      <div data-tour="tarjetas-title">
        <h1 className="text-4xl font-bold text-center mb-2">
          Control de Tarjetas
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          Tarjetas registradas bajo métodos de pago de tipo TARJETA y su validez
          por compañía.
        </p>
      </div>
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
