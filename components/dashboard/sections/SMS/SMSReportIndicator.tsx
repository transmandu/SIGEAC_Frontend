"use client";

import BarChartComponent from "@/components/charts/BarChartComponent";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { Message } from "@/components/misc/Message";
import { useGetTotalReportsStatsByYear } from "@/hooks/sms/useGetTotalReportsStatsByYear";
import { format, startOfYear } from "date-fns";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

interface SMSReportIndicatorProps {
  companySlug: string;
}

export default function SMSReportIndicator({
  companySlug,
}: SMSReportIndicatorProps) {
  const {
    data: barChartData,
    isLoading: isLoadingBarChart,
    isError: isErrorBarChart,
  } = useGetTotalReportsStatsByYear(
    format(startOfYear(new Date()), "yyyy-MM-dd"),
    format(new Date(), "yyyy-MM-dd"),
    companySlug
  );

  // Preparar datos para el gráfico de pie
  const pieChartData = useMemo(() => {
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

  // Calcular porcentaje de gestión
  const managementPercentage = useMemo(() => {
    if (!barChartData || barChartData.total === 0) return 0;
    return (barChartData.closed * 100) / barChartData.total;
  }, [barChartData]);

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
          Ha ocurrido un error al cargar los datos de Reportes vs Gestionados...
        </p>
      );
    }

    return (
      <BarChartComponent
        data={barChartData}
        title="Reportes Identificados vs Gestionados"
        bar_first_name="Identificados"
        bar_second_name="Gestionados"
      />
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

    if (pieChartData && pieChartData.length > 0) {
      return (
        <PieChartComponent
          data={pieChartData}
          title="Porcentaje de Reportes vs Gestionados"
        />
      );
    }

    return (
      <p className="text-lg text-muted-foreground">
        No hay datos para mostrar.
      </p>
    );
  };

  const renderManagementMessage = () => {
    if (
      !pieChartData ||
      pieChartData.length === 0 ||
      managementPercentage === 0
    ) {
      return null;
    }

    const isGoalAchieved = managementPercentage >= 90;

    return (
      <div className="flex justify-center items-center p-4 rounded-lg shadow-md border">
        <div className="text-center w-full">
          <h3 className="text-lg font-semibold mb-2">
            {isGoalAchieved ? "Meta Alcanzada" : "Progreso Actual"}
          </h3>
          <p className="text-sm mb-2">
            Porcentaje de reportes gestionados:
          </p>

          {/* Barra de progreso DINÁMICA */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-3 relative">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${managementPercentage}%` }}
            ></div>

            {/* Indicador del porcentaje actual EN LA BARRA */}
            <div
              className="absolute top-0 h-4 flex items-center justify-end pr-2 text-xs font-bold text-white"
              style={{ width: `${Math.min(managementPercentage, 100)}%` }}
            >
              {managementPercentage >= 15 &&
                `${managementPercentage.toFixed(2)}%`}
            </div>
          </div>

          {/* Marcadores del 0% al 100% */}
          <div className="flex justify-between text-xs mb-2 px-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>

          <div className="text-2xl font-bold text-blue-600">
            {managementPercentage.toFixed(2)}%
          </div>
          <p className="text-xs mt-2">
            {barChartData?.closed || 0} de {barChartData?.total || 0} reportes
            gestionados
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Bar Chart */}
        <div className="flex flex-col justify-center items-center p-4 rounded-lg shadow border">
          {renderBarChart()}
        </div>

        {/* Pie Chart */}
        <div className="flex flex-col justify-center items-center p-4 rounded-lg shadow border">
          {renderPieChart()}
          {isErrorBarChart && (
            <p className="text-sm text-muted-foreground">
              Ha ocurrido un error al cargar el porcentaje de reportes...
            </p>
          )}
        </div>
      </div>

      {/* Management Status Message */}
      {renderManagementMessage()}

      {/* Error State */}
      {isErrorBarChart && (
        <div className="mt-4">
          <Message
            title="Error al cargar datos"
            description="No se pudieron cargar los datos de reportes. Por favor, inténtelo de nuevo."
          />
        </div>
      )}
    </div>
  );
}
