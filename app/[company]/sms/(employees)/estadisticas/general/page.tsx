"use client";
import BarChartComponent from "@/components/charts/BarChartComponent";
import MultipleBarChartComponent from "@/components/charts/MultipleBarChartComponent";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { ContentLayout } from "@/components/layout/ContentLayout";
import DataFilter from "@/components/misc/DataFilter";
import { GraphicsSelector } from "@/components/misc/GraphicsSelector";
import { Message } from "@/components/misc/Message";
import { Label } from "@/components/ui/label";
import { useGetTotalDangerIdentificationsCountedByType } from "@/hooks/sms/useGetTotalDangerIdentificationsCountedByType";
import { useGetTotalIdentificationStatsBySourceName } from "@/hooks/sms/useGetTotalIdentificationStatsBySoruceName";
import { useGetTotalIdentificationStatsBySourceType } from "@/hooks/sms/useGetTotalIdentificationStatsBySoruceType";
import { useGetTotalPostRiskCountByDateRange } from "@/hooks/sms/useGetTotalPostRiskByDateRange";
import { useGetTotalReportsCountedByArea } from "@/hooks/sms/useGetTotalReportsCountedByArea";
import { useGetTotalReportsStatsByYear } from "@/hooks/sms/useGetTotalReportsStatsByYear";
import { useGetTotalRiskCountByDateRange } from "@/hooks/sms/useGetTotalRiskByDateRange";
import { useCompanyStore } from "@/stores/CompanyStore";
import { format, startOfMonth } from "date-fns";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const GeneralReportStats = () => {
  const { selectedCompany } = useCompanyStore();
  const [selectedGraphics, setSelectedGraphics] = useState<string[]>(["Todos"]);
  const urlSearchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const graphicsOptions = [
    { id: "Todos", label: "Todos los gráficos" },
    { id: "bar-chart", label: "Identificados vs Gestionados" },
    { id: "type-chart", label: "Según su Tipo" },
    { id: "area-chart", label: "Identificados por Área" },
    { id: "pre-risk-pie", label: "Por Índice de Riesgo Pre-Mitigación" },
    { id: "pre-risk-bar", label: "Número de Reportes por Índice de Riesgo" },
    { id: "post-risk-pie", label: "Por Índice de Riesgo Post-Mitigación" },
    { id: "post-risk-bar", label: "Reportes por Índice de Riesgo (Post)" },
    { id: "source-type", label: "Por Tipo de Fuente" },
    { id: "source-name", label: "Por Nombre de Fuente" },
  ];

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

  // OBTENER DATOS - Usa directamente los parámetros actuales de la URL
  const {
    data: barChartData,
    isLoading: isLoadingBarChart,
    isError: isErrorBarChart,
  } = useGetTotalReportsStatsByYear(
    currentParams.from,
    currentParams.to,
    selectedCompany?.slug
  );

  const {
    data: totalIdentificationData,
    isLoading: isLoadingIdentificationData,
    isError: isErrorIdentificationData,
  } = useGetTotalDangerIdentificationsCountedByType(
    currentParams.from,
    currentParams.to,
    selectedCompany?.slug
  );

  const {
    data: reportsByAreaData,
    isLoading: isLoadingReportsByAreaData,
    isError: isErrorReportsByAreaData,
  } = useGetTotalReportsCountedByArea(
    currentParams.from,
    currentParams.to,
    selectedCompany?.slug
  );

  const {
    data: totalRiskData,
    isLoading: isLoadingTotalRiskData,
    isError: isErrorTotalRiskData,
  } = useGetTotalRiskCountByDateRange(
    currentParams.from,
    currentParams.to,
    selectedCompany?.slug
  );

  const {
    data: reportSourceTypeData,
    isLoading: isLoadingReportSourceTypeData,
    isError: isErrorReportSourceTypeData,
  } = useGetTotalIdentificationStatsBySourceType(
    currentParams.from,
    currentParams.to,
    selectedCompany?.slug
  );

  const {
    data: reportSourceNameData,
    isLoading: isLoadingReportSourceNameData,
    isError: isErrorReportSourceNameData,
  } = useGetTotalIdentificationStatsBySourceName(
    currentParams.from,
    currentParams.to,
    selectedCompany?.slug
  );

  const {
    data: totalPostRiskData,
    isLoading: isLoadingTotalPostRiskData,
    isError: isErrorTotalPostRiskData,
  } = useGetTotalPostRiskCountByDateRange(
    currentParams.from,
    currentParams.to,
    selectedCompany?.slug
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
    <ContentLayout title="Gráficos Estadísticos de Reportes">
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

        {/* ✅ PARA SELECCIONAR QUE GRAFICOS MOSTRAR */}
        <GraphicsSelector
          options={graphicsOptions}
          selectedGraphics={selectedGraphics}
          onSelectionChange={setSelectedGraphics}
          label="Seleccionar Gráficos a Mostrar:"
          placeholder="Seleccionar gráficos..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Peligros Identificados vs Gestionados */}
        {shouldShow("bar-chart") && (
          <div className="flex flex-col justify-center items-center p-4 rounded-lg shadow border">
            {isLoadingBarChart ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : barChartData ? (
              <BarChartComponent
                data={barChartData}
                title="Peligros Identificados vs Gestionados"
                bar_first_name="Identificados"
                bar_second_name="Gestionados"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Ha ocurrido un error al cargar los datos de Peligros
                Identificados vs Gestionados...
              </p>
            )}
            {isErrorBarChart && (
              <>
                <Message
                  title="Peligros Identificados vs Gestionados"
                  description="Ha ocurrido un error al cargar los datos de Peligros Identificados vs Gestionados..."
                />
              </>
            )}
          </div>
        )}

        {/* Numero de Reportes vs Tipo de Peligro (General) */}
        {shouldShow("type-chart") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingIdentificationData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : totalIdentificationData &&
              totalIdentificationData.length > 0 ? (
              <>
                <h2 className="text-sm sm:text-base font-bold">
                  Numero de Reportes vs Tipo de Peligro
                </h2>
                <MultipleBarChartComponent
                  data={totalIdentificationData}
                  title=""
                />
              </>
            ) : (
              <>
                <Message
                  title="Numero de Reportes vs Tipo de Peligro"
                  description="No hay datos para mostrar"
                />
              </>
            )}
            {isErrorIdentificationData && (
              <>
                <Message
                  title="Numero de Reportes vs Tipo de Peligro"
                  description="Ha ocurrido un error al cargar los datos de Numero de Reportes vs Tipo de Peligro..."
                />
              </>
            )}
          </div>
        )}

        {shouldShow("post-risk-bar") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingTotalRiskData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : totalRiskData && totalRiskData.length > 0 ? (
              <MultipleBarChartComponent
                data={totalRiskData}
                title="Numero de Reportes por Cada Indice de Riesgo  (Post-Mitigacion)"
              />
            ) : (
              <>
                <Message
                  title="Numero de Reportes por Cada Indice de Riesgo  (Post-Mitigacion)"
                  description="No hay datos para mostrar"
                />
              </>
            )}
            {isErrorTotalRiskData && (
              <>
                <Message
                  title="Numero de Reportes por Cada Indice de Riesgo  (Post-Mitigacion)"
                  description="Ha ocurrido un error al cargar el numero de reportes por indice de riesgo post-mitigacion..."
                />
              </>
            )}
          </div>
        )}

        {shouldShow("pre-risk-pie") && (
          <div className="flex flex-col justify-center items-center p-4 rounded-lg shadow border">
            {isLoadingTotalRiskData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : totalRiskData && totalRiskData.length > 0 ? (
              <PieChartComponent
                title="Por Índice de Riesgo Pre-Mitigación"
                data={totalRiskData}
              />
            ) : (
              <>
                <Message
                  title="Por Índice de Riesgo Pre-Mitigación"
                  description="No hay datos para mostrar"
                />
              </>
            )}
            {isErrorTotalRiskData && (
              <>
                <Message
                  title="Por Índice de Riesgo Pre-Mitigación"
                  description="Ha ocurrido un error al cargar el numero de reportes por indice de riesgo..."
                />
              </>
            )}
          </div>
        )}

        {shouldShow("pre-risk-bar") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingTotalPostRiskData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : totalPostRiskData && totalPostRiskData.length > 0 ? (
              <MultipleBarChartComponent
                data={totalPostRiskData}
                title="Numero de Reportes por Cada Indice de Riesgo "
              />
            ) : (
              <>
                <Message
                  title="Numero de Reportes por Cada Indice de Riesgo "
                  description="No hay datos para mostrar"
                />
              </>
            )}
            {isErrorTotalRiskData && (
              <>
                <Message
                  title="Numero de Reportes por Cada Indice de Riesgo "
                  description="Ha ocurrido un error al cargar el numero de reportes por indice de riesgo..."
                />
              </>
            )}
          </div>
        )}

        {shouldShow("post-risk-pie") && (
          <div className="flex flex-col justify-center items-center p-4 rounded-lg shadow border">
            {isLoadingTotalPostRiskData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : totalPostRiskData && totalPostRiskData.length > 0 ? (
              <PieChartComponent
                data={totalPostRiskData}
                title="Porcentaje de Indice de Riesgo Post-Mitigacion"
              />
            ) : (
              <>
                <Message
                  title="Porcentaje de Indice de Riesgo Post-Mitigacion"
                  description="No hay datos para mostrar"
                />
              </>
            )}
            {isErrorTotalPostRiskData && (
              <>
                <Message
                  title="Porcentaje de Indice de Riesgo Post-Mitigacion"
                  description="Ha ocurrido un error al cargar el porcentaje de indice de riesgo post-mitigacion..."
                />
              </>
            )}
          </div>
        )}

        {shouldShow("source-type") && (
          <div className="flex flex-col justify-center items-center p-4 rounded-lg shadow border">
            {isLoadingReportSourceTypeData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : reportSourceTypeData && reportSourceTypeData.length > 0 ? (
              <MultipleBarChartComponent
                data={reportSourceTypeData}
                title="Numero de Reportes por Tipo de Fuente"
              />
            ) : (
              <>
                <Message
                  title="Numero de Reportes por Tipo de Fuente"
                  description="No hay datos para mostrar"
                />
              </>
            )}
            {isErrorReportSourceTypeData && (
              <>
                <Message
                  title="Numero de Reportes por Tipo de Fuente"
                  description="Ha ocurrido un error al cargar el numero de reportes por tipo de fuente..."
                />
              </>
            )}
          </div>
        )}

        {shouldShow("source-name") && (
          <div className="flex-col p-4 rounded-lg shadow border">
            {isLoadingReportSourceNameData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : reportSourceNameData && reportSourceNameData.length > 0 ? (
              <MultipleBarChartComponent
                data={reportSourceNameData}
                title="Numero de Reportes Voluntarios vs Nombre de la Fuente"
              />
            ) : (
              <>
                <Message
                  title="Numero de Reportes Voluntarios vs Nombre de la Fuente"
                  description="No hay datos para mostrar"
                />
              </>
            )}
            {isErrorReportSourceNameData && (
              <>
                <Message
                  title="Numero de Reportes Voluntarios vs Nombre de la Fuente"
                  description="Ha ocurrido un error al cargar el numero de reportes voluntarios vs nombre de la fuente..."
                />
              </>
            )}
          </div>
        )}

        {shouldShow("area-chart") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingReportsByAreaData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : reportsByAreaData && reportsByAreaData.length > 0 ? (
              <MultipleBarChartComponent
                data={reportsByAreaData}
                title="Numero de Reportes vs Area de Identificación"
              />
            ) : (
              <>
                <Message
                  title="Numero de Reportes vs Area de Identificación"
                  description="No hay datos para mostrar"
                />
              </>
            )}
            {isErrorReportsByAreaData && (
              <>
                <Message
                  title="Numero de Reportes vs Area de Identificación"
                  description="Ha ocurrido un error al cargar Numero de Reportes vs Area de Identificación..."
                />
              </>
            )}
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default GeneralReportStats;
