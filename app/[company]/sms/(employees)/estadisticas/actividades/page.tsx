"use client";

import DynamicBarChartComponent from "@/components/charts/DynamicBarChartComponent";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { ContentLayout } from "@/components/layout/ContentLayout";
import DateRangePickerInput from "@/components/misc/DateRangePickerInput";
import { Label } from "@/components/ui/label";
import { useGetSMSActivityStats } from "@/hooks/sms/useGetSMSActivityStats";
import { useCompanyStore } from "@/stores/CompanyStore";
import { format, startOfMonth } from "date-fns";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const SMSActivityStatsPage = () => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  interface Params {
    from?: string;
    to?: string;
    [key: string]: string | undefined;
  }

  const [params, setParams] = useState<Params>({
    from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    const defaultFrom = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const defaultTo = format(new Date(), "yyyy-MM-dd");

    const newParams: Params = {};
    searchParams.forEach((value, key) => {
      newParams[key] = value;
    });

    const finalParams: Params = {
      from: newParams.from || defaultFrom,
      to: newParams.to || defaultTo,
    };
    setParams(finalParams);
  }, [searchParams, pathname]);

  const handleDateChange = (
    dateRange: { from: Date; to: Date } | undefined,
  ) => {
    if (!dateRange?.from || !dateRange?.to) return;

    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("from", format(dateRange.from, "yyyy-MM-dd"));
    newParams.set("to", format(dateRange.to, "yyyy-MM-dd"));

    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const handleReset = () => {
    const defaultFrom = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const defaultTo = format(new Date(), "yyyy-MM-dd");

    const newParams = new URLSearchParams();
    newParams.set("from", defaultFrom);
    newParams.set("to", defaultTo);

    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  // Llamada a nuestro nuevo Hook simulado
  const { data: statsData, isLoading } = useGetSMSActivityStats(
    params.from || format(startOfMonth(new Date()), "yyyy-MM-dd"),
    params.to || format(new Date(), "yyyy-MM-dd"),
    selectedStation ?? null,
    selectedCompany?.slug,
  );

  return (
    <ContentLayout title="Dashboard de Actividades SMS">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-center items-center">
          <div className="flex flex-col w-full max-w-md">
            <Label className="text-lg font-semibold mb-3 text-center">
              Filtro de Búsqueda
            </Label>
            <DateRangePickerInput
              onDateChange={handleDateChange}
              onReset={handleReset}
              initialDate={{
                from:
                  params.from || format(startOfMonth(new Date()), "yyyy-MM-dd"),
                to: params.to || format(new Date(), "yyyy-MM-dd"),
              }}
            />
          </div>
        </div>
      </div>

      {/* Layout de Gráficos: 2 arriba, 1 ancho completo abajo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        {/* Gráfico 1: Estado General (Dona) */}
        <div className="flex flex-col items-center p-6 rounded-xl shadow-sm border bg-card">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="size-12 animate-spin text-muted-foreground" />
            </div>
          ) : statsData?.statusData ? (
            <div className="w-full">
              <h2 className="text-lg font-bold mb-4 text-center">
                Estado General de Actividades
              </h2>
              <PieChartComponent
                data={statsData.statusData}
                title="Porcentaje de Estados"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay datos de estados disponibles.
            </p>
          )}
        </div>

        {/* Gráfico 2: Carga por Responsable (Barras) */}
        <div className="flex flex-col items-center p-6 rounded-xl shadow-sm border bg-card">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="size-12 animate-spin text-muted-foreground" />
            </div>
          ) : statsData?.responsibleData ? (
            <div className="w-full">
              <h2 className="text-lg font-bold mb-4 text-center">
                Carga por Responsable
              </h2>
              <DynamicBarChartComponent
                data={statsData.responsibleData.map((d) => ({
                  name: d.name,
                  Actividades: d.value,
                }))}
                title="Actividades Asignadas"
                dataKey="Actividades"
                color="#8b5cf6"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay datos por responsable.
            </p>
          )}
        </div>

        {/* Gráfico 3: Tipos de Actividades (Barras - Ocupa ambas columnas) */}
        <div className="flex flex-col items-center p-6 rounded-xl shadow-sm border bg-card lg:col-span-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="size-12 animate-spin text-muted-foreground" />
            </div>
          ) : statsData?.typeData ? (
            <div className="w-full">
              <h2 className="text-lg font-bold mb-4 text-center">
                Top Tipos de Actividades
              </h2>
              <DynamicBarChartComponent
                data={statsData.typeData.map((d) => ({
                  name: d.name,
                  "Total Registradas": d.value,
                }))}
                title="Frecuencia por Tipo de Actividad"
                dataKey="Total Registradas"
                color="#10b981"
                height={350}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay datos de tipos registrados.
            </p>
          )}
        </div>
      </div>
    </ContentLayout>
  );
};

export default SMSActivityStatsPage;
