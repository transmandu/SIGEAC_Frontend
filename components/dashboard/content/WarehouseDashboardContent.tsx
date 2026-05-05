"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { useGetWarehouseDashboard } from "@/hooks/sistema/dashboard/useWarehouseDashboard";
import { User } from "@/types";

import {
  Wrench,
  Users,
  Boxes,
  ShieldCheck,
} from "lucide-react";

import ArticlesSummary from "@/components/dashboard/sections/warehouse/ArticlesSummary";
import ToolsSummary from "@/components/dashboard/sections/warehouse/ToolsSummary";
import UsersSummary from "@/components/dashboard/sections/warehouse/UsersSummary";
import DashboardSummary from "@/components/dashboard/sections/warehouse/DashboardSummary";

interface WarehouseDashboardContentProps {
  companySlug: string;
  location_id: string;
  user: User;
  roleNames: string[];
}

export default function WarehouseDashboardContent({
  companySlug,
  location_id,
  roleNames,
}: WarehouseDashboardContentProps) {
  const [activeTab, setActiveTab] = useState("OVERVIEW");

  const { data, isLoading, isError } = useGetWarehouseDashboard(
    companySlug,
    location_id
  );

  const canViewUsersTab = roleNames.some((r) =>
    ["SUPERUSER", "JEFE_ALMACEN"].includes(r)
  );

  return (
    <main className="max-w-7xl mt-6 mx-auto px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>

        {/* ================= TABS ================= */}
        <TabsList className="w-full mb-6 p-2 rounded-2xl bg-slate-200/50 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/40 dark:border-slate-800/60">

          {/* CONTENEDOR RESPONSIVE */}
          <div className="
            flex w-full gap-2
            sm:justify-center
            overflow-x-auto sm:overflow-visible
            no-scrollbar
          ">

            {/* inner wrapper mantiene tu desktop intacto */}
            <div className="flex w-max sm:w-full sm:max-w-md gap-2">

              <TabsTrigger value="OVERVIEW" className="flex-shrink-0 sm:flex-1 flex items-center justify-center gap-2 text-xs h-8 sm:h-7 px-4 sm:px-3 rounded-xl transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-900/50 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-[0_0_18px_rgba(37,99,235,0.25)] data-[state=active]:ring-1 data-[state=active]:ring-blue-300/50">
                <ShieldCheck className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
                Principal
              </TabsTrigger>

              <TabsTrigger value="ARTICLES" className="flex-shrink-0 sm:flex-1 flex items-center justify-center gap-2 text-xs h-8 sm:h-7 px-4 sm:px-3 rounded-xl transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-900/50 data-[state=active]:text-cyan-600 dark:data-[state=active]:text-cyan-400 data-[state=active]:shadow-[0_0_18px_rgba(8,145,178,0.25)] data-[state=active]:ring-1 data-[state=active]:ring-cyan-300/50">
                <Boxes className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
                Artículos
              </TabsTrigger>

              <TabsTrigger value="TOOLS" className="flex-shrink-0 sm:flex-1 flex items-center justify-center gap-2 text-xs h-8 sm:h-7 px-4 sm:px-3 rounded-xl transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-900/50 data-[state=active]:text-sky-600 dark:data-[state=active]:text-sky-400 data-[state=active]:shadow-[0_0_18px_rgba(2,132,199,0.25)] data-[state=active]:ring-1 data-[state=active]:ring-sky-300/50">
                <Wrench className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
                Herramientas
              </TabsTrigger>

              {canViewUsersTab && (
                <TabsTrigger value="USERS" className="flex-shrink-0 sm:flex-1 flex items-center justify-center gap-2 text-xs h-8 sm:h-7 px-4 sm:px-3 rounded-xl transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-900/50 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-[0_0_18px_rgba(79,70,229,0.25)] data-[state=active]:ring-1 data-[state=active]:ring-indigo-300/50">
                  <Users className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
                  Usuarios
                </TabsTrigger>
              )}

            </div>
          </div>
        </TabsList>

        {/* ================= CONTENT ================= */}
        <div className="mt-6 sm:mt-8">
          <TabsContent value="OVERVIEW">
            <DashboardSummary companySlug={companySlug} />
          </TabsContent>

          <TabsContent value="ARTICLES">
            <ArticlesSummary
              data={data}
              isLoading={isLoading}
              isError={isError}
            />
          </TabsContent>

          <TabsContent value="TOOLS">
            <ToolsSummary
              data={data}
              isLoading={isLoading}
              isError={isError}
            />
          </TabsContent>

          {canViewUsersTab && (
            <TabsContent value="USERS">
              <UsersSummary
                data={data}
                isLoading={isLoading}
                isError={isError}
                currentUserRole={roleNames[0]}
              />
            </TabsContent>
          )}
        </div>

      </Tabs>
    </main>
  );
}