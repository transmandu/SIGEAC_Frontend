"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { InventarioAeronauticoTab } from "./_components/InventarioAeronauticoTab";
import { InventarioGeneralTab } from "./_components/InventarioGeneralTab";

// La edición libre de cantidades es un hueco de auditoría: el inventario
// aeronáutico debe moverse por ingresos/egresos registrados, no por esta
// pantalla. Se restringe a SUPERUSER hasta que se retire por completo.
const GestionCantidadesPage = () => {
  const { user } = useAuth();
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    () => new Set(["general"]),
  );

  const isSuperUser =
    user?.roles?.some((role) => role.name === "SUPERUSER") ?? false;

  return (
    <ContentLayout title="Gestión de Cantidades">
      <div className="flex flex-col gap-y-3">
        <PageHeader className="mb-3" />

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestión de Cantidades</h1>
        </div>

        <Tabs
          defaultValue="general"
          className="space-y-4"
          onValueChange={(value) => {
            if (!visitedTabs.has(value)) {
              setVisitedTabs((prev) => new Set(prev).add(value));
            }
          }}
        >
          <TabsList>
            <TabsTrigger value="general">Inventario General</TabsTrigger>
            {isSuperUser && (
              <TabsTrigger value="aeronautico">
                Inventario Aeronáutico
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="general">
            {visitedTabs.has("general") && <InventarioGeneralTab />}
          </TabsContent>

          {isSuperUser && (
            <TabsContent value="aeronautico">
              {visitedTabs.has("aeronautico") && <InventarioAeronauticoTab />}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </ContentLayout>
  );
};

export default GestionCantidadesPage;
