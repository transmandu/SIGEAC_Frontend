"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetBanks } from "@/hooks/general/bancos/useGetBanks";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useEffect } from "react";
import { useTourContext } from "@/components/tour/TourProvider";
import { bancosSteps } from "@/components/tour/steps/ajustes/banca/banco";

const BanksPage = () => {
  const { data: banks, isLoading, error } = useGetBanks();
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (banks && banks.length > 0) {
      registerTour("bancos", "Bancos", bancosSteps);
    }

    return () => unregisterTour("bancos");
  }, [registerTour, unregisterTour, banks]);

  return (
    <ContentLayout title={"Bancos"}>
      <div data-tour="bancos-title">
        <h1 className="text-4xl font-bold text-center mb-2">
          Control de Bancos
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          Registro global de instituciones bancarias.
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
            Ha ocurrido un error al cargar los bancos...
          </p>
        </div>
      )}
      {banks && <DataTable columns={columns} data={banks} />}
    </ContentLayout>
  );
};

export default BanksPage;
