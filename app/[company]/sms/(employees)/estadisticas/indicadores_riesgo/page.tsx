"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { ManagementReports } from "./_components/ManagementReports";
import { AverageReportIndicator } from "./_components/AverageReportIndicator";


export default function RiskIndicatorsPage() {
  const [manualTab, setManualTab] = useState("ManagementReports");
  const activeTab = manualTab;

  return (
    <ContentLayout title="Indicadores de Riesgo" data-tour="indicadores-header">
      <Tabs value={activeTab} onValueChange={setManualTab} className="w-full">
        <TabsList
          className="grid w-full grid-cols-2"
          data-tour="indicadores-tabs"
        >
          <TabsTrigger value="ManagementReports">
            Reportes Gestionados
          </TabsTrigger>
          <TabsTrigger value="AverageIncidents">
            Incidentes Promedio
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="ManagementReports"
          className="data-[state=inactive]:hidden"
          forceMount
        >
          <ManagementReports />
        </TabsContent>

        <TabsContent
          value="AverageIncidents"
          className="data-[state=inactive]:hidden"
          forceMount
        >
          <AverageReportIndicator />
        </TabsContent>
      </Tabs>
    </ContentLayout>
  );
}
