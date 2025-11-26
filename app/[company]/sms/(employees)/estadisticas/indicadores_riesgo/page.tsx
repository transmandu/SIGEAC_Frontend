"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { ManagementReports } from "./_components/ManagementReports";
import { AverageReportIndicator } from "./_components/AverageReportIndicator";

export default function RiskIndicatorsPage() {
  const [activeTab, setActiveTab] = useState("ManagementReports");

  return (
    <ContentLayout title="Indicadores de Riesgo">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ManagementReports">
            Reportes Gestionados
          </TabsTrigger>
          <TabsTrigger value="AverageIncidents">
            Incidentes Promedio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ManagementReports">
          <ManagementReports />
        </TabsContent>

        <TabsContent value="AverageIncidents">
          <AverageReportIndicator />
        </TabsContent>
      </Tabs>
    </ContentLayout>
  );
};
