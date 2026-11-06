import { useMemo, useState } from "react";
import { ClipboardList, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { ReportCard } from "./report-card";
import { ReportListSkeleton } from "./report-list-skeleton";
import {
  getObligatoryMeta,
  getReportCode,
  getVoluntaryMeta,
  ReportType,
  ReportWithHazard,
  SelectedReport,
} from "./report-helpers";
import { ObligatoryReport, VoluntaryReport } from "@/types/sms/mantenimiento";

type ReportSelectionPanelProps = {
  activeTab: ReportType;
  onTabChange: (value: ReportType) => void;
  voluntaryReports: ReportWithHazard<VoluntaryReport>[];
  obligatoryReports: ReportWithHazard<ObligatoryReport>[];
  isLoadingVoluntaryReports: boolean;
  isLoadingObligatoryReports: boolean;
  isVoluntaryReportsError: boolean;
  isObligatoryReportsError: boolean;
  selectedReport: SelectedReport | null;
  onSelectReport: (report: SelectedReport) => void;
  className?: string;
  contentClassName?: string;
  showSticky?: boolean;
  hideHeader?: boolean;
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function ReportSelectionPanel({
  activeTab,
  onTabChange,
  voluntaryReports,
  obligatoryReports,
  isLoadingVoluntaryReports,
  isLoadingObligatoryReports,
  isVoluntaryReportsError,
  isObligatoryReportsError,
  selectedReport,
  onSelectReport,
  className,
  contentClassName,
  showSticky = false,
  hideHeader = false,
}: ReportSelectionPanelProps) {
  const [search, setSearch] = useState("");
  const query = normalizeText(search.trim());

  const filteredVoluntaryReports = useMemo(
    () =>
      query
        ? voluntaryReports.filter((report) =>
            normalizeText(
              [
                getReportCode(report, "RVP"),
                report.description,
                getVoluntaryMeta(report),
                report.status,
              ].join(" "),
            ).includes(query),
          )
        : voluntaryReports,
    [query, voluntaryReports],
  );

  const filteredObligatoryReports = useMemo(
    () =>
      query
        ? obligatoryReports.filter((report) =>
            normalizeText(
              [
                getReportCode(report, "ROS"),
                report.description,
                getObligatoryMeta(report),
                report.status,
              ].join(" "),
            ).includes(query),
          )
        : obligatoryReports,
    [query, obligatoryReports],
  );

  return (
    <Card
      className={cn(showSticky && "xl:sticky xl:top-6 xl:h-fit", className)}
    >
      {!hideHeader && (
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="h-5 w-5" />
            Reportes
          </CardTitle>
          <CardDescription>
            Elija un reporte para registrar su notificación de peligro o editar
            la que ya tiene.
          </CardDescription>
        </CardHeader>
      )}

      <CardContent className={cn("space-y-4", contentClassName)}>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por código, descripción o base…"
            className="pr-9 pl-9"
            aria-label="Buscar reportes"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => onTabChange(value as ReportType)}
          className="space-y-3"
        >
          <TabsList className="grid h-10 w-full grid-cols-2">
            <TabsTrigger value="RVP" className="gap-2">
              Voluntarios
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                {voluntaryReports.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="ROS" className="gap-2">
              Obligatorios
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                {obligatoryReports.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="RVP" className="mt-0 space-y-2.5">
            {isLoadingVoluntaryReports ? (
              <ReportListSkeleton />
            ) : isVoluntaryReportsError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                No se pudieron cargar los reportes voluntarios.
              </div>
            ) : filteredVoluntaryReports.length ? (
              <div className="max-h-[min(32rem,65vh)] space-y-2.5 overflow-y-auto pr-1">
                {filteredVoluntaryReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    type="RVP"
                    selected={
                      selectedReport?.type === "RVP" &&
                      selectedReport.id === report.id
                    }
                    meta={getVoluntaryMeta(report)}
                    onSelect={() =>
                      onSelectReport({ id: report.id, type: "RVP" })
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                {query
                  ? "Ningún reporte voluntario coincide con la búsqueda."
                  : "No hay reportes voluntarios disponibles."}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ROS" className="mt-0 space-y-2.5">
            {isLoadingObligatoryReports ? (
              <ReportListSkeleton />
            ) : isObligatoryReportsError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                No se pudieron cargar los reportes obligatorios.
              </div>
            ) : filteredObligatoryReports.length ? (
              <div className="max-h-[min(32rem,65vh)] space-y-2.5 overflow-y-auto pr-1">
                {filteredObligatoryReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    type="ROS"
                    selected={
                      selectedReport?.type === "ROS" &&
                      selectedReport.id === report.id
                    }
                    meta={getObligatoryMeta(report)}
                    onSelect={() =>
                      onSelectReport({ id: report.id, type: "ROS" })
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                {query
                  ? "Ningún reporte obligatorio coincide con la búsqueda."
                  : "No hay reportes obligatorios disponibles."}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
