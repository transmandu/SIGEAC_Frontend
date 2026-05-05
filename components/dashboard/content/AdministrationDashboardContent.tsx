"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClipboardList, BarChart3 } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("REPORTS");

  const { data, isLoading, isError } = useGetWarehouseDashboard(
    companySlug,
    location_id
  );

  return (
    <main className="max-w-7xl mt-6 mx-auto px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>

        {/* ===================== TABS ===================== */}
        <TabsList className="
          w-full mb-6 p-2
          rounded-2xl
          bg-slate-200/50 dark:bg-slate-800/60
          backdrop-blur-md
          border border-slate-200/40 dark:border-slate-800/60
        ">

          <div className="
            flex justify-center
            overflow-x-auto sm:overflow-visible
            no-scrollbar
          ">

            <div className="
              inline-flex gap-2
              sm:w-full sm:max-w-md
              sm:justify-center
            ">

              {/* REPORTS */}
              <TabsTrigger
                value="REPORTS"
                className="
                  flex-shrink-0 sm:flex-1
                  flex items-center justify-center gap-2
                  text-xs h-8 sm:h-7 px-4 sm:px-3
                  rounded-xl transition-all duration-200 whitespace-nowrap
                  text-slate-500 dark:text-slate-400
                  hover:text-violet-500 dark:hover:text-violet-300
                  data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-900/50
                  data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-300
                  data-[state=active]:shadow-[0_0_18px_rgba(167,139,250,0.25)]
                  data-[state=active]:ring-1 data-[state=active]:ring-violet-300/50
                "
              >
                <ClipboardList className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
                Reportes
              </TabsTrigger>

              {/* SUMMARY */}
              <TabsTrigger
                value="REQUEST_SUMMARY"
                className="
                  flex-shrink-0 sm:flex-1
                  flex items-center justify-center gap-2
                  text-xs h-8 sm:h-7 px-4 sm:px-3
                  rounded-xl transition-all duration-200 whitespace-nowrap
                  text-slate-500 dark:text-slate-400
                  hover:text-purple-500 dark:hover:text-purple-300
                  data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-900/50
                  data-[state=active]:text-purple-500 dark:data-[state=active]:text-purple-300
                  data-[state=active]:shadow-[0_0_18px_rgba(168,85,247,0.18)]
                  data-[state=active]:ring-1 data-[state=active]:ring-purple-300/40
                "
              >
                <BarChart3 className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
                Resumen
              </TabsTrigger>

            </div>
          </div>

        </TabsList>

        {/* ===================== CONTENT ===================== */}
        <div className="mt-6 sm:mt-8">
          <TabsContent value="REPORTS">
            <DispatchWarehouseReports
              companySlug={companySlug}
              location_id={location_id}
              user={user}
              roleNames={roleNames}
            />
          </TabsContent>

          <TabsContent value="REQUEST_SUMMARY">
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