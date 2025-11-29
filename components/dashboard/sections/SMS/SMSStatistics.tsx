"use client";

import BarChartComponent from "@/components/charts/BarChartComponent";
import { Message } from "@/components/misc/Message";
import { useGetTotalReportsStatsByYear } from "@/hooks/sms/useGetTotalReportsStatsByYear";
import { format, startOfYear } from "date-fns";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface SMSStatisticsProps {
  companySlug: string;
}

export default function SMSStatistics({ companySlug }: SMSStatisticsProps) {
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

  return (
    <div className="">
      {/* Mensaje de bienvenida */}
      <div className="text-center mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2">
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
                    <Message
                      title={`Reportes de Seguridad Operacional durante año en curso ${format(startOfYear(new Date()), "yyyy")}`}
                      description=""
                    />
                    <BarChartComponent
                      data={barChartData}
                      bar_first_name="Reportes"
                      bar_second_name="Gestionados"
                      title="Reportes de Seguridad Operacional"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
