"use client";

import BarChartComponent from "@/components/charts/BarChartComponent";
import MultipleBarChartComponent from "@/components/charts/MultipleBarChartComponent";
import SimpleLineChart from "@/components/charts/SimpleLineChart";
import { Message } from "@/components/misc/Message";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetReportsNumberByMonth } from "@/hooks/sms/useGetReportsByMonth";
import { useGetSMSTraining } from "@/hooks/sms/useGetSMSTraining";
import { useGetTotalReportsStatsByYear } from "@/hooks/sms/useGetTotalReportsStatsByYear";
import { dateFormat } from "@/lib/utils";
import { format, startOfYear } from "date-fns";
import { BarChart3, Loader2, Users } from "lucide-react";
import { TrainingStatusBadge } from "@/components/sms/TrainingStatusBadge";

interface DashboardSummaryProps {
  companySlug: string;
}

/* =========================
   TINTED CARD SYSTEM
   ========================= */
function TintedCard({
  children,
  tone,
  className = "",
}: {
  children: React.ReactNode;
  tone: string;
  className?: string;
}) {
  return (
    <Card
      className={`relative overflow-hidden rounded-3xl border bg-background/75 backdrop-blur-xl shadow-xs ${className}`}
      style={{
        borderColor: `rgba(${tone}, 0.14)`,
        backgroundImage: `
          linear-gradient(
            to bottom right,
            rgba(${tone}, 0.035),
            transparent 68%
          )
        `,
      }}
    >
      {children}
    </Card>
  );
}

export default function DashboardSummary({
  companySlug,
}: DashboardSummaryProps) {
  const blueTone = "37,99,235";

  // Por defecto: año en curso (igual que el resto de estadísticas del dashboard)
  const from = format(startOfYear(new Date()), "yyyy-MM-dd");
  const to = format(new Date(), "yyyy-MM-dd");

  const {
    data: reportsNumberByMonth,
    isLoading: isLoadingReportsNumberByMonth,
    isError: isErrorReportsNumberByMonth,
  } = useGetReportsNumberByMonth(companySlug, from, to);

  // Reportes abiertos vs cerrados del año en curso
  const {
    data: barChartData,
    isLoading: isLoadingBarChart,
    isError: isErrorBarChart,
  } = useGetTotalReportsStatsByYear(from, to, companySlug);

  const totalReports = reportsNumberByMonth?.reduce(
    (acc, item) => acc + Number(item.value ?? 0),
    0,
  );

  const {
    data: employeeTraining,
    isLoading: isLoadingEmployeeTraining,
    isError: isErrorEmployeeTraining,
  } = useGetSMSTraining(companySlug);

  return (
    <div className="space-y-10">
      {/* ================= TOP GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LINE CHART */}
        <TintedCard tone={blueTone} className="p-2 h-90 flex flex-col">
          <CardHeader className="text-center space-y-1 py-2">
            <div className="flex justify-center">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>

            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Reportes de Seguridad Operacional
            </CardTitle>

            <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Evolución mensual de reportes de seguridad operacional durante el
              año en curso.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 pb-3 flex-1">
            {isLoadingReportsNumberByMonth ? (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin" />
              </div>
            ) : isErrorReportsNumberByMonth ? (
              <Message
                title="Error"
                description="No se pudieron cargar datos"
              />
            ) : (
              reportsNumberByMonth && (
                <SimpleLineChart
                  data={reportsNumberByMonth}
                  height={200}
                  title=""
                  lineColor="#0891b2"
                  strokeWidth={2}
                  lineName="Reportes"
                />
              )
            )}
          </CardContent>
        </TintedCard>

        {/* TRAINING */}
        <TintedCard tone={blueTone} className="p-3 h-90 flex flex-col">
          <CardHeader className="text-center space-y-1 py-2">
            <div className="flex justify-center">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Capacitación del Personal
            </CardTitle>

            <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Estado de certificaciones, vencimientos y cumplimiento del
              personal activo.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 overflow-auto pr-1">
            {isLoadingEmployeeTraining ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : isErrorEmployeeTraining ? (
              <Message title="Error" description="No se pudo cargar" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {employeeTraining?.map((t, i) => (
                  <div
                    key={i}
                    className="rounded-xl border bg-background/60 p-3 text-xs space-y-2 hover:bg-background/80 transition"
                  >
                    {/* EMPLEADO */}
                    <div className="font-medium text-sm leading-tight">
                      {t.employee?.first_name ?? ""}{" "}
                      {t.employee?.last_name ?? ""}
                    </div>

                    {/* STATUS */}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Status:</span>

                      <TrainingStatusBadge status={t.status} />
                    </div>

                    {/* CURSO */}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Curso Inicial:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {t.course?.end_date
                          ? dateFormat(t.course.end_date, "dd/MM/yyyy")
                          : "N/A"}
                      </span>
                    </div>

                    {/* VENCE */}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vence:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {t.expiration
                          ? dateFormat(t.expiration, "dd/MM/yyyy")
                          : (() => {
                              const last = t.history
                                ?.filter(
                                  (h) =>
                                    h.event_type === "EXPIRED" && h.expiration,
                                )
                                .sort(
                                  (a, b) =>
                                    new Date(b.created_at ?? 0).getTime() -
                                    new Date(a.created_at ?? 0).getTime(),
                                )[0];
                              return last?.expiration
                                ? dateFormat(last.expiration, "dd/MM/yyyy")
                                : "N/A";
                            })()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </TintedCard>
      </div>

      {/* ================= REPORTS SUMMARY ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TOTAL REPORTS */}
        <TintedCard tone={blueTone} className="p-3 relative">
          <CardHeader className="text-center space-y-2 py-3 flex flex-col justify-start">
            <div className="flex justify-center">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>

            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Total de Reportes
            </CardTitle>

            <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Número total de reportes registrados durante el año en curso.
            </CardDescription>

            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {isLoadingReportsNumberByMonth ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                (totalReports ?? 0).toLocaleString("es-ES")
              )}
            </p>
          </CardHeader>

          <CardContent className="flex justify-center pb-4">
            {isLoadingReportsNumberByMonth ? (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin" />
              </div>
            ) : isErrorReportsNumberByMonth ? (
              <Message
                title="Error"
                description="No se pudieron cargar los datos"
              />
            ) : reportsNumberByMonth && reportsNumberByMonth.length > 0 ? (
              <MultipleBarChartComponent
                data={reportsNumberByMonth}
                title=""
                height={280}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay datos para mostrar.
              </p>
            )}
          </CardContent>
        </TintedCard>

        {/* OPEN VS CLOSED */}
        <TintedCard tone={blueTone} className="p-3 relative">
          <CardHeader className="text-center space-y-2 py-3 flex flex-col justify-start">
            <div className="flex justify-center">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>

            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Reportes Abiertos vs Cerrados
            </CardTitle>

            <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Comparativa de reportes abiertos y cerrados registrados durante el
              año en curso.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex justify-center pb-4">
            {isLoadingBarChart ? (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin" />
              </div>
            ) : isErrorBarChart ? (
              <Message
                title="Error"
                description="No se pudieron cargar los datos"
              />
            ) : barChartData ? (
              <BarChartComponent
                data={barChartData}
                title=""
                bar_first_name="Abiertos"
                bar_second_name="Cerrados"
                showValueLabels
                height={300}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay datos para mostrar.
              </p>
            )}
          </CardContent>
        </TintedCard>
      </div>
    </div>
  );
}
