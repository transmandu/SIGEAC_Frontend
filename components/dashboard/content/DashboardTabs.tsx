"use client";

import type { LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DashboardTabTone = "blue" | "cyan" | "sky";

// Clases completas y estáticas: Tailwind no ve las que se arman por partes.
const TONES: Record<DashboardTabTone, string> = {
  blue: "hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-[0_0_18px_rgba(37,99,235,0.25)] data-[state=active]:ring-1 data-[state=active]:ring-blue-300/50",
  cyan: "hover:text-cyan-600 dark:hover:text-cyan-400 data-[state=active]:text-cyan-600 dark:data-[state=active]:text-cyan-400 data-[state=active]:shadow-[0_0_18px_rgba(8,145,178,0.25)] data-[state=active]:ring-1 data-[state=active]:ring-cyan-300/50",
  sky: "hover:text-sky-600 dark:hover:text-sky-400 data-[state=active]:text-sky-600 dark:data-[state=active]:text-sky-400 data-[state=active]:shadow-[0_0_18px_rgba(14,165,233,0.25)] data-[state=active]:ring-1 data-[state=active]:ring-sky-300/50",
};

export interface DashboardTab {
  value: string;
  label: string;
  icon: LucideIcon;
  tone: DashboardTabTone;
  content: ReactNode;
}

/**
 * Barra de pestañas y contenido de un dashboard. Cada dashboard declara
 * únicamente las pestañas que le corresponden (según el tipo de empresa); este
 * componente solo las dibuja. El contenido de una pestaña se monta al abrirla,
 * así que sus consultas no se disparan si nadie la visita.
 */
export function DashboardTabs({ tabs }: { tabs: DashboardTab[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.value);

  return (
    <main className="max-w-7xl mt-6 mx-auto px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6 p-2 rounded-2xl bg-slate-200/50 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/40 dark:border-slate-800/60">
          <div className="flex justify-center overflow-x-auto sm:overflow-visible no-scrollbar">
            <div className="inline-flex gap-2 sm:w-full sm:max-w-md sm:justify-center">
              {tabs.map(({ value, label, icon: Icon, tone }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={`shrink-0 sm:flex-1 flex items-center justify-center gap-2 text-xs h-8 sm:h-7 px-4 sm:px-3 rounded-xl transition-all duration-200 whitespace-nowrap text-slate-500 dark:text-slate-400 data-[state=active]:bg-white/80 dark:data-[state=active]:bg-slate-900/50 ${TONES[tone]}`}
                >
                  <Icon className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
                  {label}
                </TabsTrigger>
              ))}
            </div>
          </div>
        </TabsList>

        <div className="mt-6 sm:mt-8">
          {tabs.map(({ value, content }) => (
            <TabsContent key={value} value={value}>
              {content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </main>
  );
}
