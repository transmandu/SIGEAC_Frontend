"use client";

import { Loader2 } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { useGetAeronauticalActivityStats } from "@/hooks/sms/aeronautical/useGetAeronauticalActivityStats";
import { useCompanyStore } from "@/stores/CompanyStore";

export function AeronauticalActivityStatsView() {
  const { selectedCompany } = useCompanyStore();
  const { data, isLoading, isError } = useGetAeronauticalActivityStats(
    selectedCompany?.slug,
  );

  return (
    <ContentLayout title="Dashboard de Actividades SMS">
      <PageHeader className="mb-6" />

      {isLoading ? (
        <div className="flex w-full items-center justify-center py-20">
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No fue posible cargar las estadísticas de actividades.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PieChartComponent
            data={data?.statusData ?? []}
            title="Actividades por estado"
            height={300}
          />
          <PieChartComponent
            data={data?.typeData ?? []}
            title="Actividades por categoría"
            height={300}
          />
        </div>
      )}
    </ContentLayout>
  );
}
