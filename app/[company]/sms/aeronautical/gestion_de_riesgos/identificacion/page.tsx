'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    AlertCircle,
    CheckCircle2,
    ClipboardList,
    FileSearch,
    MapPin,
} from 'lucide-react';

import CreateHazardNotification from '@/components/forms/mantenimiento/sms/CreateHazardNotification';
import { ContentLayout } from '@/components/layout/ContentLayout';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetObligatoryReports } from '@/hooks/sms/mantenimiento/useGetObligatoryReports';
import { useGetVoluntaryReports } from '@/hooks/sms/mantenimiento/useGetVoluntaryReports';
import { cn, formatDate } from '@/lib/utils';
import { useCompanyStore } from '@/stores/CompanyStore';
import {
    HazardNotification,
    ObligatoryReport,
    VoluntaryReport,
} from '@/types/sms/mantenimiento';

type ReportType = 'VOLUNTARIO' | 'OBLIGATORIO';

type ReportWithHazard<T> = T & {
    report_number?: string | null;
    danger_identification_id?: number | null;
    hazard_notification?: HazardNotification | null;
    danger_identification?: HazardNotification | null;
};

type SelectedReport = {
    id: number;
    type: ReportType;
};

const REPORT_LABELS: Record<ReportType, string> = {
    VOLUNTARIO: 'Reporte voluntario',
    OBLIGATORIO: 'Reporte obligatorio',
};

const getHazardNotification = <T,>(report: ReportWithHazard<T>) =>
    report.hazard_notification ?? report.danger_identification ?? null;

const getActionLabel = <T extends { status: string }>(report: ReportWithHazard<T>) => {
    if (getHazardNotification(report)) {
        return 'Editar identificación';
    }

    if (report.status === 'ABIERTO') {
        return 'Crear identificación';
    }

    return 'No disponible';
};

const getActionTone = <T extends { status: string }>(report: ReportWithHazard<T>) => {
    if (getHazardNotification(report)) {
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }

    if (report.status === 'ABIERTO') {
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }

    return 'bg-muted text-muted-foreground border-border';
};

const isSelectable = <T extends { status: string }>(report: ReportWithHazard<T>) =>
    Boolean(getHazardNotification(report)) || report.status === 'ABIERTO';

const sortByNewestDate = <T extends { report_date: string | Date }>(reports: T[]) =>
    [...reports].sort(
        (a, b) =>
            new Date(b.report_date).getTime() - new Date(a.report_date).getTime()
    );

const getVoluntaryMeta = (report: ReportWithHazard<VoluntaryReport>) =>
    [report.identification_area, report.location?.name].filter(Boolean).join(' - ');

const getObligatoryMeta = (report: ReportWithHazard<ObligatoryReport>) =>
    [
        report.report_location?.name,
        report.incident_location?.name,
    ]
        .filter(Boolean)
        .join(' - ');

const getReportCode = (
    report: ReportWithHazard<VoluntaryReport> | ReportWithHazard<ObligatoryReport>,
    type: ReportType
) => {
    const prefix = type === 'VOLUNTARIO' ? 'RVP' : 'ROS';
    return report.report_number
        ? `${prefix}-${report.report_number}`
        : `${prefix}-${report.id}`;
};

const ReportListSkeleton = () => (
    <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-lg border p-4 space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        ))}
    </div>
);

function VoluntaryReportCard({
    report,
    selected,
    onSelect,
}: {
    report: ReportWithHazard<VoluntaryReport>;
    selected: boolean;
    onSelect: () => void;
}) {
    const selectable = isSelectable(report);

    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={!selectable}
            className={cn(
                'w-full rounded-lg border p-4 text-left transition-colors',
                selected && 'border-primary bg-primary/5',
                selectable && 'hover:border-primary/50 hover:bg-accent/40',
                !selectable && 'cursor-not-allowed opacity-65'
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-sm font-semibold">
                        {getReportCode(report, 'VOLUNTARIO')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {formatDate(report.report_date)}
                    </p>
                </div>
                <Badge className={cn('border', getActionTone(report))}>
                    {getActionLabel(report)}
                </Badge>
            </div>

            <p className="mt-3 line-clamp-3 text-sm">{report.description}</p>

            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{getVoluntaryMeta(report) || 'Sin ubicación asociada'}</span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
                <Badge variant="outline">{report.status}</Badge>
                {selected && <span className="text-xs font-medium">Seleccionado</span>}
            </div>
        </button>
    );
}

function ObligatoryReportCard({
    report,
    selected,
    onSelect,
}: {
    report: ReportWithHazard<ObligatoryReport>;
    selected: boolean;
    onSelect: () => void;
}) {
    const selectable = isSelectable(report);

    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={!selectable}
            className={cn(
                'w-full rounded-lg border p-4 text-left transition-colors',
                selected && 'border-primary bg-primary/5',
                selectable && 'hover:border-primary/50 hover:bg-accent/40',
                !selectable && 'cursor-not-allowed opacity-65'
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-sm font-semibold">
                        {getReportCode(report, 'OBLIGATORIO')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {formatDate(report.report_date)}
                    </p>
                </div>
                <Badge className={cn('border', getActionTone(report))}>
                    {getActionLabel(report)}
                </Badge>
            </div>

            <p className="mt-3 line-clamp-3 text-sm">{report.description}</p>

            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{getObligatoryMeta(report) || 'Sin ubicación asociada'}</span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
                <Badge variant="outline">{report.status}</Badge>
                {selected && <span className="text-xs font-medium">Seleccionado</span>}
            </div>
        </button>
    );
}

const Identification = () => {
    const params = useParams<{ company: string }>();
    const { selectedCompany } = useCompanyStore();
    const companySlug = selectedCompany?.slug || params.company;

    const [activeTab, setActiveTab] = useState<ReportType>('VOLUNTARIO');
    const [selectedReport, setSelectedReport] = useState<SelectedReport | null>(null);

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
        () => sortByNewestDate((voluntaryReports || []) as ReportWithHazard<VoluntaryReport>[]),
        [voluntaryReports]
    );

    const normalizedObligatoryReports = useMemo(
        () =>
            sortByNewestDate((obligatoryReports || []) as ReportWithHazard<ObligatoryReport>[]),
        [obligatoryReports]
    );

    const currentVoluntaryReport = useMemo(
        () =>
            normalizedVoluntaryReports.find(
                (report) =>
                    selectedReport?.type === 'VOLUNTARIO' && report.id === selectedReport.id
            ) || null,
        [normalizedVoluntaryReports, selectedReport]
    );

    const currentObligatoryReport = useMemo(
        () =>
            normalizedObligatoryReports.find(
                (report) =>
                    selectedReport?.type === 'OBLIGATORIO' && report.id === selectedReport.id
            ) || null,
        [normalizedObligatoryReports, selectedReport]
    );

    const currentReport = currentVoluntaryReport || currentObligatoryReport;
    const currentNotification = currentReport
        ? getHazardNotification(
              currentReport as ReportWithHazard<VoluntaryReport | ObligatoryReport>
          )
        : null;

    const formMode = currentNotification ? 'edit' : 'create';

    return (
        <ContentLayout title="Notificación de peligro">
            <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                <Card className="xl:sticky xl:top-6 xl:h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <ClipboardList className="h-5 w-5" />
                            Selección de reporte
                        </CardTitle>
                        <CardDescription>
                            Elija un reporte voluntario u obligatorio para crear o editar
                            su notificación de peligro.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                            Solo se pueden seleccionar reportes abiertos para crear una
                            notificación, o reportes que ya tengan una identificación
                            asociada para editarla.
                        </div>

                        <Tabs
                            value={activeTab}
                            onValueChange={(value) => setActiveTab(value as ReportType)}
                            className="space-y-4"
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="VOLUNTARIO">Voluntarios</TabsTrigger>
                                <TabsTrigger value="OBLIGATORIO">Obligatorios</TabsTrigger>
                            </TabsList>

                            <TabsContent value="VOLUNTARIO" className="space-y-3">
                                {isLoadingVoluntaryReports ? (
                                    <ReportListSkeleton />
                                ) : isVoluntaryReportsError ? (
                                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                                        No se pudieron cargar los reportes voluntarios.
                                    </div>
                                ) : normalizedVoluntaryReports.length ? (
                                    <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
                                        {normalizedVoluntaryReports.map((report) => (
                                            <VoluntaryReportCard
                                                key={report.id}
                                                report={report}
                                                selected={
                                                    selectedReport?.type === 'VOLUNTARIO' &&
                                                    selectedReport.id === report.id
                                                }
                                                onSelect={() =>
                                                    setSelectedReport({
                                                        id: report.id,
                                                        type: 'VOLUNTARIO',
                                                    })
                                                }
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                        No hay reportes voluntarios disponibles.
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="OBLIGATORIO" className="space-y-3">
                                {isLoadingObligatoryReports ? (
                                    <ReportListSkeleton />
                                ) : isObligatoryReportsError ? (
                                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                                        No se pudieron cargar los reportes obligatorios.
                                    </div>
                                ) : normalizedObligatoryReports.length ? (
                                    <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
                                        {normalizedObligatoryReports.map((report) => (
                                            <ObligatoryReportCard
                                                key={report.id}
                                                report={report}
                                                selected={
                                                    selectedReport?.type === 'OBLIGATORIO' &&
                                                    selectedReport.id === report.id
                                                }
                                                onSelect={() =>
                                                    setSelectedReport({
                                                        id: report.id,
                                                        type: 'OBLIGATORIO',
                                                    })
                                                }
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                        No hay reportes obligatorios disponibles.
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            {currentNotification ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            ) : currentReport ? (
                                <AlertCircle className="h-5 w-5 text-blue-600" />
                            ) : (
                                <FileSearch className="h-5 w-5" />
                            )}
                            {currentReport
                                ? `${currentNotification ? 'Editar' : 'Crear'} notificación de peligro`
                                : 'Formulario de notificación'}
                        </CardTitle>
                        <CardDescription>
                            {currentReport ? (
                                <span className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium">
                                        {REPORT_LABELS[selectedReport!.type]}
                                    </span>
                                    <span>-</span>
                                    <span>{getReportCode(currentReport, selectedReport!.type)}</span>
                                </span>
                            ) : (
                                'Seleccione un reporte en el panel izquierdo para continuar.'
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!currentReport ? (
                            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center">
                                <FileSearch className="mb-4 h-10 w-10 text-muted-foreground" />
                                <h3 className="text-lg font-semibold">
                                    Aun no hay un reporte seleccionado
                                </h3>
                                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                                    Elija un reporte voluntario u obligatorio para cargar su
                                    información y abrir el formulario de notificación de
                                    peligro.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="rounded-lg border bg-muted/30 p-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">
                                            {REPORT_LABELS[selectedReport!.type]}
                                        </Badge>
                                        <Badge
                                            className={cn(
                                                'border',
                                                currentNotification
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                    : 'border-blue-200 bg-blue-50 text-blue-700'
                                            )}
                                        >
                                            {currentNotification
                                                ? 'Modo edición'
                                                : 'Nueva identificación'}
                                        </Badge>
                                        <Badge variant="outline">{currentReport.status}</Badge>
                                    </div>

                                    <p className="mt-3 text-sm font-medium">
                                        {getReportCode(currentReport, selectedReport!.type)}
                                    </p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {currentReport.description}
                                    </p>
                                    <Separator className="my-4" />
                                    <div className="grid gap-3 text-sm md:grid-cols-2">
                                        <div>
                                            <span className="font-medium">Fecha del reporte:</span>{' '}
                                            {formatDate(currentReport.report_date)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Acción:</span>{' '}
                                            {currentNotification
                                                ? 'Editar identificación existente'
                                                : 'Crear identificación nueva'}
                                        </div>
                                    </div>
                                </div>

                                <CreateHazardNotification
                                    key={`${selectedReport!.type}-${selectedReport!.id}-${formMode}`}
                                    id={currentReport.id}
                                    reportType={selectedReport!.type}
                                    initialData={currentNotification || undefined}
                                    isEditing={Boolean(currentNotification)}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ContentLayout>
    );
};

export default Identification;
