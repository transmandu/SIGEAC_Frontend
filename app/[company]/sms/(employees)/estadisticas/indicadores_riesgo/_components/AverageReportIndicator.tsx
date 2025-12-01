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
import { useMemo } from "react";
import { IncidentAlertCard } from "./RiskIndicatorMessages";

interface AverageReportIndicatorProps {
  companySlug?: string;
}

export const AverageReportIndicator: React.FC<AverageReportIndicatorProps> = ({
  companySlug,
}) => {
  const { selectedCompany } = useCompanyStore();
  const urlSearchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Obtener fechas por defecto
  const currentDate = useMemo(() => new Date(), []);
  const previousMonth = useMemo(() => subMonths(currentDate, 1), [currentDate]);

  const defaultFirstRange = useMemo(
    () => ({
      from: format(startOfMonth(currentDate), "yyyy-MM-dd"),
      to: format(currentDate, "yyyy-MM-dd"),
    }),
    [currentDate]
  );

  const defaultSecondRange = useMemo(
    () => ({
      from: format(startOfMonth(previousMonth), "yyyy-MM-dd"),
      to: format(endOfMonth(previousMonth), "yyyy-MM-dd"),
    }),
    [previousMonth]
  );

  // Obtener parámetros ACTUALES de la URL - SIN estado local
  const currentParams = useMemo(() => {
    const urlParams = new URLSearchParams(urlSearchParams.toString());
    return {
      from_first: urlParams.get("from_first") || defaultFirstRange.from,
      to_first: urlParams.get("to_first") || defaultFirstRange.to,
      from_second: urlParams.get("from_second") || defaultSecondRange.from,
      to_second: urlParams.get("to_second") || defaultSecondRange.to,
    };
  }, [urlSearchParams, defaultFirstRange, defaultSecondRange]);

  // OBTENER DATOS - Usa directamente los parámetros actuales de la URL
  const {
    data: obligatoryAverageData,
    isLoading: isLoadingObligatoryAverageData,
    isError: isErrorObligatoryAverageData,
  } = useGetObligatoryReportAverage(
    companySlug || selectedCompany?.slug!,
    currentParams.from_first,
    currentParams.to_first,
    currentParams.from_second,
    currentParams.to_second
  );

  // Preparar datos para el gráfico
  const formatDate = useMemo(
    () => (date: string) => {
      const newDate = addDays(new Date(date), 1);
      return format(newDate, "PPP", { locale: es });
    },
    []
  );

  // Datos para el gráfico
  const resultArrayData = useMemo(() => {
    if (!obligatoryAverageData) return [];

    return [
      {
        name: `${formatDate(currentParams.from_second)} - ${formatDate(currentParams.to_second)}`,
        value: obligatoryAverageData.oldest_range.average_per_month,
      },
      {
        name: `${formatDate(currentParams.from_first)} - ${formatDate(currentParams.to_first)}`,
        value: obligatoryAverageData.newest_range.average_per_month,
      },
    ];
  }, [
    obligatoryAverageData,
    currentParams.from_first,
    currentParams.to_first,
    currentParams.from_second,
    currentParams.to_second,
    formatDate,
  ]);

  // Manejar cambio de fechas desde DoubleDateFilter
  const handleDateChange = (ranges: {
    firstRange: { start: string; end: string };
    secondRange: { start: string; end: string };
  }) => {
    const newParams = new URLSearchParams();
    newParams.set("from_first", ranges.firstRange.start);
    newParams.set("to_first", ranges.firstRange.end);
    newParams.set("from_second", ranges.secondRange.start);
    newParams.set("to_second", ranges.secondRange.end);

    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  // Manejar reset
  const handleReset = () => {
    const newParams = new URLSearchParams();
    newParams.set("from_first", defaultFirstRange.from);
    newParams.set("to_first", defaultFirstRange.to);
    newParams.set("from_second", defaultSecondRange.from);
    newParams.set("to_second", defaultSecondRange.to);

    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
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

    if (isErrorObligatoryAverageData || !obligatoryAverageData) {
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
              start: currentParams.from_first,
              end: currentParams.to_first,
            }}
            initialSecondRange={{
              start: currentParams.from_second,
              end: currentParams.to_second,
            }}
            onDateChange={handleDateChange}
            onReset={handleReset}
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
