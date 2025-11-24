"use client";
import DynamicBarChart from "@/components/charts/DynamicBarChart";
import MultipleBarChartComponent from "@/components/charts/MultipleBarChartComponent";
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
import { IncidentAlertCard } from "../_components/RiskIndicatorMessages";

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
  }, [
    searchParams,
    defaultFirstRange.to,
    defaultFirstRange.from,
    defaultSecondRange.from,
    defaultSecondRange.to,
  ]);

  // Obtener datos
  const {
    data: barChartData,
    isLoading: isLoadingBarChart,
    isError: isErrorBarChart,
  } = useGetTotalReportsStatsByYear(
    params.from_first,
    params.to_first,
    selectedCompany?.slug!
  );

  const {
    data: obligatoryAverageData,
    isLoading: isLoadingObligatoryAverageData,
    isError: isErrorObligatoryAverageData,
  } = useGetObligatoryReportAverage(
    selectedCompany?.slug!,
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
          name: `${formatDate(params.from_second)} - ${formatDate(params.to_second)}`,
          value: obligatoryAverageData.oldest_range.average_per_month,
        },
        {
          name: `${formatDate(params.from_first)} - ${formatDate(params.to_first)}`,
          value: obligatoryAverageData.newest_range.average_per_month,
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
            <MultipleBarChartComponent
              data={resultArrayData}
              title="Promedio de Reportes Obligatorios"
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
            <IncidentAlertCard type="increase" data={obligatoryAverageData} />
          ) : obligatoryAverageData.newest_range?.average_per_month <
            obligatoryAverageData.oldest_range?.average_per_month ? (
            <IncidentAlertCard type="decrease" data={obligatoryAverageData} />
          ) : (
            <IncidentAlertCard type="stable" data={obligatoryAverageData} />
          ))}
      </div>
    </ContentLayout>
  );
};

export default ObligatoryReportIndicators;
