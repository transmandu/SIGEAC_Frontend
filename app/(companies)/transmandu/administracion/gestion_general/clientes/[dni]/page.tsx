"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ClientStatistics from "./_components/ClientStatistics";
import ClientDebts from "./_components/ClientDebts";

export default function ClientFlightReportPage() {
  return (
    <ContentLayout title="Resumen de Cliente">
      <Tabs defaultValue="statistics">
        <TabsList>
          <TabsTrigger value="statistics">Estadisticas</TabsTrigger>
          <TabsTrigger value="debts">Deudas</TabsTrigger>
        </TabsList>
        <TabsContent value="statistics">
          <ClientStatistics />
        </TabsContent>
        <TabsContent value="debts"><ClientDebts/></TabsContent>
      </Tabs>

    </ContentLayout>
  );
}
