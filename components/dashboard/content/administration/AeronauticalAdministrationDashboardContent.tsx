"use client";

import { BarChart3, ClipboardList } from "lucide-react";

import { useGetWarehouseDashboard } from "@/hooks/sistema/dashboard/useWarehouseDashboard";

import { DashboardTabs } from "@/components/dashboard/content/DashboardTabs";
import DispatchSummary from "@/components/dashboard/sections/Administration/DispatchSummary";
import DispatchWarehouseReports from "@/components/dashboard/sections/Administration/DispatchWarehouseReports";
import type { AdministrationDashboardContentProps } from "./types";

/**
 * Administración de una OMAC: se alimenta de las salidas y los artículos del
 * almacén aeronáutico. Esos datos no existen en una aerolínea, por eso este
 * contenido (y su consulta) solo se monta para empresas aeronáuticas.
 */
export default function AeronauticalAdministrationDashboardContent({
  companySlug,
  location_id,
  user,
  roleNames,
}: AdministrationDashboardContentProps) {
  const { data, isLoading, isError } = useGetWarehouseDashboard(
    companySlug,
    location_id,
  );

  return (
    <DashboardTabs
      tabs={[
        {
          value: "REPORTS",
          label: "Reportes",
          icon: ClipboardList,
          tone: "blue",
          content: (
            <DispatchWarehouseReports
              companySlug={companySlug}
              location_id={location_id}
              user={user}
              roleNames={roleNames}
            />
          ),
        },
        {
          value: "REQUEST_SUMMARY",
          label: "Resumen",
          icon: BarChart3,
          tone: "cyan",
          content: (
            <DispatchSummary
              data={data}
              isLoading={isLoading}
              isError={isError}
            />
          ),
        },
      ]}
    />
  );
}
