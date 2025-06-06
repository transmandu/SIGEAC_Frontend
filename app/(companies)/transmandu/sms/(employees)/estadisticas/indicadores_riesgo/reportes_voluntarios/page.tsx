"use client";
import BarChartComponent from "@/components/charts/BarChartComponent";
import PieChartComponent from "@/components/charts/PieChartComponent";
import { ContentLayout } from "@/components/layout/ContentLayout";
import DateFilter from "@/components/misc/DataFilter";
import DataFilter from "@/components/misc/DataFilter";
import DoubleDateFilter from "@/components/misc/DoubleDateFilter";
import { Label } from "@/components/ui/label";
import { useGetTotalReportsStatsByYear } from "@/hooks/sms/useGetTotalReportsStatsByYear";
import { dateFormat } from "@/lib/utils";
import { pieChartData } from "@/types";
import { format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const languages = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" },
] as const;

const VoluntaryReportIndicators = () => {
  const [selectedGraphic, setSelectedGraphic] = useState("");
  const labels = [
    {
      label: "Identificados por Área",
      value: "número de informes por cada área específica",
    },
    {
      label: "Según su Tipo",
      value: "número de informes clasificados por tipo específico",
    },
    {
      label: "Por Índice de Riesgo Pre-Mitigación",
      value:
        "número de informes clasificados por índice de riesgo antes de cualquier medida de mitigación",
    },
    {
      label: "Por Índice de Riesgo Post-Mitigación",
      value:
        "número de informes clasificados por índice de riesgo después de aplicar medidas de mitigación",
    },
    {
      label: "Identificados vs Gestionados",
      value:
        "comparación entre el número de informes identificados y el número de informes gestionados",
    },
    {
      label: "Número de Reportes por Índice de Riesgo",
      value:
        "total de informes clasificados por diferentes niveles de índice de riesgo",
    },
    {
      label: "Número de Reportes vs Área",
      value:
        "comparación del número de informes con respecto a cada área específica",
    },
  ];

  interface Params {
    from?: string;
    to?: string;
    [key: string]: string | undefined; // Permite otros parámetros
  }
  const searchParams = useSearchParams();
  const pathname = usePathname();

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

  // Para extraer las estadisticas de reportes dado unos rangos de fecha, desde hasta
  const {
    data: barChartData,
    isLoading: isLoadingBarChart,
    isError: isErrorBarChart,
    refetch: refetchBarChart,
  } = useGetTotalReportsStatsByYear(
    params.from || format(startOfMonth(new Date()), "yyyy-MM-dd"),
    params.to || format(new Date(), "yyyy-MM-dd")
  );

  const [resultArrayData, setResultArrayData] = useState<pieChartData[]>([]);
  const [result, setResult] = useState<number>();

  function formatDate(date: string) {
    const newDate = new Date(date);
    return format(newDate, "PPP", {
      locale: es,
    });
  }

  // Separate useEffect for refetching based on date params
  useEffect(() => {
    refetchBarChart();
  }, [params.from, params.to, refetchBarChart]);

  useEffect(() => {
    refetchBarChart();
    if (barChartData) {
      setResultArrayData([
        {
          name: "Reportes en Proceso",
          value: barChartData.open_reports,
        },
        {
          name: "Reportes Gestionados",
          value: barChartData.closed_reports,
        },
      ]);
      setResult(
        (barChartData.closed_reports * 100) / barChartData.total_reports
      );
    } else {
      setResultArrayData([]);
    }
  }, [barChartData, refetchBarChart]); // Removed resultArrayData and refetchBarChart

  return (
    <>
      <ContentLayout title="Gráficos Estadísticos de los Reportes">
        <div className="flex justify-center items-center mb-4">
          <div className="flex flex-col">
            <Label className="text-lg font-semibold">
              Seleccionar Rango de Fechas :
            </Label>
            <DateFilter />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Gráfico de Barras (Peligros Identificados) */}
          <div className=" flex flex-col justify-center items-center p-4 rounded-lg shadow border">
            {isLoadingBarChart ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : barChartData ? (
              params.from &&
              params.to && (
                <BarChartComponent
                  from={params.from}
                  to={params.to}
                  height="100%"
                  width="100%"
                  data={barChartData}
                  title="Peligros Identificados vs Gestionados"
                />
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                Ha ocurrido un error al cargar los datos de Peligros
                Identificados vs Gestionados...
              </p>
            )}
          </div>

          <div
            className="flex flex-col justify-center items-center 
          p-4 rounded-lg shadow border"
          >
            {isLoadingBarChart && barChartData !== null ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : resultArrayData && resultArrayData?.length > 0 ? (
              <>
                <PieChartComponent
                  radius={120}
                  height="100%"
                  width="100%"
                  data={resultArrayData}
                  title="Porcentaje de Peligros Identificados vs Gestionados"
                />
              </>
            ) : (
              <p className="text-lg text-muted-foreground">
                No hay datos para mostrar.
              </p>
            )}
            {isErrorBarChart && (
              <p className="text-sm text-muted-foreground">
                Ha ocurrido un error al cargar el numero de reportes por indice
                de riesgo...
              </p>
            )}
          </div>
        </div>
        {resultArrayData && resultArrayData?.length > 0 && (
          <div className="flex justify-center items-center p-4 rounded-lg shadow-md">
            {result && result >= 90 ? (
              <div
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">¡Meta Alcanzada! </strong>
                <span className="block sm:inline">
                  Se ha alcanzado la meta el 90% de reportes han sido
                  gestionados.
                </span>
                <span className="block sm:inblock">
                  El ({result}%) de los reportes han sido gestionados entre las
                  fechas siguientes:
                  <div className="mt-2 p-2 bg-purple-50 rounded-md border border-gray-200 shadow-sm text-center text-black">
                    {formatDate(params.from || "")} -{" "}
                    {formatDate(params.to || "")}
                  </div>
                </span>
              </div>
            ) : (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Segun el gráfico: </strong>
                <span className="block sm:inline">
                  Aun no se ha alcanzado la gestión del 90% de reportes
                  identificados.
                  <div className="mt-2 p-2 bg-purple-50 rounded-md border border-gray-200 shadow-sm text-center text-black">
                    En rango de fechas del{" "}
                    {dateFormat(params.from || "", "PPP")}
                    {""} al {""}
                    {dateFormat(params.to || "", "PPP")}
                  </div>
                </span>
              </div>
            ) 
            }
          </div>
        )}
      </ContentLayout>
    </>
  );
};

export default VoluntaryReportIndicators;
