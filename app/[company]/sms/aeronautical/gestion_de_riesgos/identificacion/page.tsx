"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ClipboardList } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useGetObligatoryReports } from "@/hooks/sms/mantenimiento/useGetObligatoryReports";
import { useGetVoluntaryReports } from "@/hooks/sms/mantenimiento/useGetVoluntaryReports";
import { useCompanyStore } from "@/stores/CompanyStore";

import {
  getHazardNotification,
  getObligatoryMeta,
  getObligatoryReportDetails,
  getReportCode,
  getVoluntaryMeta,
  getVoluntaryReportDetails,
  ReportType,
  SelectedReport,
  sortByNewestDate,
} from "@/app/[company]/sms/aeronautical/gestion_de_riesgos/_components/report-helpers";
import { ReportDetailsPanel } from "@/app/[company]/sms/aeronautical/gestion_de_riesgos/_components/report-details-panel";
import { ReportSelectionPanel } from "@/app/[company]/sms/aeronautical/gestion_de_riesgos/_components/report-selection-panel";

const Identification = () => {
  const params = useParams<{ company: string }>();
  const { selectedCompany } = useCompanyStore();
  const companySlug = selectedCompany?.slug || params.company;

  const [activeTab, setActiveTab] = useState<ReportType>("RVP");
  const [selectedReport, setSelectedReport] = useState<SelectedReport | null>(
    null,
  );
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const {
    data: voluntaryReports,
    isLoading: isLoadingVoluntaryReports,
    isError: isVoluntaryReportsError,
  } = useGetVoluntaryReports(companySlug);

  const {
    data: obligatoryReports,
    isLoading: isLoadingObligatoryReports,
    isError: isObligatoryReportsError,
  } = useGetObligatoryReports(companySlug);

  const normalizedVoluntaryReports = useMemo(
    () => sortByNewestDate(voluntaryReports || []),
    [voluntaryReports],
  );

  const normalizedObligatoryReports = useMemo(
    () => sortByNewestDate(obligatoryReports || []),
    [obligatoryReports],
  );

  const currentVoluntaryReport = useMemo(
    () =>
      normalizedVoluntaryReports.find(
        (report) =>
          selectedReport?.type === "RVP" && report.id === selectedReport.id,
      ) || null,
    [normalizedVoluntaryReports, selectedReport],
  );

  const currentObligatoryReport = useMemo(
    () =>
      normalizedObligatoryReports.find(
        (report) =>
          selectedReport?.type === "ROS" && report.id === selectedReport.id,
      ) || null,
    [normalizedObligatoryReports, selectedReport],
  );

  const currentReport = currentVoluntaryReport || currentObligatoryReport;
  const currentNotification = currentReport
    ? getHazardNotification(currentReport)
    : null;
  const currentReportType = selectedReport?.type ?? null;

  const currentReportCode =
    currentReport && currentReportType
      ? getReportCode(currentReport, currentReportType)
      : null;

  const reportDetails = useMemo(() => {
    if (currentVoluntaryReport) {
      return getVoluntaryReportDetails(currentVoluntaryReport);
    }

    if (currentObligatoryReport) {
      return getObligatoryReportDetails(currentObligatoryReport);
    }

    return [];
  }, [currentObligatoryReport, currentVoluntaryReport]);

  const currentReportLocationLabel = currentVoluntaryReport
    ? getVoluntaryMeta(currentVoluntaryReport)
    : currentObligatoryReport
      ? getObligatoryMeta(currentObligatoryReport)
      : "";

  const openSelector = () => {
    if (selectedReport) {
      setActiveTab(selectedReport.type);
    }
    setIsSelectorOpen(true);
  };

  const handleSelectReport = (report: SelectedReport) => {
    setSelectedReport(report);
    setIsSelectorOpen(false);
  };

  return (
    <ContentLayout title="Identificación de peligros">
      <PageHeader className="mb-6" />

      {!currentReport || !currentReportType || !currentReportCode ? (
        <Card className="border-dashed">
          <CardContent className="flex min-h-[55vh] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Seleccione un reporte</h2>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                Elija un reporte voluntario u obligatorio para registrar o
                editar su notificación de peligro.
              </p>
            </div>
            <Button type="button" onClick={openSelector}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Seleccionar reporte
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ReportDetailsPanel
          currentReport={currentReport}
          currentReportType={currentReportType}
          currentReportCode={currentReportCode}
          currentNotification={currentNotification}
          reportLocationLabel={currentReportLocationLabel}
          reportDetails={reportDetails}
          onChangeReport={openSelector}
        />
      )}

      <Sheet open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
        <SheetContent
          side="left"
          className="w-full overflow-y-auto sm:max-w-md"
        >
          <SheetHeader className="mb-4">
            <SheetTitle>Seleccionar reporte</SheetTitle>
            <SheetDescription>
              Elija un reporte para registrar o editar su notificación de
              peligro.
            </SheetDescription>
          </SheetHeader>

          <ReportSelectionPanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
            voluntaryReports={normalizedVoluntaryReports}
            obligatoryReports={normalizedObligatoryReports}
            isLoadingVoluntaryReports={isLoadingVoluntaryReports}
            isLoadingObligatoryReports={isLoadingObligatoryReports}
            isVoluntaryReportsError={isVoluntaryReportsError}
            isObligatoryReportsError={isObligatoryReportsError}
            selectedReport={selectedReport}
            onSelectReport={handleSelectReport}
            hideHeader
            className="border-0 bg-transparent shadow-none"
            contentClassName="px-0"
          />
        </SheetContent>
      </Sheet>
    </ContentLayout>
  );
};

export default Identification;
