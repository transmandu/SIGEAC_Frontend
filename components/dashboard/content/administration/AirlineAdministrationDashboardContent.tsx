"use client";

import { Shirt } from "lucide-react";

import { DashboardTabs } from "@/components/dashboard/content/DashboardTabs";
import { ReporteUniformesTab } from "@/components/dashboard/sections/Administration/ReporteUniformesTab";

/**
 * Administración de una aerolínea: la dotación de uniformes vive en su módulo
 * de SMS y no existe en una OMAC, por eso solo se monta para aerolíneas.
 */
export default function AirlineAdministrationDashboardContent() {
  return (
    <DashboardTabs
      tabs={[
        {
          value: "UNIFORM_REPORT",
          label: "Uniformes",
          icon: Shirt,
          tone: "sky",
          content: <ReporteUniformesTab />,
        },
      ]}
    />
  );
}
