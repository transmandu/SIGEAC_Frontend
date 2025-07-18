"use client";
import DynamicBarChart from "@/components/charts/DynamicBarChart";
import { ContentLayout } from "@/components/layout/ContentLayout";
import DoubleDateFilter from "@/components/misc/DoubleDateFilter";
import { Label } from "@/components/ui/label";
import { useGetObligatoryReportAverage } from "@/hooks/sms/useGetObligatoryReportAverage";
import { useGetTotalReportsStatsByYear } from "@/hooks/sms/useGetTotalReportsStatsByYear";
import { dateFormat } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { pieChartData } from "@/types";
import { addDays, endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const ObligatoryReportIndicators = () => {
  const { selectedCompany } = useCompanyStore();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Obtener fechas por defecto
  const currentDate = new Date();
  const previousMonth = subMonths(currentDate, 1);
  const defaultFirstRange = {
    from: format(startOfMonth(currentDate), "yyyy-MM-dd"),
    to: format(currentDate, "yyyy-MM-dd"),
  };
  const defaultSecondRange = {
    from: format(startOfMonth(previousMonth), "yyyy-MM-dd"),
    to: format(endOfMonth(previousMonth), "yyyy-MM-dd"),
  };

  // Estado para los parámetros
  const [params, setParams] = useState({
    from_first: defaultFirstRange.from,
    to_first: defaultFirstRange.to,
    from_second: defaultSecondRange.from,
    to_second: defaultSecondRange.to,
  });

  // Sincronizar parámetros con la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams.toString());
    const newParams = {
      from_first: urlParams.get("from_first") || defaultFirstRange.from,
      to_first: urlParams.get("to_first") || defaultFirstRange.to,
      from_second: urlParams.get("from_second") || defaultSecondRange.from,
      to_second: urlParams.get("to_second") || defaultSecondRange.to,
    };
    setParams(newParams);
  }, [searchParams]);

  // Obtener datos
  const {
    data: barChartData,
    isLoading: isLoadingBarChart,
    isError: isErrorBarChart,
  } = useGetTotalReportsStatsByYear(
    selectedCompany,
    params.from_first,
    params.to_first
  );

  const {
    data: obligatoryAverageData,
    isLoading: isLoadingObligatoryAverageData,
    isError: isErrorObligatoryAverageData,
  } = useGetObligatoryReportAverage(
    selectedCompany,
    params.from_first,
    params.to_first,
    params.from_second,
    params.to_second
  );

  // Preparar datos para el gráfico
  const [resultArrayData, setResultArrayData] = useState<pieChartData[]>([]);

  const formatDate = (date: string) => {
    const newDate = addDays(new Date(date), 1);
    return format(newDate, "PPP", { locale: es });
  };

  useEffect(() => {
    if (obligatoryAverageData) {
      const newData = [
        {
          name: `${formatDate(params.from_first)} - ${formatDate(params.to_first)}`,
          value: obligatoryAverageData.newest_range.average_per_month,
        },
        {
          name: `${formatDate(params.from_second)} - ${formatDate(params.to_second)}`,
          value: obligatoryAverageData.oldest_range.average_per_month,
        },
      ];
      setResultArrayData(newData);
    }
  }, [obligatoryAverageData, params]);

  // Manejar cambio de fechas desde DoubleDateFilter
  const handleDateChange = (ranges: {
    firstRange: { start: string; end: string };
    secondRange: { start: string; end: string };
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from_first", ranges.firstRange.start);
    params.set("to_first", ranges.firstRange.end);
    params.set("from_second", ranges.secondRange.start);
    params.set("to_second", ranges.secondRange.end);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <ContentLayout title="Indicador de Incidentes">
      <div className="flex justify-center items-center mb-4">
        <div className="flex flex-col w-full">
          <Label className="text-lg font-semibold text-center">
            Seleccionar Rango de Fechas :
          </Label>
          <DoubleDateFilter
            initialFirstRange={{
              start: params.from_first,
              end: params.to_first,
            }}
            initialSecondRange={{
              start: params.from_second,
              end: params.to_second,
            }}
            onDateChange={handleDateChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {/* Gráfico de Barras (Peligros Identificados) */}
        <div className="flex flex-col justify-center items-center p-4 rounded-lg shadow border">
          {isLoadingObligatoryAverageData ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="size-24 animate-spin" />
            </div>
          ) : obligatoryAverageData ? (
            <DynamicBarChart
              height="100%"
              width="100%"
              data={resultArrayData}
              aspect={3}
              title="Promedio de Reportes Obligatorios"
              activeDecimal={true}
              isCustomizedAxis={false}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Ha ocurrido un error al cargar los datos...
            </p>
          )}
        </div>
      </div>

      {/* Mensajes de resultado */}
      <div className="flex justify-center items-center p-4 rounded-lg shadow border w-full">
        {obligatoryAverageData &&
          (obligatoryAverageData.newest_range?.average_per_month >
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
          ) : obligatoryAverageData.newest_range?.average_per_month <
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
            <div
              className="bg-blue-100 border border-blue-400 text-blue-700 p-4 rounded-lg justify-center items-center flex w-1/2"
              role="alert"
            >
              <span className="block text-center">
                <strong className="font-bold text-lg">¡Sin Fluctuación!</strong>
              </span>
              <div className="mt-4 p-4 bg-blue-50 rounded-md border border-gray-200 shadow-sm text-black text-left justify-center items-center w-full">
                <p className="font-bold text-lg text-center">
                  ¡Se ha mentenido el numero de incidentes promedio!
                </p>
                <p className="mb-2">
                  En numero de incidentes no tuvo variaciones significativas
                  durante las fechas:
                </p>
                <p className="font-semibold">
                  ({dateFormat(obligatoryAverageData.newest_range.from, "PPP")})
                  al ({dateFormat(obligatoryAverageData.newest_range.to, "PPP")}
                  )
                </p>
                <p className="mt-2">en comparacion a las fechas del :</p>
                <p className="font-semibold">
                  ({dateFormat(obligatoryAverageData.oldest_range.from, "PPP")})
                  al ({dateFormat(obligatoryAverageData.oldest_range.to, "PPP")}
                  )
                </p>
              </div>
            </div>
          ))}
      </div>
    </ContentLayout>
  );
};

export default ObligatoryReportIndicators;
