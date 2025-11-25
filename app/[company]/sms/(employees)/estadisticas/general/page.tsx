"use client";
import BarChartComponent from "@/components/charts/BarChartComponent";
import { ContentLayout } from "@/components/layout/ContentLayout";
import DataFilter from "@/components/misc/DataFilter";
import { Label } from "@/components/ui/label";
import { useGetTotalReportsCountedByArea } from "@/hooks/sms/useGetTotalReportsCountedByArea";
import { useGetTotalDangerIdentificationsCountedByType } from "@/hooks/sms/useGetTotalDangerIdentificationsCountedByType";
import { useGetTotalIdentificationStatsBySourceType } from "@/hooks/sms/useGetTotalIdentificationStatsBySoruceType";
import { useGetTotalReportsStatsByYear } from "@/hooks/sms/useGetTotalReportsStatsByYear";
import { useGetTotalRiskCountByDateRange } from "@/hooks/sms/useGetTotalRiskByDateRange";
import { format, startOfMonth } from "date-fns";
import { Loader2, Check, ChevronsUpDown, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useGetTotalIdentificationStatsBySourceName } from "@/hooks/sms/useGetTotalIdentificationStatsBySoruceName";
import { useGetTotalPostRiskCountByDateRange } from "@/hooks/sms/useGetTotalPostRiskByDateRange";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import DynamicBarChart from "@/components/charts/DynamicBarChart";
import { useCompanyStore } from "@/stores/CompanyStore";
import MultipleBarChartComponent from "@/components/charts/MultipleBarChartComponent";
import { PieChartComponent } from "@/components/charts/PieChartComponent";

const GeneralReportStats = () => {
  const { selectedCompany } = useCompanyStore();
  const [selectedGraphics, setSelectedGraphics] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const graphicsOptions = [
    { id: "bar-chart", label: "Identificados vs Gestionados" },
    { id: "type-chart", label: "Según su Tipo" },
    { id: "area-chart", label: "Identificados por Área" },
    { id: "pre-risk-pie", label: "Por Índice de Riesgo Pre-Mitigación" },
    { id: "pre-risk-bar", label: "Número de Reportes por Índice de Riesgo" },
    { id: "post-risk-pie", label: "Por Índice de Riesgo Post-Mitigación" },
    { id: "post-risk-bar", label: "Reportes por Índice de Riesgo (Post)" },
    { id: "source-type", label: "Por Tipo de Fuente" },
    { id: "source-name", label: "Por Nombre de Fuente" },
  ];

  interface Params {
    from?: string;
    to?: string;
    [key: string]: string | undefined;
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

  // Hook calls for data fetching
  const {
    data: barChartData,
    isLoading: isLoadingBarChart,
    isError: isErrorBarChart,
    refetch: refetchBarChart,
  } = useGetTotalReportsStatsByYear(
    params.from || format(startOfMonth(new Date()), "yyyy-MM-dd"),
    params.to || format(new Date(), "yyyy-MM-dd"),
    selectedCompany?.slug
  );

  const {
    data: totalIdentificationData,
    isLoading: isLoadingIdentificationData,
    isError: isErrorIdentificationData,
    refetch: refetchIdentificationData,
  } = useGetTotalDangerIdentificationsCountedByType(
    params.from || format(startOfMonth(new Date()), "yyyy-MM-dd"),
    params.to || format(new Date(), "yyyy-MM-dd"),
    selectedCompany?.slug
  );

  const {
    data: reportsByAreaData,
    isLoading: isLoadingReportsByAreaData,
    isError: isErrorReportsByAreaData,
    refetch: refetchReportsByAreaData,
  } = useGetTotalReportsCountedByArea(
    params.from || format(startOfMonth(new Date()), "yyyy-MM-dd"),
    params.to || format(new Date(), "yyyy-MM-dd"),
    selectedCompany?.slug
  );

  const {
    data: totalRiskData,
    isLoading: isLoadingTotalRiskData,
    isError: isErrorTotalRiskData,
    refetch: refetchTotalRiskData,
  } = useGetTotalRiskCountByDateRange(
    params.from || format(startOfMonth(new Date()), "yyyy-MM-dd"),
    params.to || format(new Date(), "yyyy-MM-dd"),
    selectedCompany?.slug
  );

  const {
    data: reportSourceTypeData,
    isLoading: isLoadingReportSourceTypeData,
    isError: isErrorReportSourceTypeData,
    refetch: refetchReportSourceTypeChart,
  } = useGetTotalIdentificationStatsBySourceType(
    params.from || format(startOfMonth(new Date()), "yyyy-MM-dd"),
    params.to || format(new Date(), "yyyy-MM-dd"),
    selectedCompany?.slug
  );
  console.log('AHHAHAHAHAHAHA',reportSourceTypeData);
  const {
    data: reportSourceNameData,
    isLoading: isLoadingReportSourceNameData,
    isError: isErrorReportSourceNameData,
    refetch: refetchReportSourceNameChart,
  } = useGetTotalIdentificationStatsBySourceName(
    params.from || format(startOfMonth(new Date()), "yyyy-MM-dd"),
    params.to || format(new Date(), "yyyy-MM-dd"),
    selectedCompany?.slug
  );

  const {
    data: totalPostRiskData,
    isLoading: isLoadingTotalPostRiskData,
    isError: isErrorTotalPostRiskData,
    refetch: refetchTotalPostRiskData,
  } = useGetTotalPostRiskCountByDateRange(
    params.from || format(startOfMonth(new Date()), "yyyy-MM-dd"),
    params.to || format(new Date(), "yyyy-MM-dd"),
    selectedCompany?.slug
  );

  useEffect(() => {
    refetchBarChart();
    refetchIdentificationData();
    refetchReportsByAreaData();
    refetchTotalRiskData();
    refetchReportSourceTypeChart();
    refetchReportSourceNameChart();
    refetchTotalPostRiskData();
  }, [
    params.from,
    params.to,
    refetchBarChart,
    refetchIdentificationData,
    refetchReportsByAreaData,
    refetchTotalRiskData,
    refetchReportSourceTypeChart,
    refetchReportSourceNameChart,
    refetchTotalPostRiskData,
  ]);

  const handleSelectChange = (id: string) => {
    setSelectedGraphics((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const removeGraphic = (id: string) => {
    setSelectedGraphics((prev) => prev.filter((item) => item !== id));
  };

  const shouldShow = (id: string) =>
    selectedGraphics.length === 0 || selectedGraphics.includes(id);

  return (
    <ContentLayout title="Gráficos Estadísticos de Reportes (General)">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-center items-center">
          <div className="flex flex-col w-full max-w-md">
            <Label className="text-lg font-semibold mb-2">
              Seleccionar Rango de Fechas:
            </Label>
            <DataFilter />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Label className="text-lg font-semibold">
            Seleccionar Gráficos a Mostrar:
          </Label>
          <div className="flex flex-col md:flex-row gap-2">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isOpen}
                  className="w-full justify-between"
                >
                  {selectedGraphics.length === 0 ? (
                    "Seleccionar gráficos..."
                  ) : (
                    <span>
                      {selectedGraphics.length} gráficos seleccionados
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar gráficos..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron gráficos</CommandEmpty>
                    <CommandGroup>
                      {graphicsOptions.map((option) => (
                        <CommandItem
                          key={option.id}
                          value={option.id}
                          onSelect={() => handleSelectChange(option.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedGraphics.includes(option.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              onClick={() => setSelectedGraphics([])}
              disabled={selectedGraphics.length === 0}
            >
              Limpiar selección
            </Button>
          </div>
        </div>

        {selectedGraphics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedGraphics.map((graphicId) => {
              const graphic = graphicsOptions.find((g) => g.id === graphicId);
              return (
                <Badge
                  key={graphicId}
                  variant="outline"
                  className="px-3 py-1 text-sm flex items-center gap-2"
                >
                  {graphic?.label}
                  <button
                    onClick={() => removeGraphic(graphicId)}
                    className="rounded-full p-1 hover:bg-gray-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-2">
        {/* Peligros Identificados vs Gestionados */}

        {shouldShow("bar-chart") && (
          <div className="flex flex-col justify-center items-center p-4 rounded-lg shadow border">
            {isLoadingBarChart ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : barChartData ? (
              params.from &&
              params.to && (
                <BarChartComponent
                  data={barChartData}
                  title="Peligros Identificados vs Gestionados"
                  bar_first_name="Identificados"
                  bar_second_name="Gestionados"
                />
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                Ha ocurrido un error al cargar los datos de Peligros
                Identificados vs Gestionados...
              </p>
            )}
          </div>
        )}

        {/* Numero de Reportes vs Tipo de Peligro (General) */}

        {shouldShow("type-chart") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingIdentificationData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : totalIdentificationData &&
              totalIdentificationData.length > 0 ? (
              <>
                <MultipleBarChartComponent
                  data={totalIdentificationData}
                  title="Numero de Reportes vs Tipo de Peligro (General)"
                />
              </>
            ) : (
              <p className="text-lg text-muted-foreground">
                No hay datos para mostrar.
              </p>
            )}
          </div>
        )}

        {shouldShow("area-chart") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingReportsByAreaData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : reportsByAreaData && reportsByAreaData.length > 0 ? (
              <MultipleBarChartComponent
                data={reportsByAreaData}
                title="Numero de Reportes vs Area de Identificación (General)"
              />
            ) : (
              <p className="text-lg text-muted-foreground">
                No hay datos para mostrar.
              </p>
            )}
            {isErrorReportsByAreaData && (
              <p className="text-sm text-muted-foreground">
                Ha ocurrido un error al cargar los peligros identificados...
              </p>
            )}
          </div>
        )}

        {shouldShow("pre-risk-pie") && (
          <div className="flex flex-col justify-center items-center p-4 rounded-lg shadow border">
            {isLoadingTotalRiskData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : totalRiskData && totalRiskData.length > 0 ? (
              <PieChartComponent
                title="Por Índice de Riesgo Pre-Mitigación"
                data={totalRiskData}
              />
            ) : (
              <p className="text-lg text-muted-foreground">
                No hay datos para mostrar.
              </p>
            )}
            {isErrorTotalRiskData && (
              <p className="text-sm text-muted-foreground">
                Ha ocurrido un error al cargar el numero de reportes por indice
                de riesgo...
              </p>
            )}
          </div>
        )}

        {shouldShow("pre-risk-bar") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingTotalRiskData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : totalRiskData && totalRiskData.length > 0 ? (
              <MultipleBarChartComponent
                data={totalRiskData}
                title="Numero de Reportes por Cada Indice de Riesgo (General)"
              />
            ) : (
              <p className=" text-center text-lg text-muted-foreground">
                No hay datos para mostrar.
              </p>
            )}
            {isErrorTotalRiskData && (
              <p className="text-sm text-muted-foreground">
                Ha ocurrido un error al cargar los peligros identificados...
              </p>
            )}
          </div>
        )}

        {shouldShow("post-risk-pie") && (
          <div className="flex flex-col justify-center items-center p-4 rounded-lg shadow border">
            {isLoadingTotalPostRiskData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : totalPostRiskData && totalPostRiskData.length > 0 ? (
              <PieChartComponent
                data={totalPostRiskData}
                title="Porcentaje de Indice de Riesgo Post-Mitigacion"
              />
            ) : (
              <p className="text-lg text-muted-foreground">
                No hay datos para mostrar.
              </p>
            )}
            {isErrorTotalRiskData && (
              <p className="text-sm text-muted-foreground">
                Ha ocurrido un error al cargar el numero de reportes por indice
                de riesgo...
              </p>
            )}
          </div>
        )}

        {shouldShow("post-risk-bar") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingTotalRiskData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : totalRiskData && totalRiskData.length > 0 ? (
              <MultipleBarChartComponent
                data={totalRiskData}
                title="Numero de Reportes por Cada Indice de Riesgo  (Post-Mitigacion)"
              />
            ) : (
              <p className="text-lg text-muted-foreground">
                No hay datos para mostrar.
              </p>
            )}
            {isErrorTotalRiskData && (
              <p className="text-sm text-muted-foreground">
                Ha ocurrido un error al cargar los peligros identificados...
              </p>
            )}
          </div>
        )}

        {shouldShow("source-type") && (
          <div className="flex flex-col justify-center items-center p-4 rounded-lg shadow border">
            {isLoadingReportSourceTypeData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : reportSourceTypeData && reportSourceTypeData.length > 0 ? (
              <MultipleBarChartComponent
                data={reportSourceTypeData}
                title="Numero de Reportes por Tipo de Fuente"
              />
            ) : (
              <p className="text-lg text-muted-foreground">
                No hay datos para mostrar
              </p>
            )}
          </div>
        )}

        {shouldShow("source-name") && (
          <div className="flex-col p-4 rounded-lg shadow border">
            {isLoadingReportSourceNameData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : reportSourceNameData && reportSourceNameData.length > 0 ? (
              <MultipleBarChartComponent
                data={reportSourceNameData}
                title="Numero de Reportes Voluntarios vs Nombre de la Fuente"
              />
            ) : (
              <p className="text-lg text-muted-foreground">
                No hay datos para mostrar.
              </p>
            )}
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default GeneralReportStats;
