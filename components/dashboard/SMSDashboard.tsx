// components/dashboard/WarehouseDashboard.tsx
"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types";
import {
  AreaChartIcon,
  LayoutDashboard,
  NotebookText,
  Plane,
  Shield
} from "lucide-react";
import { useState } from "react";

// Subcomponents
import ArticlesSummary from "@/components/dashboard/sections/ArticlesSummary";
import SMSDashboardSummary from "./sections/SMS/SMSDashboardSummary";
import SMSStatistics from "./sections/SMS/SMSStatistics";

interface SMSDashboardProps {
  companySlug: string;
  location_id: string;
  user: User;
  roleNames: string[];
}

export default function SMSDashboard({
  companySlug,
  location_id,
  user,
  roleNames,
}: SMSDashboardProps) {
  const [activeTab, setActiveTab] = useState("DASHBOARD");

  return (
    <ContentLayout title={`Dashboard / ${companySlug || ""}`}>
      <header className="shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Sistema de Gestión Aeronáutica Civil
              </h1>
              <p className="text-sm">Plataforma oficial de administración</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Sistema Seguro</span>
          </div>
        </div>
      </header>

      {/* Tabs principales */}
      <main className="max-w-7xl mt-6 mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex justify-center mb-0 space-x-3 border-b rounded-t-xl bg-muted/40">
            <TabsTrigger
              value="DASHBOARD"
              className="flex gap-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-t-lg px-3 py-2"
            >
              <LayoutDashboard className="size-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="REPORTS"
              className="flex gap-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-t-lg px-3 py-2"
            >
              <NotebookText className="size-4" /> Reportes
            </TabsTrigger>
            <TabsTrigger
              value="STATISTICS"
              className="flex gap-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-t-lg px-3 py-2"
            >
              <AreaChartIcon className="size-4" /> Estadisticas
            </TabsTrigger>
          </TabsList>

          <div className="mt-10">
            <TabsContent value="DASHBOARD">
              <div className="mt-6">
                <SMSDashboardSummary companySlug={companySlug} />
              </div>
            </TabsContent>

            <TabsContent value="REPORTS">
              {/* <ArticlesSummary
                data={data}
                isLoading={isLoading}
                isError={isError}
              /> */}
            </TabsContent>

            <TabsContent value="STATISTICS">
              <SMSStatistics companySlug={companySlug} />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </ContentLayout>
  );
}
