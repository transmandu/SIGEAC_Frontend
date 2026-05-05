"use client";

import BarChartComponent from "@/components/charts/BarChartComponent";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { Message } from "@/components/misc/Message";
import { useGetTotalReportsStatsByYear } from "@/hooks/sms/useGetTotalReportsStatsByYear";
import { format, startOfYear } from "date-fns";
import { Loader2, BarChart3, PieChart } from "lucide-react";
import { useMemo } from "react";

interface SMSReportIndicatorProps {
  companySlug: string;
}

/* =========================
   TINTED CARD (AMBER)
   ========================= */
function TintedCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border bg-background/75 backdrop-blur-xl shadow-sm ${className}`}
      style={{
        borderColor: "rgba(251,191,36,0.15)",
        backgroundImage: `
          linear-gradient(
            to bottom right,
            rgba(251,191,36,0.035),
            transparent 70%
          )
        `,
      }}
    >
      {children}
    </div>
  );
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

  /* =========================
     PIE DATA
     ========================= */
  const pieChartData = useMemo(() => {
    if (!barChartData) return [];

    return [
      {
        name: "En Proceso",
        value: barChartData.open,
      },
      {
        name: "Gestionados",
        value: barChartData.closed,
      },
    ];
  }, [barChartData]);

  const managementPercentage = useMemo(() => {
    if (!barChartData || barChartData.total === 0) return 0;
    return (barChartData.closed * 100) / barChartData.total;
  }, [barChartData]);

  /* =========================
     BAR CHART
     ========================= */
  const renderBarChart = () => {
    if (isLoadingBarChart) {
      return (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="size-10 animate-spin text-amber-500" />
        </div>
      );
    }

    if (!barChartData) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-40 space-y-2">
          <BarChart3 className="size-6 text-slate-400" />
          <p className="text-sm font-medium text-slate-500">
            Sin datos de reportes
          </p>
          <p className="text-xs text-slate-400">
            No hay información disponible en el rango seleccionado
          </p>
        </div>
      );
    }

    return (
      <div className="[&_.recharts-default-legend]:!pt-2 [&_.recharts-legend-wrapper]:!translate-y-[-18px]">
        <BarChartComponent
          data={barChartData}
          title=""
          bar_first_name="Identificados"
          bar_second_name="Gestionados"
        />
      </div>
    );
  };

  /* =========================
     PIE CHART
     ========================= */
  const renderPieChart = () => {
    if (isLoadingBarChart) {
      return (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="size-10 animate-spin text-amber-500" />
        </div>
      );
    }

    if (!pieChartData.length) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-40 space-y-2">
          <PieChart className="size-6 text-slate-400" />
          <p className="text-sm font-medium text-slate-500">
            Sin distribución de datos
          </p>
          <p className="text-xs text-slate-400">
            Aún no existen reportes registrados
          </p>
        </div>
      );
    }

    return (
      <PieChartComponent
        data={pieChartData}
        title=""
      />
    );
  };

  /* =========================
     PROGRESS CARD
     ========================= */
  const renderManagementMessage = () => {
    if (!pieChartData.length || managementPercentage === 0) return null;

    const isGoalAchieved = managementPercentage >= 90;

    return (
      <TintedCard className="p-4">
        <div className="flex flex-col items-center text-center space-y-3">

          <div className="p-2 rounded-xl bg-amber-400/15 text-amber-600">
            <BarChart3 className="size-5" />
          </div>

          <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {managementPercentage >= 90
              ? "Meta Alcanzada"
              : "Progreso de Gestión"}
          </h3>

          <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Nivel de gestión de reportes en el período actual
          </p>
          <div className="w-full space-y-3">
            <div className="relative">
              <div className="relative w-full h-5 rounded-full bg-slate-200/70 overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${managementPercentage}%`,
                    background:
                      "linear-gradient(90deg, #14b8a6, #3b82f6)",
                    boxShadow: "0 0 18px rgba(59,130,246,0.25)",
                  }}
                />

                {/* FLOATING PERCENT */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 text-[15px] font-bold text-white whitespace-nowrap transition-all duration-700"
                  style={{
                    left: `clamp(24px, calc(${managementPercentage}% - 24px), calc(100% - 48px))`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {managementPercentage.toFixed(0)}%
                </div>
              </div>
              <div className="absolute inset-x-0 top-full mt-1 flex justify-between px-1">
                {[1, 2, 3, 4, 5].map((step, index) => {
                  const threshold = index * 25;
                  const active = managementPercentage >= threshold;

                  return (
                    <div key={step} className="flex flex-col items-center">
                      {/* TICK REFINADO */}
                      <div
                        className={`w-px h-2.5 rounded-full transition-all duration-300 ${
                          active
                            ? "bg-gradient-to-b from-amber-400 to-teal-400 opacity-90"
                            : "bg-slate-300/50"
                        }`}
                      />

                      {/* LABEL */}
                      <span
                        className={`mt-0.5 text-[10px] font-medium transition-colors duration-300 ${
                          active
                            ? "text-teal-600 dark:text-teal-400"
                            : "text-slate-400"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="h-6" />
          </div>

          <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {barChartData?.closed || 0} de {barChartData?.total || 0} reportes gestionados
          </p>
        </div>
      </TintedCard>
    );
  };

  /* =========================
     RENDER
     ========================= */
  return (
    <div className="space-y-6">

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* BAR CHART CARD */}
        <TintedCard className="p-4 flex flex-col items-center justify-center">
          
          <div className="flex flex-col items-center text-center mb-2">
            <div className="p-2 rounded-xl bg-amber-400/15 text-amber-600">
              <BarChart3 className="size-5" />
            </div>

            <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Reportes vs Gestionados
            </h3>

            <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Comparación de reportes identificados y cerrados
            </p>
          </div>

          <div className="w-full h-[220px] pb-8">
            {renderBarChart()}
          </div>

        </TintedCard>

        {/* PIE CHART CARD */}
        <TintedCard className="p-4 flex flex-col items-center justify-center">

          <div className="flex flex-col items-center text-center mb-2">
            <div className="p-2 rounded-xl bg-amber-400/15 text-amber-600">
              <PieChart className="size-5" />
            </div>

            <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Distribución de Estados
            </h3>

            <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Proporción de reportes en proceso vs gestionados
            </p>
          </div>

          <div className="w-full h-[220px]">
            {renderPieChart()}
          </div>

          {isErrorBarChart && (
            <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Error al cargar datos del gráfico.
            </p>
          )}

        </TintedCard>

      </div>

      {/* PROGRESS SECTION */}
      {renderManagementMessage()}

      {/* GLOBAL ERROR */}
      {isErrorBarChart && (
        <div className="mt-2">
          <Message
            title="Sin conexión de datos"
            description="No se pudieron sincronizar los indicadores en este momento."
          />
        </div>
      )}
    </div>
  );
}