"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types";
import { useState } from "react";
import {
  LayoutDashboard,
  NotebookText,
  TrendingUp,
  ShieldCheck,
  FileText,
} from "lucide-react";

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

        {/* ===================== TABS (BASE UNIFICADA) ===================== */}
        <TabsList className="w-full flex justify-center mb-6 p-2 rounded-2xl bg-slate-200/50 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/40 dark:border-slate-800/60">

          <div className="flex w-full max-w-md gap-2">

            {/* DASHBOARD */}
            <TabsTrigger
              value="DASHBOARD"
              className="flex-1 flex items-center justify-center gap-2 text-xs h-7 px-3 rounded-xl transition-all duration-200 whitespace-nowrap
              text-slate-500 dark:text-slate-400
              hover:text-amber-600 dark:hover:text-amber-400
              data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-900/50
              data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400
              data-[state=active]:shadow-[0_0_18px_rgba(245,158,11,0.25)]
              data-[state=active]:ring-1 data-[state=active]:ring-amber-300/50"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              Principal
            </TabsTrigger>

            {/* REPORTS */}
            <TabsTrigger
              value="REPORTS"
              className="flex-1 flex items-center justify-center gap-2 text-xs h-7 px-3 rounded-xl transition-all duration-200 whitespace-nowrap
              text-slate-500 dark:text-slate-400
              hover:text-amber-300 dark:hover:text-amber-200
              data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-900/50
              data-[state=active]:text-amber-500 dark:data-[state=active]:text-amber-300
              data-[state=active]:shadow-[0_0_18px_rgba(245,158,11,0.20)]
              data-[state=active]:ring-1 data-[state=active]:ring-amber-200/60"
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              Reportes
            </TabsTrigger>

            {/* STATISTICS */}
            <TabsTrigger
              value="STATISTICS"
              className="flex-1 flex items-center justify-center gap-2 text-xs h-7 px-3 rounded-xl transition-all duration-200 whitespace-nowrap
              text-slate-500 dark:text-slate-400
              hover:text-orange-600 dark:hover:text-orange-400
              data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-900/50
              data-[state=active]:text-orange-700 dark:data-[state=active]:text-orange-400
              data-[state=active]:shadow-[0_0_18px_rgba(249,115,22,0.25)]
              data-[state=active]:ring-1 data-[state=active]:ring-orange-500/50"
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              Estadísticas
            </TabsTrigger>

          </div>

        </TabsList>

        {/* ===================== CONTENT ===================== */}
        <div className="mt-8">

          <TabsContent value="DASHBOARD">
            <SMSDashboardSummary companySlug={companySlug} />
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