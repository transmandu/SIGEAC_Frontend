"use client";
import BarChartComponent from "@/components/charts/BarChartComponent";
import DynamicBarChart from "@/components/charts/DynamicBarChart";
import { ContentLayout } from "@/components/layout/ContentLayout";
import DoubleDateFilter from "@/components/misc/DoubleDateFilter";
import { Label } from "@/components/ui/label";
import { useGetObligatoryReportAverage } from "@/hooks/sms/useGetObligatoryReportAverage";
import { useGetTotalReportsStatsByYear } from "@/hooks/sms/useGetTotalReportsStatsByYear";
import { dateFormat } from "@/lib/utils";
import { pieChartData } from "@/types";
import { format, startOfMonth, endOfMonth, subMonths, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { date } from "zod";

const ObligatoryReportIndicators = () => {
  const currentDate = new Date();
  // Obtener la fecha del mes anterior
  const previousMonth = subMonths(currentDate, 1);

  // Obtener la fecha de inicio del mes anterior
  const startDate = startOfMonth(previousMonth);

  // Obtener la fecha de fin del mes anterior
  const endDate = endOfMonth(previousMonth);

  // Formatear las fechas
  const formattedStartDate = format(startDate, "yyyy-MM-dd");
  const formattedEndDate = format(endDate, "yyyy-MM-dd");

  interface Params {
    from_first?: string; // Fecha de inicio del primer rango
    to_first?: string; // Fecha de fin del primer rango
    from_second?: string; // Fecha de inicio del segundo rango
    to_second?: string; // Fecha de fin del segundo rango
    [key: string]: string | undefined; // Permite otros parámetros
  }

  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [params, setParams] = useState<Params>({
    from_first: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    to_first: format(new Date(), "yyyy-MM-dd"),

    from_second: format(startOfMonth(previousMonth), "yyyy-MM-dd"),
    to_second: format(endOfMonth(previousMonth), "yyyy-MM-dd"),
  });

  // Para extraer las estadisticas de reportes dado unos rangos de fecha, desde hasta
  const {
    data: barChartData,
    isLoading: isLoadingBarChart,
    isError: isErrorBarChart,
    refetch: refetchBarChart,
  } = useGetTotalReportsStatsByYear(
    params.from_first || format(startOfMonth(new Date()), "yyyy-MM-dd"),
    params.to_first || format(new Date(), "yyyy-MM-dd")
  );

  const {
    data: obligatoryAverageData,
    isLoading: isLoadingObligatoryAverageData,
    isError: isErrorObligatoryAverageData,
    refetch: refetchObligatoryAverageData,
  } = useGetObligatoryReportAverage(
    params.from_first || format(startOfMonth(new Date()), "yyyy-MM-dd"),
    params.to_first || format(new Date(), "yyyy-MM-dd"),
    params.from_second || formattedStartDate,
    params.to_second || formattedEndDate
  );

  const [resultArrayData, setResultArrayData] = useState<pieChartData[]>([]);
  const [result, setResult] = useState<number>();

  function formatDate(date: string) {
    const newDate = addDays(new Date(date), 1);
    return format(newDate, "PPP", {
      locale: es,
    });
  }

  useEffect(() => {
    refetchBarChart();
    refetchObligatoryAverageData();
  }, [
    refetchBarChart,
    refetchObligatoryAverageData,
    params.from_first,
    params.from_second,
    params.to_first,
    params.to_second,
  ]);

  useEffect(() => {
    if (obligatoryAverageData) {
      const newData = [
        {
          name: `${formatDate(params.from_first || "")} - ${formatDate(
            params.to_first || ""
          )}`,
          value: obligatoryAverageData.newest_range.average_per_month,
        },
        {
          name: `${formatDate(params.from_second || "")} - ${formatDate(
            params.to_second || ""
          )}`,
          value: obligatoryAverageData.oldest_range.average_per_month,
        },
      ];
      setResultArrayData(newData);
    }
  }, [
    obligatoryAverageData,
    params.from_first,
    params.from_second,
    params.to_first,
    params.to_second,
  ]);

  return (
    <>
      <ContentLayout title="Indicador de Incidentes">
        <div className="flex justify-center items-center mb-4">
          <div className="flex flex-col w-full">
            <Label className="text-lg font-semibold text-center">
              Seleccionar Rango de Fechas :
            </Label>
            <DoubleDateFilter />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          {/* Gráfico de Barras (Peligros Identificados) */}
          <div className=" flex flex-col justify-center items-center p-4 rounded-lg shadow border ">
            {isLoadingObligatoryAverageData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : obligatoryAverageData ? (
              params.from_first &&
              params.to_first &&
              resultArrayData && (
                <DynamicBarChart
                  height="100%"
                  width="100%"
                  data={resultArrayData}
                  aspect={3}
                  title="Promedio de Reportes Obligatorios"
                  activeDecimal={true}
                />
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                Ha ocurrido un error al cargar los datos de Peligros
                Identificados vs Gestionados...
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-center items-center p-4 rounded-lg shadow border w-full ">
          {obligatoryAverageData &&
          obligatoryAverageData.newest_range?.average_per_month >
            obligatoryAverageData.oldest_range?.average_per_month ? (
            <div
              className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg justify-center items-center flex w-1/2"
              role="alert"
            >
              <span className="block text-center">
                <strong className="font-bold text-lg">
                  ¡Aumento de los Incidentes!
                </strong>
              </span>

              <div className="mt-4 p-4 bg-red-50 rounded-md border border-gray-200 shadow-sm text-black text-left justify-center items-center w-full">
                <p className="font-bold text-lg text-center">
                  ¡Aumento de un{" "}
                  {obligatoryAverageData.newest_range.percentage_change || 100}%
                  de incidentes!
                </p>
                <p className="mb-2">
                  En numero de incidentes fue mayor durante las fechas:
                </p>
                <p className="font-semibold">
                  {dateFormat(obligatoryAverageData.newest_range.from, "PPP")}{" "}
                  al {dateFormat(obligatoryAverageData.newest_range.to, "PPP")}
                </p>
                <p className="mt-2">en comparacion a las fechas desde:</p>
                <p className="font-semibold">
                  {dateFormat(obligatoryAverageData.oldest_range.from, "PPP")}{" "}
                  al {dateFormat(obligatoryAverageData.oldest_range.to, "PPP")}
                </p>
              </div>
            </div>
          ) : obligatoryAverageData &&
            obligatoryAverageData.newest_range?.average_per_month <
              obligatoryAverageData.oldest_range?.average_per_month ? (
            <div
              className="bg-green-100 border border-green-400 text-green-700 p-4 rounded-lg justify-center items-center flex w-1/2"
              role="alert"
            >
              <span className="block text-center">
                <strong className="font-bold text-lg">
                  ¡Reducción de los Incidentes!
                </strong>
              </span>
              <div className="mt-4 p-4 bg-green-50 rounded-md border border-gray-200 shadow-sm text-black text-left justify-center items-center w-full">
                <p className="font-bold text-lg text-center">
                  ¡Reducción de un{" "}
                  {Math.abs(
                    obligatoryAverageData.newest_range.percentage_change
                  ).toFixed(2)}
                  % de incidentes!
                </p>
                <p className="mb-2">
                  En numero de incidentes fue menor durante las fechas:
                </p>
                <p className="font-semibold">
                  {dateFormat(obligatoryAverageData.newest_range.from, "PPP")}{" "}
                  al {dateFormat(obligatoryAverageData.newest_range.to, "PPP")}
                </p>
                <p className="mt-2">en comparacion a las fechas desde:</p>
                <p className="font-semibold">
                  {dateFormat(obligatoryAverageData.oldest_range.from, "PPP")}{" "}
                  al {dateFormat(obligatoryAverageData.oldest_range.to, "PPP")}
                </p>
              </div>
            </div>
          ) : (
            obligatoryAverageData && (
              <div
                className="bg-blue-100 border border-blue-400 text-blue-700 p-4 rounded-lg justify-center items-center flex w-1/2"
                role="alert"
              >
                <span className="block text-center">
                  <strong className="font-bold text-lg">
                    ¡Sin Fluctuación!
                  </strong>
                </span>
                <div className="mt-4 p-4 bg-blue-50 rounded-md border border-gray-200 shadow-sm text-black text-left justify-center items-center w-full">
                  <p className="font-bold text-lg text-center">
                    ¡Se ha mentenido el numero de incidentes promedio !{" "}
                  </p>
                  <p className="mb-2">
                    En numero de incidentes no tuvo variaciones significativas
                    durante las fechas:
                  </p>
                  <p className="font-semibold">
                    (
                    {dateFormat(obligatoryAverageData.newest_range.from, "PPP")}
                    ) al (
                    {dateFormat(obligatoryAverageData.newest_range.to, "PPP")})
                  </p>
                  <p className="mt-2">en comparacion a las fechas del :</p>
                  <p className="font-semibold">
                    (
                    {dateFormat(obligatoryAverageData.oldest_range.from, "PPP")}
                    ) al (
                    {dateFormat(obligatoryAverageData.oldest_range.to, "PPP")})
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </ContentLayout>
    </>
  );
};

export default ObligatoryReportIndicators;
