"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ObligatoryReportsPage } from "./reportes_obligatorios/(employees)/page";
import { VoluntaryReportsPage } from "./reportes_voluntarios/(employeees)/page";

interface ReportsTabsProps {
  title?: string;
  companySlug?: string;
  defaultTab?: "obligatorios" | "voluntarios";
}

export const ReportsTabs = ({
  title = "Gestión de Reportes",
  companySlug,
  defaultTab = "voluntarios",
}: ReportsTabsProps) => {
  return (
    <ContentLayout title={title}>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="voluntarios" className="flex items-center gap-2">
            Reportes Voluntarios
          </TabsTrigger>
          <TabsTrigger value="obligatorios" className="flex items-center gap-2">
            Reportes Obligatorios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voluntarios" className="space-y-4">
          <VoluntaryReportsPage showHeader={false} companySlug={companySlug} />
        </TabsContent>

        <TabsContent value="obligatorios" className="space-y-4">
          <ObligatoryReportsPage showHeader={false} companySlug={companySlug} />
        </TabsContent>
      </Tabs>
    </ContentLayout>
  );
};

export default ReportsTabs;
