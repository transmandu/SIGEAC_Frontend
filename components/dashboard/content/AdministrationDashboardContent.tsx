"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileBarChart2 } from "lucide-react";
import { useState } from "react";
import { User } from "@/types";
import { useGetWarehouseDashboard } from "@/hooks/sistema/dashboard/useWarehouseDashboard";

import DispatchWarehouseReports from "@/components/dashboard/sections/Administration/DispatchWarehouseReports";
import DispatchSummary from "../sections/Administration/DispatchSummary";

interface AdministrationDashboardContentProps {
  companySlug: string;
  location_id: string;
  user: User;
  roleNames: string[];
}

export default function AdministrationDashboardContent({
  companySlug,
  location_id,
  user,
  roleNames,
}: AdministrationDashboardContentProps) {
  const [activeTab, setActiveTab] = useState("REPORTES");

  const { data, isLoading, isError } = useGetWarehouseDashboard(
    companySlug,
    location_id
  );

  return (
    <main className="max-w-7xl mt-6 mx-auto px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex justify-center mb-0 space-x-3 border-b rounded-t-xl bg-muted/40">
          <TabsTrigger
            value="REPORTES"
            className="flex gap-2 px-3 py-2 rounded-t-lg transition-all
              text-gray-600 dark:text-gray-400
              data-[state=active]:border-b-2
              data-[state=active]:border-indigo-600
              data-[state=active]:bg-white
              data-[state=active]:text-indigo-600
              data-[state=active]:shadow-sm
              dark:data-[state=active]:bg-slate-900
              dark:data-[state=active]:border-indigo-400
              dark:data-[state=active]:text-indigo-400"
          >
            <FileBarChart2 className="size-4" />
            Reportes
          </TabsTrigger>

          <TabsTrigger
            value="RESUMEN DE SOLICITUDES"
            className="flex gap-2 px-3 py-2 rounded-t-lg transition-all
              text-gray-600 dark:text-gray-400
              data-[state=active]:border-b-2
              data-[state=active]:border-orange-600
              data-[state=active]:bg-white
              data-[state=active]:text-orange-600
              data-[state=active]:shadow-sm
              dark:data-[state=active]:bg-slate-900
              dark:data-[state=active]:border-orange-400
              dark:data-[state=active]:text-orange-400"
          >
            <FileBarChart2 className="size-4" />
            Resumen de Solicitudes
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="REPORTES">
            <DispatchWarehouseReports
              companySlug={companySlug}
              location_id={location_id}
              user={user}
              roleNames={roleNames}
            />
          </TabsContent>

          <TabsContent value="RESUMEN DE SOLICITUDES">
            <DispatchSummary
              data={data}
              isLoading={isLoading}
              isError={isError}
            />
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
}