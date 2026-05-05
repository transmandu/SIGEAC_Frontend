"use client";

import SimpleLineChart from "@/components/charts/SimpleLineChart";
import { Message } from "@/components/misc/Message";
import SimpleNotificationBell from "@/components/misc/SimpleNotificationBell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetNewReports } from "@/hooks/sms/useGetNewReports";
import { useGetReportsNumberByMonth } from "@/hooks/sms/useGetReportsByMonth";
import { useGetSMSTraining } from "@/hooks/sms/useGetSMSTraining";
import { useGetTotalReportsStatsByYear } from "@/hooks/sms/useGetTotalReportsStatsByYear";
import { dateFormat } from "@/lib/utils";
import { format, startOfYear } from "date-fns";
import {
  BarChart3,
  Loader2,
  ShieldCheck,
  Users,
  BellRing,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
      className={`relative overflow-hidden rounded-3xl border bg-background/75 backdrop-blur-xl shadow-sm ${className}`}
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

/* =========================
   RADIAL HOVER HOOK
   ========================= */
function useRadialHover() {
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return { hovered, setHovered, pos, onMove };
}

export default function DashboardSummary({ companySlug }: DashboardSummaryProps) {
  const router = useRouter();
  const amberTone = "245,158,11";

  const reportBtn = useRadialHover();

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
    data: newReports,
    isLoading: isLoadingNewReports,
    isError: isErrorNewReports,
  } = useGetNewReports(companySlug);

  const {
    data: reportsNumberByMonth,
    isLoading: isLoadingReportsNumberByMonth,
    isError: isErrorReportsNumberByMonth,
  } = useGetReportsNumberByMonth(
    companySlug,
    format(startOfYear(new Date()), "yyyy-MM-dd"),
    format(new Date(), "yyyy-MM-dd")
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
        <TintedCard tone={amberTone} className="p-2 h-[360px] flex flex-col">
          <CardHeader className="text-center space-y-1 py-2">
            <div className="flex justify-center">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>

            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Reportes de Seguridad Operacional
            </CardTitle>

            <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Evolución mensual de reportes de seguridad operacional durante el año en curso.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 pb-3 flex-1">
            {isLoadingReportsNumberByMonth ? (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin" />
              </div>
            ) : isErrorReportsNumberByMonth ? (
              <Message title="Error" description="No se pudieron cargar datos" />
            ) : (
              reportsNumberByMonth && (
                <SimpleLineChart
                  data={reportsNumberByMonth}
                  height={200}
                  title=""
                  lineColor="#14b8a6"
                  strokeWidth={2}
                  lineName="Reportes"
                />
              )
            )}
          </CardContent>
        </TintedCard>

        {/* TRAINING */}
        <TintedCard tone={amberTone} className="p-3 h-[360px] flex flex-col">
          <CardHeader className="text-center space-y-1 py-2">
            <div className="flex justify-center">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Capacitación del Personal
            </CardTitle>

            <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Estado de certificaciones, vencimientos y cumplimiento del personal activo.
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
                      {t.employee.first_name} {t.employee.last_name}
                    </div>

                    {/* STATUS */}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Status:</span>

                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                          t.status === "VALIDO"
                            ? "bg-green-100 text-green-700"
                            : t.status === "POR_VENCER"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {t.status}
                      </span>
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
                        {dateFormat(t.expiration, "dd/MM/yyyy")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </TintedCard>
      </div>

      {/* ================= ACTION + REPORTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* BUTTON CARD */}
        <TintedCard tone={amberTone} className="p-6 flex flex-col lg:col-span-4 h-full">
          <CardHeader className="text-center space-y-2 py-5 flex flex-col justify-start">
            
            <div className="flex justify-center mb-1">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Reportes SMS
            </CardTitle>

            <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Acceso directo a la revisión y gestión de reportes SMS.
            </CardDescription>

          </CardHeader>

          <CardContent className="flex justify-center pt-2 pb-1">
            <Button
              onMouseEnter={() => reportBtn.setHovered(true)}
              onMouseLeave={() => reportBtn.setHovered(false)}
              onMouseMove={reportBtn.onMove}
              onClick={() => router.push(`/${companySlug}/sms/reportes`)}
              className="relative overflow-hidden px-6 min-w-[180px] border border-dashed border-amber-400/50 bg-background/70 backdrop-blur text-amber-700 font-medium tracking-wide shadow-sm transition-all duration-200 hover:border-amber-500/60 hover:bg-amber-50/40 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500/25 hover:text-slate-900 dark:hover:text-white"
              style={{
                backgroundImage: reportBtn.hovered
                  ? `radial-gradient(circle at ${reportBtn.pos.x}% ${reportBtn.pos.y}%, rgba(245,158,11,0.12), transparent 65%)`
                  : "none",
              }}
            >
              Ver Reportes
            </Button>
          </CardContent>
        </TintedCard>

        <TintedCard tone={amberTone} className="p-3 lg:col-span-8 relative">

          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="scale-90 opacity-80 hover:opacity-100 transition">
              <SimpleNotificationBell
                count={
                  (newReports?.voluntary?.length ?? 0) +
                  (newReports?.obligatory?.length ?? 0)
                }
              />
            </div>
          </div>

          <CardHeader className="text-center space-y-2 py-3 min-h-[92px] flex flex-col justify-start">

            <div className="flex justify-center">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <BellRing className="h-5 w-5" />
              </div>
            </div>

            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Nuevos Reportes
            </CardTitle>

            <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Últimos reportes registrados en el sistema (voluntarios y obligatorios).
            </CardDescription>

          </CardHeader>

          <CardContent className="space-y-3 max-h-[340px] overflow-auto">

            {/* ================= EMPTY STATE ================= */}
            {!newReports?.voluntary?.length && !newReports?.obligatory?.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">

                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No hay reportes nuevos
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[260px]">
                  Cuando se registren nuevos reportes voluntarios u obligatorios aparecerán aquí.
                </p>

              </div>
            ) : (
              <>
                {/* VOLUNTARIOS */}
                {newReports?.voluntary?.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border bg-background/60 p-3 text-sm space-y-1"
                  >
                    <div>Fecha: {dateFormat(r.report_date, "yyyy-MM-dd")}</div>
                    <div>Lugar: {r.danger_location}</div>

                    <Badge className="bg-green-500">Voluntario</Badge>

                    <Link href={`/${companySlug}/sms/reportes/reportes_voluntarios/${r.id}`}>
                      <Button variant="outline" className="w-full mt-2">
                        Ver detalles
                      </Button>
                    </Link>
                  </div>
                ))}

                {/* OBLIGATORIOS */}
                {newReports?.obligatory?.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border bg-background/60 p-3 text-sm space-y-1"
                  >
                    <div>Fecha: {dateFormat(r.report_date, "yyyy-MM-dd")}</div>
                    <div>Aeronave: {r.aircraft.acronym}</div>

                    <Badge className="bg-red-500">Obligatorio</Badge>

                    <Link href={`/${companySlug}/sms/reportes/reportes_obligatorios/${r.id}`}>
                      <Button variant="outline" className="w-full mt-2">
                        Ver detalles
                      </Button>
                    </Link>
                  </div>
                ))}
              </>
            )}

          </CardContent>
        </TintedCard>

      </div>
    </div>
  );
}