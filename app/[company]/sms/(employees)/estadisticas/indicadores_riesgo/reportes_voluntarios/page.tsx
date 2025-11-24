"use client";
import BarChartComponent from "@/components/charts/BarChartComponent";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { ContentLayout } from "@/components/layout/ContentLayout";
import DateFilter from "@/components/misc/DataFilter";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useGetTotalReportsStatsByYear } from "@/hooks/sms/useGetTotalReportsStatsByYear";
import { dateFormat } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { pieChartData } from "@/types";
import { format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight, Calendar, CheckCircle2, Loader2, Target } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GoalStatusCard } from "../_components/GoldStatusCard";

const VoluntaryReportIndicators = () => {
  const { selectedCompany } = useCompanyStore();
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
    params.to || format(new Date(), "yyyy-MM-dd"),
    selectedCompany?.slug!
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Gráfico de Barras (Peligros Identificados) */}
          <div className=" flex flex-col justify-center items-center p-4 rounded-lg shadow border">
            {isLoadingBarChart ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : barChartData ? (
              params.from &&
              params.to && (
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
              <GoalStatusCard
                achieved={true}
                result={result}
                params={{
                  from: params.from,
                  to: params.to,
                }}
                className="w-2/3 mb-4"
              />
            ) : (
              <GoalStatusCard
                achieved={false}
                result={result}
                params={{
                  from: params.from,
                  to: params.to,
                }}
                className="w-2/3 mb-4"
              />
            )}
          </div>
        )}
      </ContentLayout>
    </>
  );
};

export default VoluntaryReportIndicators;
