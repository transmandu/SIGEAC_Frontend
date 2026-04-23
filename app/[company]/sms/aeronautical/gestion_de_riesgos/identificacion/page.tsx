'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

import { ContentLayout } from '@/components/layout/ContentLayout';
import { useGetObligatoryReports } from '@/hooks/sms/mantenimiento/useGetObligatoryReports';
import { useGetVoluntaryReports } from '@/hooks/sms/mantenimiento/useGetVoluntaryReports';
import { useCompanyStore } from '@/stores/CompanyStore';

import {
    getHazardNotification,
    getHazardNotificationDetails,
    getObligatoryMeta,
    getObligatoryReportDetails,
    getReportCode,
    getVoluntaryMeta,
    getVoluntaryReportDetails,
    ReportType,
    SelectedReport,
    sortByNewestDate,
} from '../_components/report-helpers';
import { ReportDetailsPanel } from '../_components/report-details-panel';
import { ReportSelectionPanel } from '../_components/report-selection-panel';

const Identification = () => {
    const params = useParams<{ company: string }>();
    const { selectedCompany } = useCompanyStore();
    const companySlug = selectedCompany?.slug || params.company;

    const [activeTab, setActiveTab] = useState<ReportType>('RVP');
    const [selectedReport, setSelectedReport] = useState<SelectedReport | null>(null);
    const [isReportDetailsOpen, setIsReportDetailsOpen] = useState(false);
    const [isNotificationDetailsOpen, setIsNotificationDetailsOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

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
        [voluntaryReports]
    );

    const normalizedObligatoryReports = useMemo(
        () => sortByNewestDate(obligatoryReports || []),
        [obligatoryReports]
    );

    const currentVoluntaryReport = useMemo(
        () =>
            normalizedVoluntaryReports.find(
                (report) =>
                    selectedReport?.type === 'RVP' && report.id === selectedReport.id
            ) || null,
        [normalizedVoluntaryReports, selectedReport]
    );

    const currentObligatoryReport = useMemo(
        () =>
            normalizedObligatoryReports.find(
                (report) =>
                    selectedReport?.type === 'ROS' && report.id === selectedReport.id
            ) || null,
        [normalizedObligatoryReports, selectedReport]
    );

    const currentReport = currentVoluntaryReport || currentObligatoryReport;
    const currentNotification = currentReport ? getHazardNotification(currentReport) : null;
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

    const notificationDetails = useMemo(
        () => (currentNotification ? getHazardNotificationDetails(currentNotification) : []),
        [currentNotification]
    );

    const currentReportLocationLabel = currentVoluntaryReport
        ? getVoluntaryMeta(currentVoluntaryReport)
        : currentObligatoryReport
            ? getObligatoryMeta(currentObligatoryReport)
            : '';

    useEffect(() => {
        setIsReportDetailsOpen(false);
        setIsNotificationDetailsOpen(false);
        setIsFormOpen(false);
    }, [selectedReport?.id, selectedReport?.type]);

    return (
        <ContentLayout title="Notificación de peligro">
            <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
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
                    onSelectReport={setSelectedReport}
                />

                {!currentReport || !currentReportType || !currentReportCode ? (
                    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center">
                        <h3 className="text-lg font-semibold">Aun no hay un reporte seleccionado</h3>
                        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                            Elija un reporte voluntario u obligatorio para cargar su información y
                            abrir el formulario de notificación de peligro.
                        </p>
                    </div>
                ) : (
                    <ReportDetailsPanel
                        currentReport={currentReport}
                        currentReportType={currentReportType}
                        currentReportCode={currentReportCode}
                        currentNotification={currentNotification}
                        reportLocationLabel={currentReportLocationLabel}
                        reportDetails={reportDetails}
                        notificationDetails={notificationDetails}
                        isReportDetailsOpen={isReportDetailsOpen}
                        isNotificationDetailsOpen={isNotificationDetailsOpen}
                        isFormOpen={isFormOpen}
                        onToggleReportDetails={() => setIsReportDetailsOpen((value) => !value)}
                        onToggleNotificationDetails={() =>
                            setIsNotificationDetailsOpen((value) => !value)
                        }
                        onToggleForm={() => setIsFormOpen((value) => !value)}
                        onReportDetailsOpenChange={setIsReportDetailsOpen}
                        onNotificationDetailsOpenChange={setIsNotificationDetailsOpen}
                        onFormOpenChange={setIsFormOpen}
                        onCloseForm={() => setIsFormOpen(false)}
                        formMode={currentNotification ? 'edit' : 'create'}
                    />
                )}
            </div>
        </ContentLayout>
    );
};

export default Identification;
