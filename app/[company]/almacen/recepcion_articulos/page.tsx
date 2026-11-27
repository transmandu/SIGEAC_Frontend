"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ShieldOff } from "lucide-react";
import { useState } from "react";
import { ArticulosEnTransitoTab } from "./_components/ArticulosEnTransitoTab";
import { RecepcionGeneralTab } from "./_components/RecepcionGeneralTab";
import { TrasladosEntreSedesTab } from "./_components/TrasladosEntreSedesTab";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTabParam } from "@/hooks/helpers/use-tab-param";

const RECEPTION_TABS = ["transito", "traslados", "recepcion-general"] as const;
type ReceptionTab = (typeof RECEPTION_TABS)[number];

const ALMACEN_ROLES = [
  "ALMACEN",
  "JEFE_ALMACEN",
  "ANALISTA_ALMACEN",
  "JEFE_MANTENIMIENTO",
  "SUPERUSER",
];

const RecepcionArticulosPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();
  const [tab, setTab] = useTabParam(RECEPTION_TABS, "transito");
  // Cada pestaña se monta la primera vez que se ve y se conserva después. La
  // activa siempre cuenta como vista, también cuando llegó por la URL.
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set());
  const isVisited = (value: ReceptionTab) =>
    value === tab || visitedTabs.has(value);

  const userRoles = user?.roles?.map((r) => r.name) ?? [];
  const canView = ALMACEN_ROLES.some((r) => userRoles.includes(r));

  if (!canView) {
    return (
      <ContentLayout title="Recepción de Artículos">
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
          <ShieldOff className="size-10" />
          <p className="text-sm font-medium">
            No tienes permiso para ver esta sección.
          </p>
          <p className="text-xs">Se requiere el rol de Almacén.</p>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Recepción de Artículos">
      <div className="flex flex-col gap-y-3">
        {/* Breadcrumb */}
        <PageHeader className="mb-3" />

        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Recepción de Artículos</h1>
        </div>

        {/* Tabs */}
        <Tabs
          value={tab}
          className="space-y-4"
          onValueChange={(value) => {
            setVisitedTabs((prev) => new Set(prev).add(tab).add(value));
            setTab(value as ReceptionTab);
          }}
        >
          <TabsList>
            <TabsTrigger value="transito">Artículos en Tránsito</TabsTrigger>
            {/* Recibir un traslado es recibir: la diferencia con una
                            compra es de dónde viene, no lo que el almacén hace. */}
            <TabsTrigger value="traslados">Traslados entre Sedes</TabsTrigger>
            <TabsTrigger value="recepcion-general">
              Recepción General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transito">
            {isVisited("transito") && <ArticulosEnTransitoTab />}
          </TabsContent>

          <TabsContent value="traslados">
            {isVisited("traslados") && <TrasladosEntreSedesTab />}
          </TabsContent>

          <TabsContent value="recepcion-general">
            {isVisited("recepcion-general") && <RecepcionGeneralTab />}
          </TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  );
};

export default RecepcionArticulosPage;
