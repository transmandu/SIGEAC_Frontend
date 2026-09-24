"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  NotebookText,
  TrendingUp,
  ShieldCheck,
  FileText,
  FileDown,
} from "lucide-react";

import SMSDashboardSummary from "@/components/dashboard/sections/SMS/SMSDashboardSummary";
import SMSStatistics from "@/components/dashboard/sections/SMS/SMSStatistics";
import SMSStatisticsPdfExport from "@/components/dashboard/sections/SMS/SMSStatisticsPdfExport";
import SMSReportIndicator from "@/components/dashboard/sections/SMS/SMSReportIndicator";

interface SMSDashboardContentProps {
  companySlug: string;
  location_id: string;
  user: User;
  roleNames: string[];
}

const TAB_VALUES = [
  "DASHBOARD",
  "REPORTS",
  "STATISTICS",
  "STATISTICS_EXPORT",
] as const;

type TabValue = (typeof TAB_VALUES)[number];

// Slugs de la URL: minúsculas y en español
const TAB_SLUGS: Record<TabValue, string> = {
  DASHBOARD: "principal",
  REPORTS: "reportes",
  STATISTICS: "estadisticas",
  STATISTICS_EXPORT: "reporte-pdf",
};

const SLUG_TO_TAB: Record<string, TabValue> = Object.fromEntries(
  (TAB_VALUES as readonly string[]).map((value) => [
    TAB_SLUGS[value as TabValue],
    value as TabValue,
  ]),
);

const isValidTab = (value: string | null): value is TabValue =>
  !!value && (TAB_VALUES as readonly string[]).includes(value);

export default function SMSDashboardContent({
  companySlug,
  location_id,
}: SMSDashboardContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // El tab activo se deriva de la URL (mantiene la posición al refrescar/navegar)
  const tabSlug = searchParams.get("tab");
  const activeTab: TabValue =
    tabSlug && tabSlug in SLUG_TO_TAB ? SLUG_TO_TAB[tabSlug] : "DASHBOARD";

  const handleTabChange = (value: string) => {
    const tab: TabValue = isValidTab(value) ? value : "DASHBOARD";

    const params = new URLSearchParams(searchParams.toString());
    if (tab === "DASHBOARD") {
      params.delete("tab");
    } else {
      params.set("tab", TAB_SLUGS[tab]);
    }

    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  return (
    <main className="max-w-7xl mt-6 mx-auto px-4">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        {/* ===================== TABS (BASE UNIFICADA) ===================== */}
        <TabsList className="w-full flex justify-center mb-6 p-2 rounded-2xl bg-slate-200/50 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/40 dark:border-slate-800/60">
          <div className="flex w-full max-w-xl gap-2">
            {/* DASHBOARD */}
            <TabsTrigger
              value="DASHBOARD"
              className="flex-1 flex items-center justify-center gap-2 text-xs h-7 px-3 rounded-xl transition-all duration-200 whitespace-nowrap
              text-slate-500 dark:text-slate-400
              hover:text-blue-600 dark:hover:text-blue-400
              data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-900/50
              data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400
              data-[state=active]:shadow-[0_0_18px_rgba(37,99,235,0.25)]
              data-[state=active]:ring-1 data-[state=active]:ring-blue-300/50"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              Principal
            </TabsTrigger>

            {/* REPORTS */}
            <TabsTrigger
              value="REPORTS"
              className="flex-1 flex items-center justify-center gap-2 text-xs h-7 px-3 rounded-xl transition-all duration-200 whitespace-nowrap
              text-slate-500 dark:text-slate-400
              hover:text-cyan-600 dark:hover:text-cyan-400
              data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-900/50
              data-[state=active]:text-cyan-600 dark:data-[state=active]:text-cyan-400
              data-[state=active]:shadow-[0_0_18px_rgba(8,145,178,0.25)]
              data-[state=active]:ring-1 data-[state=active]:ring-cyan-300/50"
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              Reportes
            </TabsTrigger>

            {/* STATISTICS */}
            <TabsTrigger
              value="STATISTICS"
              className="flex-1 flex items-center justify-center gap-2 text-xs h-7 px-3 rounded-xl transition-all duration-200 whitespace-nowrap
              text-slate-500 dark:text-slate-400
              hover:text-sky-600 dark:hover:text-sky-400
              data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-900/50
              data-[state=active]:text-sky-600 dark:data-[state=active]:text-sky-400
              data-[state=active]:shadow-[0_0_18px_rgba(2,132,199,0.25)]
              data-[state=active]:ring-1 data-[state=active]:ring-sky-300/50"
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              Estadísticas
            </TabsTrigger>

            {/* STATISTICS PDF EXPORT */}
            <TabsTrigger
              value="STATISTICS_EXPORT"
              className="flex-1 flex items-center justify-center gap-2 text-xs h-7 px-3 rounded-xl transition-all duration-200 whitespace-nowrap
              text-slate-500 dark:text-slate-400
              hover:text-indigo-600 dark:hover:text-indigo-400
              data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-900/50
              data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400
              data-[state=active]:shadow-[0_0_18px_rgba(79,70,229,0.25)]
              data-[state=active]:ring-1 data-[state=active]:ring-indigo-300/50"
            >
              <FileDown className="w-3.5 h-3.5 shrink-0" />
              Reporte PDF
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
            <SMSStatistics companySlug={companySlug} location={location_id} />
          </TabsContent>

          <TabsContent value="STATISTICS_EXPORT">
            <SMSStatisticsPdfExport
              companySlug={companySlug}
              locationId={location_id}
            />
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
}
