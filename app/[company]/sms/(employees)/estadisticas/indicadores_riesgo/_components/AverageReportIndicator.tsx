"use client";
import MultipleBarChartComponent from "@/components/charts/MultipleBarChartComponent";
import DoubleDateFilter from "@/components/misc/DoubleDateFilter";
import { Label } from "@/components/ui/label";
import { useGetObligatoryReportAverage } from "@/hooks/sms/useGetObligatoryReportAverage";
import { useGetTotalReportsStatsByYear } from "@/hooks/sms/useGetTotalReportsStatsByYear";
import { useCompanyStore } from "@/stores/CompanyStore";
import { addDays, endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IncidentAlertCard } from "./RiskIndicatorMessages";

interface AverageReportIndicatorProps {
  companySlug?: string;
}

export const AverageReportIndicator: React.FC<AverageReportIndicatorProps> = ({
  companySlug,
}) => {
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

  // Obtener datos
  const {
    data: barChartData,
    isLoading: isLoadingBarChart,
    isError: isErrorBarChart,
  } = useGetTotalReportsStatsByYear(
    params.from_first,
    params.to_first,
    companySlug || selectedCompany?.slug!
  );

  const {
    data: obligatoryAverageData,
    isLoading: isLoadingObligatoryAverageData,
    isError: isErrorObligatoryAverageData,
  } = useGetObligatoryReportAverage(
    companySlug || selectedCompany?.slug!,
    params.from_first,
    params.to_first,
    params.from_second,
    params.to_second
  );

  // Sincronizar parámetros con la URL - SOLUCIÓN: usar useMemo para valores por defecto
  const defaultRanges = useMemo(
    () => ({
      firstRange: defaultFirstRange,
      secondRange: defaultSecondRange,
    }),
    []
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams.toString());
    const newParams = {
      from_first: urlParams.get("from_first") || defaultRanges.firstRange.from,
      to_first: urlParams.get("to_first") || defaultRanges.firstRange.to,
      from_second:
        urlParams.get("from_second") || defaultRanges.secondRange.from,
      to_second: urlParams.get("to_second") || defaultRanges.secondRange.to,
    };
    setParams(newParams);
  }, [searchParams, defaultRanges]);

  // Preparar datos para el gráfico - SOLUCIÓN: usar useMemo en lugar de useEffect
  const formatDate = (date: string) => {
    const newDate = addDays(new Date(date), 1);
    return format(newDate, "PPP", { locale: es });
  };

  // ✅ CORREGIDO: useMemo en lugar de useEffect + useState
  const resultArrayData = useMemo(() => {
    if (!obligatoryAverageData) return [];

    return [
      {
        name: `${formatDate(params.from_second)} - ${formatDate(params.to_second)}`,
        value: obligatoryAverageData.oldest_range.average_per_month,
      },
      {
        name: `${formatDate(params.from_first)} - ${formatDate(params.to_first)}`,
        value: obligatoryAverageData.newest_range.average_per_month,
      },
    ];
  }, [
    obligatoryAverageData,
    params.from_first,
    params.to_first,
    params.from_second,
    params.to_second,
  ]);

  // Manejar cambio de fechas desde DoubleDateFilter
  const handleDateChange = (ranges: {
    firstRange: { start: string; end: string };
    secondRange: { start: string; end: string };
  }) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("from_first", ranges.firstRange.start);
    newParams.set("to_first", ranges.firstRange.end);
    newParams.set("from_second", ranges.secondRange.start);
    newParams.set("to_second", ranges.secondRange.end);
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  // Renderizar el gráfico principal
  const renderMainChart = () => {
    if (isLoadingObligatoryAverageData) {
      return (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="size-24 animate-spin" />
        </div>
      );
    }

    if (!obligatoryAverageData) {
      return (
        <p className="text-sm text-muted-foreground">
          Ha ocurrido un error al cargar los datos...
        </p>
      );
    }

    return (
      <MultipleBarChartComponent
        data={resultArrayData}
        title="Promedio de Reportes Obligatorios"
      />
    );
  };

  // Determinar el tipo de alerta basado en los datos
  const getAlertType = () => {
    if (!obligatoryAverageData) return null;

    const newest = obligatoryAverageData.newest_range?.average_per_month;
    const oldest = obligatoryAverageData.oldest_range?.average_per_month;

    if (newest > oldest) return "increase";
    if (newest < oldest) return "decrease";
    return "stable";
  };

  // Renderizar la alerta de incidentes
  const renderIncidentAlert = () => {
    const alertType = getAlertType();

    if (!alertType || !obligatoryAverageData) return null;

    return (
      <div className="flex justify-center items-center p-4 rounded-lg shadow border w-full">
        <IncidentAlertCard type={alertType} data={obligatoryAverageData} />
      </div>
    );
  };

  return (
    <>
      {/* Filtro de fechas */}
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

      {/* Gráfico principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        <div className="flex flex-col justify-center items-center p-4 rounded-lg shadow border">
          {renderMainChart()}
        </div>
      </div>

      {/* Alerta de incidentes */}
      {renderIncidentAlert()}
    </>
  );
};