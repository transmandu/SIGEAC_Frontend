"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoluntaryReportsPage } from "./voluntary-page";
import { ObligatoryReportsPage } from "./obligatory-page";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTabParam } from "@/hooks/helpers/use-tab-param";

const REPORT_TABS = ["voluntarios", "obligatorios"] as const;

export default function ReportsPage() {
  const title = "Gestión de Reportes";
  const [tab, setTab] = useTabParam(REPORT_TABS, "voluntarios");

  return (
    <ContentLayout title={title}>
      <PageHeader className="mb-6" />

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as (typeof REPORT_TABS)[number])}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="voluntarios" className="flex items-center gap-2">
            Reportes Voluntarios
          </TabsTrigger>
          <TabsTrigger value="obligatorios" className="flex items-center gap-2">
            Reportes Obligatorios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voluntarios" className="space-y-4">
          <VoluntaryReportsPage showHeader={false} />
        </TabsContent>

        <TabsContent value="obligatorios" className="space-y-4">
          <ObligatoryReportsPage showHeader={false} />
        </TabsContent>
      </Tabs>
    </ContentLayout>
  );
}
