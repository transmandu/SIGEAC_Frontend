"use client";

import BarChartComponent from "@/components/charts/BarChartComponent";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { Message } from "@/components/misc/Message";
import { useGetCourseStats } from "@/hooks/curso/useGetCourseStats";
import { useGetTotalReportsStatsByYear } from "@/hooks/sms/useGetTotalReportsStatsByYear";
import { format, startOfYear } from "date-fns";
import { Loader2, GraduationCap, BarChart3, ShieldCheck } from "lucide-react";

interface SMSStatisticsProps {
  companySlug: string;
  location?: string;
}

/* =========================
   TINTED CARD (ORANGE SYSTEM)
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
        borderColor: "rgba(249,115,22,0.14)",
        backgroundImage: `
          linear-gradient(
            to bottom right,
            rgba(249,115,22,0.035),
            transparent 70%
          )
        `,
      }}
    >
      {children}
    </div>
  );
}

/* =========================
   HEADER BLOCK
   ========================= */
function CardHeaderBlock({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center mb-3 space-y-1 flex flex-col items-center min-h-[110px]">
      <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
        {icon}
      </div>

      <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {title}
      </h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
        {description}
      </p>
    </div>
  );
}

export default function SMSStatistics({
  companySlug,
  location,
}: SMSStatisticsProps) {
  const {
    data: barChartData,
    isLoading: isLoadingBarChart,
    isError: isErrorBarChart,
  } = useGetTotalReportsStatsByYear(
    format(startOfYear(new Date()), "yyyy-MM-dd"),
    format(new Date(), "yyyy-MM-dd"),
    companySlug
  );

  const {
    data: courseBarChartData,
    isLoading: isLoadingCourseBarChart,
    isError: isErrorCourseBarChart,
  } = useGetCourseStats(
    format(startOfYear(new Date()), "yyyy-MM-dd"),
    format(new Date(), "yyyy-MM-dd"),
    location!,
    companySlug
  );

  const coursePieChartData =
    !courseBarChartData?.open && !courseBarChartData?.closed
      ? []
      : [
          { name: "Pendientes", value: courseBarChartData?.open ?? 0 },
          { name: "Ejecutados", value: courseBarChartData?.closed ?? 0 },
        ];

  return (
    <div className="space-y-5">

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* PIE */}
        <TintedCard className="p-4 flex flex-col">

          <CardHeaderBlock
            icon={<GraduationCap className="h-5 w-5" />}
            title="Planificación de Cursos"
            description="Relación entre cursos planificados y ejecutados"
          />

          <div className="h-[180px] flex items-center justify-center">
            {isLoadingCourseBarChart ? (
              <Loader2 className="animate-spin" />
            ) : coursePieChartData.length > 0 ? (
              <PieChartComponent data={coursePieChartData} title="" />
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay datos para mostrar.
              </p>
            )}
          </div>
        </TintedCard>

        {/* BAR COURSES */}
        <TintedCard className="p-4 flex flex-col">

          <CardHeaderBlock
            icon={<BarChart3 className="h-5 w-5" />}
            title="Ejecución de Cursos"
            description="Comparativa de cursos planificados vs ejecutados"
          />

          <div className="h-[200px]">
            {isLoadingCourseBarChart ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin" />
              </div>
            ) : isErrorCourseBarChart ? (
              <Message
                title="Error al cargar datos"
                description="No se pudieron cargar los datos. Por favor, inténtelo de nuevo."
              />
            ) : (
              courseBarChartData && (
                <BarChartComponent
                  data={courseBarChartData}
                  bar_first_name="Planificados"
                  bar_second_name="Ejecutados"
                  title=""
                />
              )
            )}
          </div>
        </TintedCard>
      </div>

      {/* REPORTES */}
      <TintedCard className="p-4 flex flex-col">

        <CardHeaderBlock
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Reportes de Seguridad Operacional"
          description="Evolución de reportes gestionados durante el año"
        />

        <div className="h-[200px]">
          {isLoadingBarChart ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin" />
            </div>
          ) : isErrorBarChart ? (
            <Message
              title="Error al cargar datos"
              description="No se pudieron cargar los datos. Por favor, inténtelo de nuevo."
            />
          ) : (
            barChartData && (
              <BarChartComponent
                data={barChartData}
                bar_first_name="Reportes"
                bar_second_name="Gestionados"
                title=""
              />
            )
          )}
        </div>
      </TintedCard>

      {/* ERROR */}
      {isErrorBarChart && (
        <Message
          title="Error general"
          description="No se pudieron sincronizar los indicadores del sistema."
        />
      )}
    </div>
  );
}