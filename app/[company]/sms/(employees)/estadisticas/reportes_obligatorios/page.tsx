"use client";
import BarChartComponent from "@/components/charts/BarChartComponent";
import { ContentLayout } from "@/components/layout/ContentLayout";
import DataFilter from "@/components/misc/DataFilter";
import { Label } from "@/components/ui/label";
import { useGetDangerIdentificationsCountedByType } from "@/hooks/sms/useGetDangerIdentificationsCountedByType";
import { useGetPostRiskCountByDateRange } from "@/hooks/sms/useGetPostRiskByDateRange";
import { useGetRiskCountByDateRange } from "@/hooks/sms/useGetRiskByDateRange";
import { useGetVoluntaryReportingStatsByYear } from "@/hooks/sms/useGetVoluntaryReportingStatisticsByYear";
import { Loader2, Check, ChevronsUpDown, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { format, startOfMonth } from "date-fns";
import { useGetIdentificationStatsBySourceName } from "@/hooks/sms/useGetIdentificationStatsBySourceName";
import { useGetIdentificationStatsBySourceType } from "@/hooks/sms/useGetIdentificationStatsBySourceType";
import { useGetReportsCountedByArea } from "@/hooks/sms/useGetReportsCountedByArea";
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
import { useCompanyStore } from "@/stores/CompanyStore";
import MultipleBarChartComponent from "@/components/charts/MultipleBarChartComponent";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { Message } from "@/components/misc/Message";

const graphicsOptions = [
  {
    id: "Todos",
    label: "Todos los gráficos",
    description: "Mostrar todos los gráficos disponibles",
  },
  {
    id: "tipo",
    label: "Según su Tipo",
    description: "Número de reportes clasificados por tipo de peligro",
  },
  {
    id: "pre-riesgo",
    label: "Por Índice de Riesgo Pre-Mitigación",
    description:
      "Distribución de reportes por nivel de riesgo antes de mitigación",
  },
  {
    id: "post-riesgo",
    label: "Por Índice de Riesgo Post-Mitigación",
    description:
      "Distribución de reportes por nivel de riesgo después de mitigación",
  },
  {
    id: "bar-chart",
    label: "Identificados vs Gestionados",
    description: "Comparación entre reportes identificados y gestionados",
  },
  {
    id: "pre-riesgo-bar",
    label: "Número de Reportes por Índice de Riesgo",
    description: "Cantidad de reportes por nivel de riesgo pre-mitigación",
  },
  {
    id: "post-riesgo-bar",
    label: "Número de Reportes por Índice de Riesgo",
    description: "Cantidad de reportes por nivel de riesgo post-mitigación",
  },
  {
    id: "area-bar",
    label: "Número de Reportes vs Área",
    description: "Distribución de reportes por área responsable",
  },
  {
    id: "fuente-id",
    label: "Reportes vs Fuente de identificación",
    description: "Número de reportes por fuente de identificación",
  },
  {
    id: "metodo-id",
    label: "Reportes vs Método de identificación",
    description: "Número de reportes por método de detección",
  },
];

const Statistics = () => {
  const { selectedCompany } = useCompanyStore();
  const [selectedGraphics, setSelectedGraphics] = useState<string[]>(["Todos"]);
  const [isOpen, setIsOpen] = useState(false);

  const urlSearchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Obtener parámetros ACTUALES de la URL - SIN estado local
  const currentParams = useMemo(() => {
    const defaultFrom = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const defaultTo = format(new Date(), "yyyy-MM-dd");

    const urlParams = new URLSearchParams(urlSearchParams.toString());
    return {
      from: urlParams.get("from") || defaultFrom,
      to: urlParams.get("to") || defaultTo,
    };
  }, [urlSearchParams]);

  // Hooks de datos - Usan directamente los parámetros actuales de la URL
  const { data: barChartData, isLoading: isLoadingBarChart } =
    useGetVoluntaryReportingStatsByYear(
      selectedCompany?.slug!,
      currentParams.from,
      currentParams.to,
      "obligatory"
    );

  const { data: dynamicData, isLoading: isLoadingDynamicData } =
    useGetDangerIdentificationsCountedByType(
      selectedCompany?.slug!,
      currentParams.from,
      currentParams.to,
      "obligatory"
    );

  const { data: pieCharData, isLoading: isLoadingPieCharData } =
    useGetReportsCountedByArea(
      selectedCompany?.slug!,
      currentParams.from,
      currentParams.to,
      "obligatory"
    );

  const { data: riskData, isLoading: isLoadingRisk } =
    useGetRiskCountByDateRange(
      selectedCompany?.slug!,
      currentParams.from,
      currentParams.to,
      "obligatory"
    );

  const { data: postRiskData, isLoading: isLoadingPostRisk } =
    useGetPostRiskCountByDateRange(
      selectedCompany?.slug!,
      currentParams.from,
      currentParams.to,
      "obligatory"
    );

  const { data: reportsBySourceName, isLoading: isLoadingSourceName } =
    useGetIdentificationStatsBySourceName(
      selectedCompany?.slug!,
      currentParams.from,
      currentParams.to,
      "obligatory"
    );

  const { data: reportsBySourceType, isLoading: isLoadingSourceType } =
    useGetIdentificationStatsBySourceType(
      selectedCompany?.slug!,
      currentParams.from,
      currentParams.to,
      "obligatory"
    );

  // Manejar cambio de fechas desde DateFilter
  const handleDateChange = (
    dateRange: { from: Date; to: Date } | undefined
  ) => {
    if (!dateRange?.from || !dateRange?.to) return;

    const newParams = new URLSearchParams();
    newParams.set("from", format(dateRange.from, "yyyy-MM-dd"));
    newParams.set("to", format(dateRange.to, "yyyy-MM-dd"));

    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  // Manejar reset
  const handleReset = () => {
    const defaultFrom = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const defaultTo = format(new Date(), "yyyy-MM-dd");

    const newParams = new URLSearchParams();
    newParams.set("from", defaultFrom);
    newParams.set("to", defaultTo);

    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const handleSelectChange = (id: string) => {
    if (id === "Todos") {
      setSelectedGraphics(["Todos"]);
    } else {
      setSelectedGraphics((prev) => {
        // Si ya está seleccionado, lo removemos
        if (prev.includes(id)) {
          const newSelection = prev.filter((item) => item !== id);
          return newSelection.length === 0 ? ["Todos"] : newSelection;
        }
        // Si no está seleccionado, lo agregamos y removemos "Todos" si está presente
        const newSelection = [...prev.filter((item) => item !== "Todos"), id];
        return newSelection;
      });
    }
  };

  const removeGraphic = (id: string) => {
    setSelectedGraphics((prev) => {
      const newSelection = prev.filter((item) => item !== id);
      return newSelection.length === 0 ? ["Todos"] : newSelection;
    });
  };

  const shouldShow = (id: string) =>
    selectedGraphics.includes("Todos") || selectedGraphics.includes(id);

  return (
    <ContentLayout title="Gráficos Estadísticos de los Reportes (Obligatorios)">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-center items-center">
          <div className="flex flex-col w-full max-w-md">
            <Label className="text-lg font-semibold mb-2">
              Seleccionar Rango de Fechas:
            </Label>
            {/* ✅ CORREGIDO: Pasar todas las props necesarias al DataFilter */}
            <DataFilter
              onDateChange={handleDateChange}
              onReset={handleReset}
              initialDate={{
                from: currentParams.from,
                to: currentParams.to,
              }}
            />
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
                  {selectedGraphics.includes("Todos") ? (
                    <span>Todos los gráficos</span>
                  ) : selectedGraphics.length > 0 ? (
                    <span>
                      {selectedGraphics.length} gráfico
                      {selectedGraphics.length !== 1 ? "s" : ""} seleccionado
                      {selectedGraphics.length !== 1 ? "s" : ""}
                    </span>
                  ) : (
                    "Seleccionar gráficos..."
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
                          <div className="flex flex-col">
                            <span>{option.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              onClick={() => setSelectedGraphics(["Todos"])}
              disabled={
                selectedGraphics.length === 1 &&
                selectedGraphics.includes("Todos")
              }
            >
              Limpiar selección
            </Button>
          </div>
        </div>

        {!selectedGraphics.includes("Todos") && selectedGraphics.length > 0 && (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {shouldShow("bar-chart") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingBarChart ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : barChartData && barChartData.total !==0 ? (
              <BarChartComponent
                data={barChartData}
                title="Peligros Identificados vs Gestionados"
                bar_first_name="Identificados"
                bar_second_name="Gestionados"
              />
            ) : (
              <>
                <Message
                  title="Numero de Reportes vs Tipo de Peligros"
                  description="No hay datos para mostrar"
                />
              </>
            )}
          </div>
        )}

        {shouldShow("tipo") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingDynamicData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : dynamicData?.length ? (
              <MultipleBarChartComponent
                data={dynamicData}
                title="Número de Reportes vs Tipo de Peligros"
              />
            ) : (
              <>
                <Message
                  title="Numero de Reportes vs Tipo de Peligros"
                  description="No hay datos para mostrar"
                />
              </>
            )}
          </div>
        )}

        {shouldShow("area-bar") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingPieCharData ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : pieCharData?.length ? (
              <MultipleBarChartComponent
                data={pieCharData}
                title="Número de Reportes vs Áreas"
              />
            ) : (
              <>
                <Message
                  title="Numero de Reportes vs Áreas"
                  description="No hay datos para mostrar"
                />
              </>
            )}
          </div>
        )}

        {shouldShow("metodo-id") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingSourceType ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : reportsBySourceType?.length ? (
              <MultipleBarChartComponent
                data={reportsBySourceType}
                title="Reportes vs Método de Identificación"
              />
            ) : (
              <>
                <Message
                  title="Reportes vs Método de Identificación"
                  description="No hay datos para mostrar"
                />
              </>
            )}
          </div>
        )}

        {shouldShow("fuente-id") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingSourceName ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : reportsBySourceName?.length ? (
              <MultipleBarChartComponent
                data={reportsBySourceName}
                title="Reportes vs Fuente de Identificación"
              />
            ) : (
              <>
                <Message
                  title="Reportes vs Fuente de Identificación"
                  description="No hay datos para mostrar"
                />
              </>
            )}
          </div>
        )}

        {shouldShow("pre-riesgo") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingRisk ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : riskData?.length ? (
              <PieChartComponent
                data={riskData}
                title="Porcentaje de Índice de Riesgo Pre-Mitigación"
              />
            ) : (
              <>
                <Message
                  title="Porcentaje de Índice de Riesgo Pre-Mitigación"
                  description="No hay datos para mostrar"
                />
              </>
            )}
          </div>
        )}

        {shouldShow("pre-riesgo-bar") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingRisk ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : riskData?.length ? (
              <MultipleBarChartComponent
                data={riskData}
                title="Número de Reportes por Cada Índice de Riesgo"
              />
            ) : (
              <>
                <Message
                  title="Número de Reportes por Cada Índice de Riesgo"
                  description="No hay datos para mostrar"
                />
              </>
            )}
          </div>
        )}

        {shouldShow("post-riesgo") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingPostRisk ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : postRiskData?.length ? (
              <PieChartComponent
                data={postRiskData}
                title="Índice de Riesgo Post-Mitigación"
              />
            ) : (
              <>
                <Message
                  title="Índice de Riesgo Post-Mitigación"
                  description="No hay datos para mostrar"
                />
              </>
            )}
          </div>
        )}

        {shouldShow("post-riesgo-bar") && (
          <div className="p-4 rounded-lg shadow border">
            {isLoadingPostRisk ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-24 animate-spin" />
              </div>
            ) : postRiskData?.length ? (
              <MultipleBarChartComponent
                data={postRiskData}
                title="Número de Reportes por Cada Índice de Riesgo"
              />
            ) : (
              <>
                <Message
                  title="Número de Reportes por Cada Índice de Riesgo"
                  description="No hay datos para mostrar"
                />
              </>
            )}
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default Statistics;
