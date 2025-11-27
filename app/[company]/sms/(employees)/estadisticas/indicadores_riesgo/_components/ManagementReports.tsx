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
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GoalStatusCard } from "./GoldStatusCard";

interface ManagementReportsProps {
  // Puedes agregar props aquí si necesitas
  companySlug?: string;
}

export const ManagementReports: React.FC<
  ManagementReportsProps
> = ({ companySlug }) => {
  const { selectedCompany } = useCompanyStore();
  interface Params {
    from?: string;
    to?: string;
    [key: string]: string | undefined;
  }

  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [params, setParams] = useState<Params>({
    from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  });

  const [resultArrayData, setResultArrayData] = useState<pieChartData[]>([]);
  const [result, setResult] = useState<number>();

  // Para extraer las estadisticas de reportes dado unos rangos de fecha, desde hasta
  const {
    data: barChartData,
    isLoading: isLoadingBarChart,
    isError: isErrorBarChart,
    refetch: refetchBarChart,
  } = useGetTotalReportsStatsByYear(
    params.from || format(startOfMonth(new Date()), "yyyy-MM-dd"),
    params.to || format(new Date(), "yyyy-MM-dd"),
    companySlug || selectedCompany?.slug!
  );

  function formatDate(date: string) {
    const newDate = new Date(date);
    return format(newDate, "PPP", {
      locale: es,
    });
  }

  // Effect for updating params from URL
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

  // Effect for refetching data when params change
  useEffect(() => {
    refetchBarChart();
  }, [params.from, params.to, refetchBarChart]);

  // Effect for processing chart data
  useEffect(() => {
    if (barChartData) {
      setResultArrayData([
        {
          name: "Reportes en Proceso",
          value: barChartData.open,
        },
        {
          name: "Reportes Gestionados",
          value: barChartData.closed,
        },
      ]);
      setResult((barChartData.closed * 100) / barChartData.total);
    } else {
      setResultArrayData([]);
    }
  }, [barChartData]);

  const renderBarChart = () => {
    if (isLoadingBarChart) {
      return (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="size-24 animate-spin" />
        </div>
      );
    }

    if (!barChartData || !params.from || !params.to) {
      return (
        <p className="text-sm text-muted-foreground">
          Ha ocurrido un error al cargar los datos de Peligros Identificados vs
          Gestionados...
        </p>
      );
    }

    return (
      <>
        <h2 className="text-sm sm:text-base font-bold">
          Peligros Identificados vs Gestionados
        </h2>
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
    if (isLoadingBarChart && barChartData !== null) {
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
    if (
      !resultArrayData ||
      resultArrayData.length === 0 ||
      result === undefined
    ) {
      return null;
    }

    return (
      <div className="flex justify-center items-center p-4 rounded-lg shadow-md">
        <GoalStatusCard
          achieved={result >= 90}
          result={result}
          params={{
            from: params.from,
            to: params.to,
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
          <DateFilter />
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