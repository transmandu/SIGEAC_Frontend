"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Boxes, Plane } from "lucide-react";
import { useState } from "react";
import { RecepcionesAeronauticasTab } from "./_components/RecepcionesAeronauticasTab";
import { RecepcionesGeneralesTab } from "./_components/RecepcionesGeneralesTab";

const HistorialRecepcionesPage = () => {
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    () => new Set(["aeronauticas"]),
  );

  return (
    <ContentLayout title="Historial de Recepciones">
      <div className="flex flex-col gap-y-6">
        <PageHeader />

        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Historial de Recepciones
          </h1>
          <p className="text-sm text-muted-foreground">
            Trazabilidad de lo recibido por la empresa, con sus reportes y
            estadísticas del período.
          </p>
        </div>

        <Tabs
          defaultValue="aeronauticas"
          className="flex flex-col gap-6"
          onValueChange={(value) => {
            if (!visitedTabs.has(value)) {
              setVisitedTabs((prev) => new Set(prev).add(value));
            }
          }}
        >
          <TabsList className="w-fit">
            <TabsTrigger value="aeronauticas" className="gap-2">
              <Plane className="size-4" />
              Aeronáuticas
            </TabsTrigger>
            <TabsTrigger value="generales" className="gap-2">
              <Boxes className="size-4" />
              Generales
            </TabsTrigger>
          </TabsList>

          <TabsContent value="aeronauticas" className="mt-0">
            {visitedTabs.has("aeronauticas") && <RecepcionesAeronauticasTab />}
          </TabsContent>

          <TabsContent value="generales" className="mt-0">
            {visitedTabs.has("generales") && <RecepcionesGeneralesTab />}
          </TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  );
};

export default HistorialRecepcionesPage;
