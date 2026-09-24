"use client";

import BarChartComponent from "@/components/charts/BarChartComponent";
import MultipleBarChartComponent from "@/components/charts/MultipleBarChartComponent";
import {
  PieChartComponent,
  DEFAULT_COLORS,
} from "@/components/charts/PieChartComponent";
import DataFilter from "@/components/misc/DataFilter";
import StatisticsReportPdf, {
  type PdfStatisticsChart,
  type PieLegendRow,
} from "@/components/pdf/sms/StatisticsReportPdf";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useGetTotalDangerIdentificationsCountedByType } from "@/hooks/sms/useGetTotalDangerIdentificationsCountedByType";
import { useGetTotalIdentificationStatsBySourceName } from "@/hooks/sms/useGetTotalIdentificationStatsBySoruceName";
import { useGetTotalIdentificationStatsBySourceType } from "@/hooks/sms/useGetTotalIdentificationStatsBySoruceType";
import { useGetTotalPostRiskCountByDateRange } from "@/hooks/sms/useGetTotalPostRiskByDateRange";
import { useGetTotalReportsCountedByArea } from "@/hooks/sms/useGetTotalReportsCountedByArea";
import { useGetTotalReportsStatsByYear } from "@/hooks/sms/useGetTotalReportsStatsByYear";
import { useGetTotalRiskCountByDateRange } from "@/hooks/sms/useGetTotalRiskByDateRange";
import { captureElementAsPng } from "@/lib/captureElement";
import { GeneralStats, pieChartData } from "@/types";
import { pdf } from "@react-pdf/renderer";
import { format, parseISO, startOfMonth } from "date-fns";
import { FileBarChart2, FileDown, Loader2 } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";

const FIXED_STATISTICS: { id: string; label: string }[] = [
  {
    id: "bar-chart",
    label: "Peligros Identificados vs Gestionados (números y %)",
  },
  {
    id: "bar-chart-pie",
    label: "Peligros Identificados vs Gestionados (%)",
  },
  { id: "type-chart", label: "Número de Reportes vs Tipo de Peligro" },
  { id: "area-chart", label: "Reportes vs Área de Identificación" },
  { id: "pre-risk-pie", label: "Índice de Riesgo Pre-Mitigación" },
  {
    id: "pre-risk-bar",
    label: "Número de Reportes por Índice de Riesgo (Pre)",
  },
  { id: "post-risk-pie", label: "Índice de Riesgo Post-Mitigación" },
  {
    id: "post-risk-bar",
    label: "Número de Reportes por Índice de Riesgo (Post)",
  },
  { id: "source-type", label: "Reportes vs Tipo de Fuente" },
  { id: "source-name", label: "Reportes vs Nombre de Fuente" },
];

const CAPTURE_WIDTH = 640;

interface ChartCardConfig {
  id: string;
  label: string;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  render: () => ReactNode;
}

const defaultRange = () => ({
  from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
  to: format(new Date(), "yyyy-MM-dd"),
});

const PIE_STAT_IDS = new Set([
  "bar-chart-pie",
  "pre-risk-pie",
  "post-risk-pie",
]);

const toPieLegend = (data?: pieChartData[]): PieLegendRow[] | undefined =>
  data
    ? data.map((item, index) => {
        const color =
          DEFAULT_COLORS[index % DEFAULT_COLORS.length] || "#94a3b8";
        return {
          name: String(item.name),
          value: Number(item.value) || 0,
          color: color.length > 7 ? color.slice(0, 7) : color,
        };
      })
    : undefined;

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

interface SMSStatisticsPdfExportProps {
  companySlug: string;
}

export default function SMSStatisticsPdfExport({
  companySlug,
}: SMSStatisticsPdfExportProps) {
  const [range, setRange] = useState(defaultRange);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const {
    data: barChartData,
    isLoading: isLoadingBarChart,
    isError: isErrorBarChart,
  } = useGetTotalReportsStatsByYear(range.from, range.to, companySlug);

  const {
    data: totalIdentificationData,
    isLoading: isLoadingType,
    isError: isErrorType,
  } = useGetTotalDangerIdentificationsCountedByType(
    range.from,
    range.to,
    companySlug,
  );

  const {
    data: reportsByAreaData,
    isLoading: isLoadingArea,
    isError: isErrorArea,
  } = useGetTotalReportsCountedByArea(range.from, range.to, companySlug);

  const {
    data: totalRiskData,
    isLoading: isLoadingRisk,
    isError: isErrorRisk,
  } = useGetTotalRiskCountByDateRange(range.from, range.to, companySlug);

  const {
    data: totalPostRiskData,
    isLoading: isLoadingPostRisk,
    isError: isErrorPostRisk,
  } = useGetTotalPostRiskCountByDateRange(range.from, range.to, companySlug);

  const {
    data: reportSourceTypeData,
    isLoading: isLoadingSourceType,
    isError: isErrorSourceType,
  } = useGetTotalIdentificationStatsBySourceType(
    range.from,
    range.to,
    companySlug,
  );

  const {
    data: reportSourceNameData,
    isLoading: isLoadingSourceName,
    isError: isErrorSourceName,
  } = useGetTotalIdentificationStatsBySourceName(
    range.from,
    range.to,
    companySlug,
  );

  const generalStatsEmpty = (data?: GeneralStats) =>
    !!data && !data.open && !data.closed;
  const arrayEmpty = (data?: pieChartData[]) => !data || data.length === 0;

  const identificationPieData =
    barChartData && (barChartData.open || barChartData.closed)
      ? [
          {
            name: "Identificados",
            value:
              barChartData.open_percentage ??
              (barChartData.total > 0
                ? (barChartData.open * 100) / barChartData.total
                : 0),
          },
          {
            name: "Gestionados",
            value:
              barChartData.closed_percentage ??
              (barChartData.total > 0
                ? (barChartData.closed * 100) / barChartData.total
                : 0),
          },
        ]
      : [];

  const cards: ChartCardConfig[] = [
    {
      id: "bar-chart",
      label: "Peligros Identificados vs Gestionados (números y %)",
      isLoading: isLoadingBarChart,
      isError: isErrorBarChart,
      isEmpty: generalStatsEmpty(barChartData),
      render: () =>
        barChartData ? (
          <BarChartComponent
            data={barChartData}
            title="Peligros Identificados vs Gestionados"
            bar_first_name="Identificados"
            bar_second_name="Gestionados"
            showValueLabels
            forceLight
          />
        ) : null,
    },
    {
      id: "bar-chart-pie",
      label: "Peligros Identificados vs Gestionados (%)",
      isLoading: isLoadingBarChart,
      isError: isErrorBarChart,
      isEmpty: identificationPieData.length === 0,
      render: () =>
        identificationPieData.length > 0 ? (
          <PieChartComponent
            data={identificationPieData}
            title="Peligros Identificados vs Gestionados (%)"
          />
        ) : null,
    },
    {
      id: "type-chart",
      label: "Número de Reportes vs Tipo de Peligro",
      isLoading: isLoadingType,
      isError: isErrorType,
      isEmpty: arrayEmpty(totalIdentificationData),
      render: () =>
        totalIdentificationData ? (
          <MultipleBarChartComponent
            data={totalIdentificationData}
            title="Número de Reportes vs Tipo de Peligro"
            forceLight
          />
        ) : null,
    },
    {
      id: "area-chart",
      label: "Reportes vs Área de Identificación",
      isLoading: isLoadingArea,
      isError: isErrorArea,
      isEmpty: arrayEmpty(reportsByAreaData),
      render: () =>
        reportsByAreaData ? (
          <MultipleBarChartComponent
            data={reportsByAreaData}
            title="Reportes vs Área de Identificación"
            forceLight
          />
        ) : null,
    },
    {
      id: "pre-risk-pie",
      label: "Índice de Riesgo Pre-Mitigación",
      isLoading: isLoadingRisk,
      isError: isErrorRisk,
      isEmpty: arrayEmpty(totalRiskData),
      render: () =>
        totalRiskData ? (
          <PieChartComponent
            data={totalRiskData}
            title="Índice de Riesgo Pre-Mitigación"
          />
        ) : null,
    },
    {
      id: "pre-risk-bar",
      label: "Número de Reportes por Índice de Riesgo (Pre)",
      isLoading: isLoadingRisk,
      isError: isErrorRisk,
      isEmpty: arrayEmpty(totalRiskData),
      render: () =>
        totalRiskData ? (
          <MultipleBarChartComponent
            data={totalRiskData}
            title="Número de Reportes por Índice de Riesgo (Pre)"
            forceLight
          />
        ) : null,
    },
    {
      id: "post-risk-pie",
      label: "Índice de Riesgo Post-Mitigación",
      isLoading: isLoadingPostRisk,
      isError: isErrorPostRisk,
      isEmpty: arrayEmpty(totalPostRiskData),
      render: () =>
        totalPostRiskData ? (
          <PieChartComponent
            data={totalPostRiskData}
            title="Índice de Riesgo Post-Mitigación"
          />
        ) : null,
    },
    {
      id: "post-risk-bar",
      label: "Número de Reportes por Índice de Riesgo (Post)",
      isLoading: isLoadingPostRisk,
      isError: isErrorPostRisk,
      isEmpty: arrayEmpty(totalPostRiskData),
      render: () =>
        totalPostRiskData ? (
          <MultipleBarChartComponent
            data={totalPostRiskData}
            title="Número de Reportes por Índice de Riesgo (Post)"
            forceLight
          />
        ) : null,
    },
    {
      id: "source-type",
      label: "Reportes vs Tipo de Fuente",
      isLoading: isLoadingSourceType,
      isError: isErrorSourceType,
      isEmpty: arrayEmpty(reportSourceTypeData),
      render: () =>
        reportSourceTypeData ? (
          <MultipleBarChartComponent
            data={reportSourceTypeData}
            title="Reportes vs Tipo de Fuente"
            forceLight
          />
        ) : null,
    },
    {
      id: "source-name",
      label: "Reportes vs Nombre de Fuente",
      isLoading: isLoadingSourceName,
      isError: isErrorSourceName,
      isEmpty: arrayEmpty(reportSourceNameData),
      render: () =>
        reportSourceNameData ? (
          <MultipleBarChartComponent
            data={reportSourceNameData}
            title="Reportes vs Nombre de Fuente"
            forceLight
          />
        ) : null,
    },
  ];

  const cardsById = Object.fromEntries(
    cards.map((card) => [card.id, card]),
  ) as Record<string, ChartCardConfig>;

  const anyLoading = cards.some((card) => card.isLoading);
  const anyError = cards.some((card) => card.isError);
  const canOpen = !anyLoading && !anyError && !isGenerating;
  const canDownload = !anyLoading && !anyError && !isGenerating;

  const handleDateChange = (dateRange?: { from: Date; to: Date }) => {
    if (!dateRange?.from || !dateRange?.to) return;
    setRange({
      from: format(dateRange.from, "yyyy-MM-dd"),
      to: format(dateRange.to, "yyyy-MM-dd"),
    });
  };

  const handleReset = () => setRange(defaultRange());

  const handleDownload = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const charts: PdfStatisticsChart[] = [];
      for (const stat of FIXED_STATISTICS) {
        const element = previewRefs.current[stat.id];
        if (!element) continue;
        const captured = await captureElementAsPng(element);
        let legend: PieLegendRow[] | undefined;
        if (PIE_STAT_IDS.has(stat.id)) {
          if (stat.id === "bar-chart-pie") {
            legend = toPieLegend(identificationPieData);
          } else if (stat.id === "pre-risk-pie") {
            legend = toPieLegend(totalRiskData);
          } else if (stat.id === "post-risk-pie") {
            legend = toPieLegend(totalPostRiskData);
          }
        }
        charts.push({
          id: stat.id,
          label: stat.label,
          image: captured.dataUrl,
          imageSize: { width: captured.width, height: captured.height },
          stats: stat.id === "bar-chart" ? barChartData : undefined,
          legend,
        });
      }
      if (charts.length === 0) return;

      const blob = await pdf(
        <StatisticsReportPdf
          company={companySlug}
          from={range.from}
          to={range.to}
          charts={charts}
        />,
      ).toBlob();
      downloadBlob(
        blob,
        `reporte_estadisticas_sms_${companySlug}_${range.from}_${range.to}.pdf`,
      );
      setDialogOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const periodText = `${format(parseISO(range.from), "dd/MM/yyyy")} - ${format(
    parseISO(range.to),
    "dd/MM/yyyy",
  )}`;

  return (
    <div className="space-y-5">
      {/* Fechas */}
      <div className="flex flex-col items-start gap-1.5">
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Rango de fechas a consultar
        </Label>
        <DataFilter
          onDateChange={handleDateChange}
          onReset={handleReset}
          initialDate={range}
        />
      </div>

      {/* Acción de reporte */}
      <div className="border border-border/60 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-500 shrink-0">
            <FileBarChart2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight">
              Reporte estadístico SMS
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Incluye las {FIXED_STATISTICS.length} estadísticas del módulo en
              un único PDF para el periodo {periodText}.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          disabled={!canOpen}
          className="gap-2 shrink-0"
        >
          {anyLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileDown className="size-4" />
          )}
          Generar reporte PDF
        </Button>
      </div>

      {/* Dialog de configuración de descarga */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader className="pb-2 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-500 shrink-0">
                <FileBarChart2 className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold leading-tight">
                  Descargar reporte estadístico
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {companySlug} · Periodo {periodText}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 py-4 max-h-[420px] overflow-y-auto pr-1">
            <section className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Estadísticas del reporte
              </span>
              <div className="border border-border/40 rounded-lg divide-y divide-border/30">
                {FIXED_STATISTICS.map((stat) => (
                  <div
                    key={stat.id}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <Checkbox
                      checked
                      disabled
                      aria-label={stat.label}
                      className="disabled:opacity-60"
                    />
                    <span className="text-sm">{stat.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Otras estadísticas (opcional)
              </span>
              <div className="border border-dashed border-border/40 rounded-lg px-3 py-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Aún no hay estadísticas opcionales para agregar. Se incluirá
                  automáticamente todo el reporte.
                </p>
              </div>
            </section>
          </div>

          <div className="flex justify-end gap-3 pt-1 border-t border-border/60">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDownload}
              disabled={!canDownload}
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileDown className="size-4" />
              )}
              {isGenerating ? "Generando..." : "Descargar PDF"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contenedor oculto para capturar los gráficos */}
      <div
        className="fixed -top-[9999px] -left-[9999px] pointer-events-none"
        aria-hidden="true"
      >
        <div style={{ width: CAPTURE_WIDTH }} className="space-y-4">
          {FIXED_STATISTICS.map((stat) => {
            const card = cardsById[stat.id];
            const ready =
              card && !card.isLoading && !card.isError && !card.isEmpty;
            return (
              <div
                key={stat.id}
                ref={(element) => {
                  previewRefs.current[stat.id] = element;
                }}
                className="bg-white"
              >
                {ready ? (
                  card.render()
                ) : (
                  <div className="h-[280px] flex items-center justify-center">
                    <p className="text-sm text-slate-500">
                      {card?.isError
                        ? "No se pudieron cargar los datos."
                        : "No hay datos para mostrar."}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
