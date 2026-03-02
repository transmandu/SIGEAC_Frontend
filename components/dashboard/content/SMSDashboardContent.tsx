"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types";
import {
  AreaChartIcon,
  LayoutDashboard,
  NotebookText,
} from "lucide-react";
import { useState } from "react";

import SMSDashboardSummary from "@/components/dashboard/sections/SMS/SMSDashboardSummary";
import SMSStatistics from "@/components/dashboard/sections/SMS/SMSStatistics";
import SMSReportIndicator from "@/components/dashboard/sections/SMS/SMSReportIndicator";

interface SMSDashboardContentProps {
  companySlug: string;
  location_id: string;
  user: User;
  roleNames: string[];
}

export default function SMSDashboardContent({
  companySlug,
  location_id,
}: SMSDashboardContentProps) {
  const [activeTab, setActiveTab] = useState("DASHBOARD");

  return (
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
            <AreaChartIcon className="size-4" /> Estadísticas
          </TabsTrigger>
        </TabsList>

        <div className="mt-10">
          <TabsContent value="DASHBOARD">
            <div className="mt-6">
              <SMSDashboardSummary companySlug={companySlug} />
            </div>
          </TabsContent>

          <TabsContent value="REPORTS">
            <SMSReportIndicator companySlug={companySlug} />
          </TabsContent>

          <TabsContent value="STATISTICS">
            <SMSStatistics
              companySlug={companySlug}
              location={location_id}
            />
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
}