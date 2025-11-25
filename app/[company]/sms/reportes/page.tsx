"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoluntaryReportsPage } from "./voluntary-page";
import { ObligatoryReportsPage } from "./obligatory-page";

export default function ReportsPage() {
  const title = "Gestión de Reportes";

  return (
    <ContentLayout title={title}>
      <Tabs defaultValue="voluntarios" className="w-full">
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
