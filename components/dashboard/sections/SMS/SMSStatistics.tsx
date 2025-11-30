"use client";

import BarChartComponent from "@/components/charts/BarChartComponent";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { Message } from "@/components/misc/Message";
import { useGetCourseStats } from "@/hooks/curso/useGetCourseStats";
import { useGetTotalReportsStatsByYear } from "@/hooks/sms/useGetTotalReportsStatsByYear";
import { format, startOfYear } from "date-fns";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface SMSStatisticsProps {
  companySlug: string;
  location?: string;
}

export default function SMSStatistics({
  companySlug,
  location,
}: SMSStatisticsProps) {
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
    data: courseBarChartData,
    isLoading: isLoadingCourseBarChart,
    isError: isErrorCourseBarChart,
  } = useGetCourseStats(
    format(startOfYear(new Date()), "yyyy-MM-dd"),
    format(new Date(), "yyyy-MM-dd"),
    location!,
    companySlug
  );
  // FOMART DATA FROM BARTCHART AS PIECHART
  const coursePieChartData =
    !courseBarChartData?.open && !courseBarChartData?.closed
      ? []
      : [
          {
            name: "Pendientes",
            value: courseBarChartData?.open ?? 0,
          },
          {
            name: "Ejecutados",
            value: courseBarChartData?.closed ?? 0,
          },
        ];

  return (
    <div className="">
      {/* Mensaje de bienvenida */}
      <div className="flex flex-col mb-12 gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
          {isLoadingCourseBarChart ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="size-24 animate-spin" />
            </div>
          ) : coursePieChartData && coursePieChartData.length > 0 ? (
            <div className="flex flex-col items-center justify-center border border-gray-400 rounded-lg">
              <PieChartComponent
                data={coursePieChartData}
                title="Porcentaje cursos planificados y ejecutados"
              />
            </div>
          ) : (
            <p className="text-lg text-muted-foreground">
              No hay datos para mostrar.
            </p>
          )}

          {isLoadingCourseBarChart ? (
            <div className="flex justify-center">
              <Loader2 className="animate-spin" />
            </div>
          ) : isErrorCourseBarChart ? (
            <Message
              title="Error al cargar datos"
              description="No se pudieron cargar los datos. Por favor, inténtelo de nuevo."
            />
          ) : (
            <div>
              {courseBarChartData && (
                <>
                  <div className="flex flex-col m-0 p-0 border border-gray-400 rounded-lg">
                    <BarChartComponent
                      data={courseBarChartData}
                      bar_first_name="Planificados"
                      bar_second_name="Ejecutados"
                      title={`Cursos durante el ${format(startOfYear(new Date()), "yyyy")}`}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {isLoadingBarChart ? (
          <div className="flex justify-center">
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
                <div className="flex flex-col m-0 p-0 border border-gray-400 rounded-lg">
                  <BarChartComponent
                    data={barChartData}
                    bar_first_name="Reportes"
                    bar_second_name="Gestionados"
                    title={`Reportes de Seguridad Operacional durante el ${format(startOfYear(new Date()), "yyyy")}`} 
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
