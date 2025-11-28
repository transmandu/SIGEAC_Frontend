"use client";
import BarChartComponent from "@/components/charts/BarChartComponent";
import BarChartCourseComponent from "@/components/charts/BarChartCourseComponent";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { ContentLayout } from "@/components/layout/ContentLayout";
import DataFilter from "@/components/misc/DataFilter";
import { Label } from "@/components/ui/label";
import { useGetCourseStats } from "@/hooks/curso/useGetCourseStats";
import { useCompanyStore } from "@/stores/CompanyStore";
import { format, startOfMonth } from "date-fns";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const CourseStatsPage = () => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  interface Params {
    from?: string;
    to?: string;
    [key: string]: string | undefined;
  }

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

  // Manejar cambio de fechas desde DataFilter
  const handleDateChange = (
    dateRange: { from: Date; to: Date } | undefined
  ) => {
    if (!dateRange?.from || !dateRange?.to) return;

    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("from", format(dateRange.from, "yyyy-MM-dd"));
    newParams.set("to", format(dateRange.to, "yyyy-MM-dd"));

    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  // Manejar reset de fechas
  const handleReset = () => {
    const defaultFrom = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const defaultTo = format(new Date(), "yyyy-MM-dd");

    const newParams = new URLSearchParams();
    newParams.set("from", defaultFrom);
    newParams.set("to", defaultTo);

    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  // Hook calls for data fetching
  const {
    data: barChartData,
    isLoading: isLoadingBarChart,
    isError: isErrorBarChart,
    refetch: refetchBarChart,
  } = useGetCourseStats(
    params.from || format(startOfMonth(new Date()), "yyyy-MM-dd"),
    params.to || format(new Date(), "yyyy-MM-dd"),
    selectedStation ?? null,
    selectedCompany?.slug
  );

  const pieChartData =
    !barChartData?.open && !barChartData?.closed
      ? []
      : [
          {
            name: "Pendientes",
            value: barChartData?.open ?? 0,
          },
          {
            name: "Ejecutados",
            value: barChartData?.closed ?? 0,
          },
        ];

  useEffect(() => {
    refetchBarChart();
  }, [params.from, params.to, refetchBarChart]);

  return (
    <ContentLayout title="Gráficos Estadísticos de Cursos">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-center items-center">
          <div className="flex flex-col w-full max-w-md">
            <Label className="text-lg font-semibold mb-2">
              Seleccionar Rango de Fechas:
            </Label>
            {/* ✅ DataFilter conectado con las funciones de manejo */}
            <DataFilter
              onDateChange={handleDateChange}
              onReset={handleReset}
              initialDate={{
                from:
                  params.from || format(startOfMonth(new Date()), "yyyy-MM-dd"),
                to: params.to || format(new Date(), "yyyy-MM-dd"),
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
        <div className="flex flex-col justify-center items-center p-4 rounded-lg shadow border">
          {isLoadingBarChart ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="size-24 animate-spin" />
            </div>
          ) : barChartData ? (
            <>
              <h2 className="text-sm font-semibold mb-2">
                Planificados vs Ejecutados
              </h2>
              <BarChartComponent
                data={barChartData}
                title="Planificados vs Ejecutados"
                bar_first_name="Planificados"
                bar_second_name="Ejecutados"
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Ha ocurrido un error al cargar los datos de los cursos...
            </p>
          )}
        </div>

        <div className="flex flex-col justify-center items-center p-4 rounded-lg shadow border">
          {isLoadingBarChart ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="size-24 animate-spin" />
            </div>
          ) : pieChartData && pieChartData.length > 0 ? (
            <PieChartComponent
              data={pieChartData}
              title="Porcentaje cursos planificados y ejecutados"
            />
          ) : (
            <p className="text-lg text-muted-foreground">
              No hay datos para mostrar.
            </p>
          )}
        </div>
      </div>
    </ContentLayout>
  );
};

export default CourseStatsPage;
