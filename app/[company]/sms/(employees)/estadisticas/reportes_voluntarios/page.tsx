"use client";
import BarChartComponent from "@/components/charts/BarChartComponent";
import MultipleBarChartComponent from "@/components/charts/MultipleBarChartComponent";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { ContentLayout } from "@/components/layout/ContentLayout";
import DataFilter from "@/components/misc/DataFilter";
import { GraphicsSelector } from "@/components/misc/GraphicsSelector";
import { Message } from "@/components/misc/Message";
import { Label } from "@/components/ui/label";
import { useGetDangerIdentificationsCountedByType } from "@/hooks/sms/useGetDangerIdentificationsCountedByType";
import { useGetIdentificationStatsBySourceName } from "@/hooks/sms/useGetIdentificationStatsBySourceName";
import { useGetIdentificationStatsBySourceType } from "@/hooks/sms/useGetIdentificationStatsBySourceType";
import { useGetPostRiskCountByDateRange } from "@/hooks/sms/useGetPostRiskByDateRange";
import { useGetReportsCountedByArea } from "@/hooks/sms/useGetReportsCountedByArea";
import { useGetRiskCountByDateRange } from "@/hooks/sms/useGetRiskByDateRange";
import { useGetVoluntaryReportingStatsByYear } from "@/hooks/sms/useGetVoluntaryReportingStatisticsByYear";
import { useGetVoluntaryReportsCountedByAirportLocation } from "@/hooks/sms/useGetVoluntaryReportsCountedByAirportLocation";
import { useCompanyStore } from "@/stores/CompanyStore";
import { format, startOfMonth } from "date-fns";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const graphicsOptions = [
  { id: "Todos", label: "Todos los gráficos" },
  { id: "location", label: "Identificados por localizacion" },
  { id: "tipo", label: "Según su Tipo" },
  { id: "pre-riesgo", label: "Por Índice de Riesgo Pre-Mitigación" },
  { id: "post-riesgo-bar", label: "Por Índice de Riesgo Post-Mitigación" },
  { id: "bar-chart", label: "Identificados vs Gestionados" },
  { id: "pre-riesgo-bar", label: "Número de Reportes por Índice de Riesgo" },
  { id: "area-bar", label: "Número de Reportes vs Área" },
  { id: "fuente-id", label: "Reportes vs Fuente de identificacion " },
  { id: "metodo-id", label: "Reportes vs Metodo de identificacion" },
];

const Statistics = () => {
  const { selectedCompany } = useCompanyStore();
  const [selectedGraphics, setSelectedGraphics] = useState<string[]>(["Todos"]);

  const urlSearchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Obtener parámetros ACTUALES de la URL - SIN estado local
  const currentParams = useMemo(() => {
    const defaultFrom = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const defaultTo = format(new Date(), "yyyy-MM-dd");

    const urlParams = new URLSearchParams(urlSearchParams.toString());
    return {
      from: urlParams.get("from") || defaultFrom,
      to: urlParams.get("to") || defaultTo,
    };
  }, [urlSearchParams]);

  // Hooks de datos - Usan directamente los parámetros actuales de la URL
  const { data: barChartData, isLoading: isLoadingBarChart } =
    useGetVoluntaryReportingStatsByYear(
      selectedCompany?.slug!,
      currentParams.from,
      currentParams.to,
      "voluntary"
    );

  const { data: dynamicData, isLoading: isLoadingDynamicData } =
    useGetDangerIdentificationsCountedByType(
      selectedCompany?.slug!,
      currentParams.from,
      currentParams.to,
      "voluntary"
    );

  const { data: pieCharData, isLoading: isLoadingPieCharData } =
    useGetReportsCountedByArea(
      selectedCompany?.slug!,
      currentParams.from,
      currentParams.to,
      "voluntary"
    );

  const { data: riskData, isLoading: isLoadingRisk } =
    useGetRiskCountByDateRange(
      selectedCompany?.slug!,
      currentParams.from,
      currentParams.to,
      "voluntary"
    );

  const { data: postRiskData, isLoading: isLoadingPostRisk } =
    useGetPostRiskCountByDateRange(
      selectedCompany?.slug!,
      currentParams.from,
      currentParams.to,
      "voluntary"
    );

  const {
    data: reportsByLocationData,
    isLoading: isLoadingReportsByLocationData,
  } = useGetVoluntaryReportsCountedByAirportLocation(
    selectedCompany?.slug!,
    currentParams.from,
    currentParams.to
  );

  const { data: reportsBySourceName, isLoading: isLoadingSourceName } =
    useGetIdentificationStatsBySourceName(
      selectedCompany?.slug!,
      currentParams.from,
      currentParams.to,
      "voluntary"
    );

  const { data: reportsBySourceType, isLoading: isLoadingSourceType } =
    useGetIdentificationStatsBySourceType(
      selectedCompany?.slug!,
      currentParams.from,
      currentParams.to,
      "voluntary"
    );

  // Manejar cambio de fechas desde DateFilter
  const handleDateChange = (
    dateRange: { from: Date; to: Date } | undefined
  ) => {
    if (!dateRange?.from || !dateRange?.to) return;

    const newParams = new URLSearchParams();
    newParams.set("from", format(dateRange.from, "yyyy-MM-dd"));
    newParams.set("to", format(dateRange.to, "yyyy-MM-dd"));

    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  // Manejar reset
  const handleReset = () => {
    const defaultFrom = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const defaultTo = format(new Date(), "yyyy-MM-dd");

    const newParams = new URLSearchParams();
    newParams.set("from", defaultFrom);
    newParams.set("to", defaultTo);

    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const shouldShow = (id: string) =>
    selectedGraphics.includes("Todos") || selectedGraphics.includes(id);
  return (
    <ContentLayout title="Gráficos Estadísticos de los Reportes Voluntarios">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-center items-center">
          <div className="flex flex-col w-full max-w-md">
            <Label className="text-lg font-semibold mb-2">
              Seleccionar Rango de Fechas:
            </Label>
            {/* ✅ CORREGIDO: Pasar todas las props necesarias al DataFilter */}
            <DataFilter
              onDateChange={handleDateChange}
              onReset={handleReset}
              initialDate={{
                from: currentParams.from,
                to: currentParams.to,
              }}
            />
          </div>
        </div>

        <GraphicsSelector
          options={graphicsOptions}
          selectedGraphics={selectedGraphics}
          onSelectionChange={setSelectedGraphics}
          label="Seleccionar Gráficos a Mostrar:"
          placeholder="Seleccionar gráficos..."
        />
      </div>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
        {shouldShow("bar-chart") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingBarChart ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : barChartData ? (
              <>
                <h2 className="text-sm font-bold">
                  Identificados vs Gestionados
                </h2>
                <BarChartComponent
                  data={barChartData}
                  barSize={120}
                  title="Peligros Identificados"
                  bar_first_name="Identificados"
                  bar_second_name="Gestionados"
                />
              </>
            ) : (
              <>
                <Message
                  title="Identificados vs Gestionados"
                  description="No hay datos para mostrar"
                ></Message>
              </>
            )}
          </div>
        )}

        {shouldShow("location") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingReportsByLocationData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : reportsByLocationData?.length ? (
              <MultipleBarChartComponent
                data={reportsByLocationData}
                title="Numero de Reportes vs Localizacion"
              />
            ) : (
              <>
                <Message
                  title="Numero de Reportes vs Localizacion"
                  description="No hay datos para mostrar"
                ></Message>
              </>
            )}
          </div>
        )}

        {shouldShow("tipo") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingDynamicData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : dynamicData?.length ? (
              <MultipleBarChartComponent
                data={dynamicData}
                title="Numero de Reportes vs Tipo de Peligros"
              />
            ) : (
              <>
                <Message
                  title="Numero de Reportes vs Tipo de Peligros"
                  description="No hay datos para mostrar"
                ></Message>
              </>
            )}
          </div>
        )}

        {shouldShow("area-bar") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingPieCharData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : pieCharData?.length ? (
              <MultipleBarChartComponent
                data={pieCharData}
                title="Numero de Reportes vs Areas"
              />
            ) : (
              <>
                <Message
                  title="Numero de Reportes vs Areas"
                  description="No hay datos para mostrar"
                ></Message>
              </>
            )}
          </div>
        )}

        {shouldShow("pre-riesgo") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingRisk ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : riskData?.length ? (
              <PieChartComponent
                data={riskData}
                title="Porcentaje de Indice de Riesgo Pre-Mitigacion"
              />
            ) : (
              <>
                <Message
                  title="Porcentaje de Indice de Riesgo Pre-Mitigacion"
                  description="No hay datos para mostrar"
                ></Message>
              </>
            )}
          </div>
        )}

        {shouldShow("pre-riesgo-bar") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingRisk ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : riskData?.length ? (
              <MultipleBarChartComponent
                data={riskData}
                title="Numero de Reportes por Cada Indice de Riesgo"
              />
            ) : (
              <>
                <Message
                  title="Numero de Reportes por Cada Indice de Riesgo"
                  description="No hay datos para mostrar"
                ></Message>
              </>
            )}
          </div>
        )}

        {shouldShow("post-riesgo-bar") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingPostRisk ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : postRiskData?.length ? (
              <PieChartComponent
                data={postRiskData}
                title="Indice de Riesgo Post-Mitigación"
              />
            ) : (
              <>
                <Message
                  title="Indice de Riesgo Post-Mitigación"
                  description="No hay datos para mostrar"
                ></Message>
              </>
            )}
          </div>
        )}

        {shouldShow("post-riesgo-bar") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingPostRisk ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : postRiskData?.length ? (
              <MultipleBarChartComponent
                data={postRiskData}
                title="Numero de Reportes por Indice de Riesgo"
              />
            ) : (
              <>
                <Message
                  title="Numero de Reportes por Indice de Riesgo"
                  description="No hay datos para mostrar"
                ></Message>
              </>
            )}
          </div>
        )}

        {shouldShow("fuente-id") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingSourceName ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : reportsBySourceType?.length ? (
              <MultipleBarChartComponent
                data={reportsBySourceType}
                title="Reportes vs Tipo Fuente"
              />
            ) : (
              <>
                <Message
                  title="Reportes vs Tipo Fuente"
                  description="No hay datos para mostrar"
                ></Message>
              </>
            )}
          </div>
        )}

        {shouldShow("metodo-id") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingSourceType ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : reportsBySourceName?.length ? (
              <MultipleBarChartComponent
                data={reportsBySourceName}
                title="Reportes vs Nombre de la Fuente"
              />
            ) : (
              <>
                <Message
                  title="Reportes vs Nombre de la Fuente"
                  description="No hay datos para mostrar"
                ></Message>
              </>
            )}
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default Statistics;
