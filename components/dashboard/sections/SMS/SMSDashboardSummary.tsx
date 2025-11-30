"use client";

import { BarChart3, Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import MultipleBarChartComponent from "@/components/charts/MultipleBarChartComponent";
import { useGetTotalReportsStatsByYear } from "@/hooks/sms/useGetTotalReportsStatsByYear";
import { format, startOfYear } from "date-fns";
import BarChartComponent from "@/components/charts/BarChartComponent";
import { Message } from "@/components/misc/Message";
import MonthlyReportsChart from "@/components/charts/SimpleLineChart";
import SimpleLineChart from "@/components/charts/SimpleLineChart";
import { useGetNewReports } from "@/hooks/sms/useGetNewReports";
import { dateFormat } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useGetReportsNumberByMonth } from "@/hooks/sms/useGetReportsByMonth";
import { useGetSMSTraining } from "@/hooks/sms/useGetSMSTraining";

interface DashboardSummaryProps {
  companySlug: string;
}

export default function DashboardSummary({
  companySlug,
}: DashboardSummaryProps) {
  const router = useRouter();

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
    <div className="">
      {/* Mensaje de bienvenida */}
      <div className="flex flex-col text-center mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLoadingBarChart ? (
            <div className="flex justify-center items-center">
              <Loader2 className="animate-spin" />
            </div>
          ) : isErrorBarChart ? (
            <Message
              title="Error al cargar datos"
              description="No se pudieron cargar los datos. Por favor, inténtelo de nuevo."
            />
          ) : (
            <div>
              {barChartData && (
                <>
                  <div className="flex flex-col m-0 p-0 border border-gray-400 rounded-lg p-2">
                    {isLoadingReportsNumberByMonth ? (
                      <Loader2 className="animate-spin" />
                    ) : isErrorReportsNumberByMonth ? (
                      <Message
                        title="Error al cargar datos"
                        description="No se pudieron cargar los datos. Por favor, inténtelo de nuevo."
                      />
                    ) : (
                      reportsNumberByMonth && (
                        <>
                          <SimpleLineChart
                            data={reportsNumberByMonth}
                            height={300} // puedo quitar esto
                            title={`Reportes de Seguridad Operacional del año en curso ${format(startOfYear(new Date()), "yyyy")}`}
                            lineColor="#82ca9d"
                            strokeWidth={1.5}
                            lineName="Reportes"
                          />
                        </>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          <div className="border border-gray-400 rounded-lg p-4 h-full overflow-auto max-h-[360px]">
            <h2 className="text-sm sm:text-lg font-bold text-center">
              Capacitacion del personal
            </h2>
            {isLoadingEmployeeTraining ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin h-6 w-6" />
              </div>
            ) : isErrorEmployeeTraining ? (
              <Message
                title="Error al cargar capacitaciones"
                description="No se pudieron cargar los datos de capacitación. Por favor, inténtelo de nuevo."
              />
            ) : (
              <div className="space-y-4">
                {employeeTraining?.map((training, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Información del Empleado */}
                      <div>
                        <p className="font-semibold text-sm">Empleado:</p>
                        <p className="text-sm">
                          {training.employee.first_name}{" "}
                          {training.employee.last_name}
                        </p>
                      </div>

                      {/* Estado */}
                      <div>
                        <p className="font-semibold text-sm">Estado:</p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            training.status === "VALIDO"
                              ? "bg-green-100 text-green-800"
                              : training.status === "POR_VENCER"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {training.status}
                        </span>
                      </div>

                      {/* Fecha de curso inicial */}
                      <div>
                        <p className="font-semibold text-sm">Curso Inicial:</p>
                        {training.course?.end_date ? (
                          <p className="text-sm">
                            {dateFormat(
                              training.course?.end_date,
                              "dd/MM/yyyy"
                            )}
                          </p>
                        ) : (
                          <p className="text-sm">N/A</p>
                        )}
                      </div>
                      {/* Fecha de Expiración */}
                      <div>
                        <p className="font-semibold text-sm">Vence:</p>
                        <p className="text-sm">
                          {dateFormat(training.expiration, "dd/MM/yyyy") ??
                            "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Mensaje cuando no hay capacitaciones */}
                {!employeeTraining?.length && (
                  <div className="text-center py-8 text-gray-500">
                    No hay datos de capacitación disponibles
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reportes mas recientes y lista de reportes */}
      <div className="flex flex-col sm:flex-col md:flex-col lg:flex-col xl:flex-row justify-start gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 border-blue-200">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3 justify-center">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">
                Reportes de Seguridad Operacional
              </CardTitle>
            </div>
            <CardDescription className="text-base pt-2">
              Acceda a los reportes de seguridad operacional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push(`/${companySlug}/sms/reportes`)}
            >
              Ver Reportes
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-400 rounded-lg p-2 w-full overflow-auto">
          <CardContent>
            <CardTitle className="text-xl">Nuevos Reportes</CardTitle>
            <CardDescription className="text-sm sm:text-base pt-2">
              Acceda a los reportes de seguridad operacional mas recientes
            </CardDescription>

            {/* Estados de loading y error para nuevos reportes */}
            {isLoadingNewReports ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin h-8 w-8" />
              </div>
            ) : isErrorNewReports ? (
              <Message
                title="Error al cargar reportes"
                description="No se pudieron cargar los nuevos reportes. Por favor, inténtelo de nuevo."
              />
            ) : (
              <>
                {newReports?.voluntary?.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 border rounded flex flex-col sm:flex-col lg:flex-row gap-2 w-full items-center justify-between mb-2"
                  >
                    <p>Fecha: {dateFormat(report.report_date, "yyyy-MM-dd")}</p>
                    <p>Lugar: {report.danger_location}</p>
                    <p>Area: {report.danger_area}</p>
                    <Badge className="bg-green-500">Voluntario</Badge>
                    <Button className="" variant="outline">
                      <Link
                        href={`/${companySlug}/sms/reportes/reportes_voluntarios/${report.id}`}
                      >
                        Ver detalles
                      </Link>
                    </Button>
                  </div>
                ))}

                {newReports?.obligatory?.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 border rounded flex gap-2 w-full items-center justify-between"
                  >
                    <p>Fecha: {dateFormat(report.report_date, "yyyy-MM-dd")}</p>
                    <p>Aeronave: {report.aircraft.acronym}</p>
                    <p>Lugar de Incidente: {report.incident_location}</p>
                    <Badge className="bg-red-500">Obligatorio</Badge>
                    <Button className="" variant="outline">
                      <Link
                        href={`/${companySlug}/sms/reportes/reportes_obligatorios/${report.id}`}
                      >
                        Ver detalles
                      </Link>
                    </Button>
                  </div>
                ))}

                {/* Mensaje cuando no hay reportes */}
                {!newReports?.voluntary?.length &&
                  !newReports?.obligatory?.length && (
                    <div className="text-center py-8 text-gray-500">
                      No hay nuevos reportes para mostrar
                    </div>
                  )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
