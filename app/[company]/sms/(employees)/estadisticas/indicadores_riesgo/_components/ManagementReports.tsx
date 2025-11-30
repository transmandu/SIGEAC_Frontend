"use client";
import BarChartComponent from "@/components/charts/BarChartComponent";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import DateFilter from "@/components/misc/DataFilter";
import { Label } from "@/components/ui/label";
import { useGetTotalReportsStatsByYear } from "@/hooks/sms/useGetTotalReportsStatsByYear";
import { useCompanyStore } from "@/stores/CompanyStore";
import { pieChartData } from "@/types";
import { format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { GoalStatusCard } from "./GoldStatusCard";

interface ManagementReportsProps {
  companySlug?: string;
}

export const ManagementReports: React.FC<ManagementReportsProps> = ({
  companySlug,
}) => {
  const { selectedCompany } = useCompanyStore();
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

  // OBTENER DATOS - Usa directamente los parámetros actuales de la URL
  const {
    data: barChartData,
    isLoading: isLoadingBarChart,
    isError: isErrorBarChart,
  } = useGetTotalReportsStatsByYear(
    currentParams.from,
    currentParams.to,
    companySlug || selectedCompany?.slug!
  );

  // Preparar datos para el gráfico
  const formatDate = useMemo(
    () => (date: string) => {
      const newDate = new Date(date);
      return format(newDate, "PPP", { locale: es });
    },
    []
  );

  // Datos para el gráfico - CORREGIDO: useMemo en lugar de useEffect + useState
  const resultArrayData = useMemo(() => {
    if (!barChartData) return [];

    return [
      {
        name: "Reportes en Proceso",
        value: barChartData.open,
      },
      {
        name: "Reportes Gestionados",
        value: barChartData.closed,
      },
    ];
  }, [barChartData]);

  // Calcular resultado - CORREGIDO: useMemo en lugar de useState
  const result = useMemo(() => {
    if (!barChartData || barChartData.total === 0) return 0;
    return (barChartData.closed * 100) / barChartData.total;
  }, [barChartData]);

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

  const renderBarChart = () => {
    if (isLoadingBarChart) {
      return (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="size-24 animate-spin" />
        </div>
      );
    }

    if (!barChartData) {
      return (
        <p className="text-sm text-muted-foreground">
          Ha ocurrido un error al cargar los datos de Peligros Identificados vs
          Gestionados...
        </p>
      );
    }

    return (
      <>
        <BarChartComponent
          data={barChartData}
          title="Peligros Identificados vs Gestionados"
          bar_first_name="Identificados"
          bar_second_name="Gestionados"
        />
      </>
    );
  };

  const renderPieChart = () => {
    if (isLoadingBarChart) {
      return (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="size-24 animate-spin" />
        </div>
      );
    }

    if (resultArrayData && resultArrayData.length > 0) {
      return (
        <PieChartComponent
          data={resultArrayData}
          title="Porcentaje de Peligros Identificados vs Gestionados"
        />
      );
    }

    return (
      <p className="text-lg text-muted-foreground">
        No hay datos para mostrar.
      </p>
    );
  };

  const renderGoalStatusCard = () => {
    if (!resultArrayData || resultArrayData.length === 0 || result === 0) {
      return null;
    }

    return (
      <div className="flex justify-center items-center p-4 rounded-lg shadow-md">
        <GoalStatusCard
          achieved={result >= 90}
          result={result}
          params={{
            from: currentParams.from,
            to: currentParams.to,
          }}
          className="w-full sm:w-2/3 mb-4"
        />
      </div>
    );
  };

  return (
    <>
      {/* Date Filter Section */}
      <div className="flex justify-center items-center mb-4">
        <div className="flex flex-col">
          <Label className="text-lg font-semibold">
            Seleccionar Rango de Fechas :
          </Label>
          <DateFilter
            onDateChange={handleDateChange}
            onReset={handleReset}
            initialDate={{
              from: currentParams.from,
              to: currentParams.to,
            }}
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <div className="flex flex-col justify-center items-center p-4 rounded-lg shadow border">
          {renderBarChart()}
        </div>

        {/* Pie Chart */}
        <div className="flex flex-col justify-center items-center p-4 rounded-lg shadow border">
          {renderPieChart()}
          {isErrorBarChart && (
            <p className="text-sm text-muted-foreground">
              Ha ocurrido un error al cargar el numero de reportes por indice de
              riesgo...
            </p>
          )}
        </div>
      </div>

      {/* Goal Status Card */}
      {renderGoalStatusCard()}
    </>
  );
};
