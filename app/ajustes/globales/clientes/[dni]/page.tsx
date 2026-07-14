"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientStatistics from "./_components/ClientStatistics";
import ClientDebts from "./_components/ClientDebts";
import { useState, useEffect } from "react";
import { useTour } from "@reactour/tour";
import { useTourContext } from "@/components/tour/TourProvider";
import { clientesDetalleSteps } from "@/components/tour/steps/ajustes/globales/clientes/clientes-detalle";

export default function ClientFlightReportPage() {
  const [manualTab, setManualTab] = useState("statistics");
  const { currentStep, isOpen } = useTour();
  const activeTab = isOpen
    ? currentStep >= 4
      ? "debts"
      : "statistics"
    : manualTab;
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    registerTour(
      "clientes-detalle",
      "Clientes - Detalle",
      clientesDetalleSteps,
    );
    return () => unregisterTour("clientes-detalle");
  }, [registerTour, unregisterTour]);

  return (
    <ContentLayout title="Resumen de Cliente">
      <Tabs value={activeTab} onValueChange={setManualTab}>
        <TabsList data-tour="clientes-detalle-tabs">
          <TabsTrigger value="statistics">Estadisticas</TabsTrigger>
          <TabsTrigger value="debts">Deudas</TabsTrigger>
        </TabsList>
        <TabsContent
          value="statistics"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          <ClientStatistics />
        </TabsContent>
        <TabsContent
          value="debts"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          <ClientDebts />
        </TabsContent>
      </Tabs>
    </ContentLayout>
  );
}
