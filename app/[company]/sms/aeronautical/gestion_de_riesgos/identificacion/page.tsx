'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    AlertCircle,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    ClipboardList,
    FileSearch,
    FileText,
    MapPin,
    ShieldAlert,
} from 'lucide-react';

import CreateHazardNotification from '@/components/forms/mantenimiento/sms/CreateHazardNotification';
import { ContentLayout } from '@/components/layout/ContentLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
} from '@/components/ui/collapsible';
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

type ReportType = 'RVP' | 'ROS';

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

type DetailItem = {
    label: string;
    value?: ReactNode;
    fullWidth?: boolean;
    contentClassName?: string;
};

const REPORT_LABELS: Record<ReportType, string> = {
    RVP: 'Reporte voluntario',
    ROS: 'Reporte obligatorio',
};

const getHazardNotification = <T,>(report: ReportWithHazard<T>) =>
    report.hazard_notification ?? report.danger_identification ?? null;

const getActionLabel = <T extends { status: string }>(report: ReportWithHazard<T>) => {
    if (getHazardNotification(report)) {
        return 'Editar Notificación';
    }

    if (report.status === 'ABIERTO') {
        return 'Crear Notificación';
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
    const prefix = type === 'RVP' ? 'RVP' : 'ROS';
    return report.report_number
        ? `${prefix}-${report.report_number}`
        : `${prefix}-${report.id}`;
};

const hasDetailValue = (value?: ReactNode) => {
    if (value === null || value === undefined) {
        return false;
    }

    if (typeof value === 'string') {
        return value.trim().length > 0;
    }

    return true;
};

const formatContactName = (...parts: Array<string | undefined>) =>
    parts.filter(Boolean).join(' ').trim();

const getVoluntaryReportDetails = (report: ReportWithHazard<VoluntaryReport>): DetailItem[] => [
    { label: 'Codigo', value: getReportCode(report, 'RVP') },
    { label: 'Fecha del reporte', value: formatDate(report.report_date) },
    { label: 'Estado', value: report.status },
    { label: 'Area identificada', value: report.identification_area },
    { label: 'Ubicacion', value: report.location?.name },
    {
        label: 'Reportante',
        value: formatContactName(report.reporter_name, report.reporter_last_name),
    },
    { label: 'Telefono', value: report.reporter_phone },
    { label: 'Correo', value: report.reporter_email },
    {
        label: 'Descripcion del reporte',
        value: report.description,
        fullWidth: true,
        contentClassName: 'whitespace-pre-wrap',
    },
    {
        label: 'Posibles consecuencias',
        value: report.possible_consequences,
        fullWidth: true,
        contentClassName: 'whitespace-pre-wrap',
    },
];

const getObligatoryReportDetails = (report: ReportWithHazard<ObligatoryReport>): DetailItem[] => [
    { label: 'Codigo', value: getReportCode(report, 'ROS') },
    { label: 'Fecha del reporte', value: formatDate(report.report_date) },
    { label: 'Hora del reporte', value: report.report_time },
    { label: 'Estado', value: report.status },
    { label: 'Fecha del incidente', value: formatDate(report.incident_date) },
    { label: 'Hora del incidente', value: report.incident_time },
    { label: 'Lugar del reporte', value: report.report_location?.name },
    { label: 'Lugar del incidente', value: report.incident_location?.name },
    { label: 'Reportante', value: formatContactName(report.name, report.last_name) },
    { label: 'Telefono', value: report.phone },
    { label: 'Correo', value: report.email },
    {
        label: 'Incidentes registrados',
        value: report.incidents,
        fullWidth: true,
        contentClassName: 'whitespace-pre-wrap',
    },
    {
        label: 'Otros incidentes',
        value: report.other_incidents,
        fullWidth: true,
        contentClassName: 'whitespace-pre-wrap',
    },
    {
        label: 'Descripcion del reporte',
        value: report.description,
        fullWidth: true,
        contentClassName: 'whitespace-pre-wrap',
    },
];

const getHazardNotificationDetails = (notification: HazardNotification): DetailItem[] => [
    { label: 'ID', value: notification.id },
    { label: 'Numero', value: notification.report_number },
    { label: 'Fecha de recepcion', value: formatDate(notification.reception_date) },
    { label: 'Area de identificacion', value: notification.identification_area },
    { label: 'Ubicacion', value: notification.location?.name },
    { label: 'Tipo de peligro', value: notification.danger_type },
    { label: 'Fuente de informacion', value: notification.information_source?.name },
    {
        label: 'Descripcion',
        value: notification.description,
        fullWidth: true,
        contentClassName: 'whitespace-pre-wrap',
    },
    {
        label: 'Posibles consecuencias',
        value: notification.possible_consequences,
        fullWidth: true,
        contentClassName: 'whitespace-pre-wrap',
    },
    {
        label: 'Consecuencia a evaluar',
        value: notification.consequence_to_evaluate,
        fullWidth: true,
        contentClassName: 'whitespace-pre-wrap',
    },
    {
        label: 'Analisis de causas raiz',
        value: notification.analysis_of_root_causes,
        fullWidth: true,
        contentClassName: 'whitespace-pre-wrap',
    },
];

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

function DetailGrid({ items }: { items: DetailItem[] }) {
    return (
        <div className="grid gap-3 md:grid-cols-2">
            {items.map(({ label, value, fullWidth, contentClassName }) => (
                <div
                    key={label}
                    className={cn(
                        'rounded-lg border bg-background p-3',
                        fullWidth && 'md:col-span-2'
                    )}
                >
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                    </p>
                    <p
                        className={cn(
                            'mt-1 text-sm',
                            !hasDetailValue(value) && 'text-muted-foreground',
                            contentClassName
                        )}
                    >
                        {hasDetailValue(value) ? value : 'Sin informacion registrada'}
                    </p>
                </div>
            ))}
        </div>
    );
}

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
                        {getReportCode(report, 'RVP')}
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
                        {getReportCode(report, 'ROS')}
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
    const currentNotification = currentReport
        ? getHazardNotification(
            currentReport as ReportWithHazard<VoluntaryReport | ObligatoryReport>
        )
        : null;

    const formMode = currentNotification ? 'edit' : 'create';
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

    useEffect(() => {
        setIsReportDetailsOpen(false);
        setIsNotificationDetailsOpen(false);
        setIsFormOpen(false);
    }, [selectedReport?.id, selectedReport?.type]);

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
                                <TabsTrigger value="RVP">Voluntarios</TabsTrigger>
                                <TabsTrigger value="ROS">Obligatorios</TabsTrigger>
                            </TabsList>

                            <TabsContent value="RVP" className="space-y-3">
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
                                                    selectedReport?.type === 'RVP' &&
                                                    selectedReport.id === report.id
                                                }
                                                onSelect={() =>
                                                    setSelectedReport({
                                                        id: report.id,
                                                        type: 'RVP',
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

                            <TabsContent value="ROS" className="space-y-3">
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
                                                    selectedReport?.type === 'ROS' &&
                                                    selectedReport.id === report.id
                                                }
                                                onSelect={() =>
                                                    setSelectedReport({
                                                        id: report.id,
                                                        type: 'ROS',
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
                                ? 'Detalle del reporte y Notificacion de peligro'
                                : 'Gestión de notificación'}
                        </CardTitle>
                        <CardDescription>
                            {currentReport ? (
                                <span className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium">
                                        {REPORT_LABELS[currentReportType!]}
                                    </span>
                                    <span>-</span>
                                    <span>{currentReportCode}</span>
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
                                            {REPORT_LABELS[currentReportType!]}
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
                                        {currentReportCode}
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
                                            <span className="font-medium">Accion:</span>{' '}
                                            {currentNotification
                                                ? 'Editar Notificacion de peligro existente'
                                                : 'Crear Notificacion de peligro nueva'}
                                        </div>
                                        <div>
                                            <span className="font-medium">Estado:</span>{' '}
                                            {currentReport.status}
                                        </div>
                                        <div>
                                            <span className="font-medium">Ubicacion:</span>{' '}
                                            {currentVoluntaryReport
                                                ? getVoluntaryMeta(currentVoluntaryReport) ||
                                                'Sin ubicacion asociada'
                                                : getObligatoryMeta(currentObligatoryReport!) ||
                                                'Sin ubicacion asociada'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setIsReportDetailsOpen((currentValue) => !currentValue)
                                        }
                                    >
                                        {isReportDetailsOpen
                                            ? 'Ocultar detalle del reporte'
                                            : 'Ver detalle del reporte'}
                                        {isReportDetailsOpen ? (
                                            <ChevronUp className="ml-2 h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="ml-2 h-4 w-4" />
                                        )}
                                    </Button>

                                    {currentNotification && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setIsNotificationDetailsOpen(
                                                    (currentValue) => !currentValue
                                                )
                                            }
                                        >
                                            {isNotificationDetailsOpen
                                                ? 'Ocultar Notificacion de peligro'
                                                : 'Ver Notificación de peligro'}
                                            {isNotificationDetailsOpen ? (
                                                <ChevronUp className="ml-2 h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="ml-2 h-4 w-4" />
                                            )}
                                        </Button>
                                    )}

                                    <Button
                                        type="button"
                                        onClick={() => setIsFormOpen((currentValue) => !currentValue)}
                                    >
                                        {isFormOpen
                                            ? 'Ocultar formulario'
                                            : currentNotification
                                                ? 'Editar Notificacion de peligro'
                                                : 'Crear Notificacion de peligro'}
                                        {isFormOpen ? (
                                            <ChevronUp className="ml-2 h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="ml-2 h-4 w-4" />
                                        )}
                                    </Button>
                                </div>

                                <Collapsible
                                    open={isReportDetailsOpen}
                                    onOpenChange={setIsReportDetailsOpen}
                                    className="rounded-lg border"
                                >
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Informacion detallada del reporte
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Revise todos los campos relevantes del reporte
                                                seleccionado.
                                            </p>
                                        </div>
                                    </div>
                                    <CollapsibleContent>
                                        <div className="border-t px-4 py-4">
                                            <DetailGrid items={reportDetails} />
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>

                                {currentNotification && (
                                    <Collapsible
                                        open={isNotificationDetailsOpen}
                                        onOpenChange={setIsNotificationDetailsOpen}
                                        className="rounded-lg border"
                                    >
                                        <div className="flex items-center gap-3 px-4 py-3">
                                            <ShieldAlert className="h-4 w-4 text-emerald-600" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Notificación de Peligro
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Este reporte ya cuenta con una notificación
                                                    registrada.
                                                </p>
                                            </div>
                                        </div>
                                        <CollapsibleContent>
                                            <div className="border-t px-4 py-4">
                                                <DetailGrid items={notificationDetails} />
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                )}

                                <Collapsible
                                    open={isFormOpen}
                                    onOpenChange={setIsFormOpen}
                                    className="rounded-lg border"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium">
                                                {currentNotification
                                                    ? 'Formulario de edicion'
                                                    : 'Formulario de creacion'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Abra este apartado solo cuando necesite registrar o
                                                actualizar la Notificacion de peligro.
                                            </p>
                                        </div>
                                        <Badge
                                            className={cn(
                                                'border',
                                                currentNotification
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                    : 'border-blue-200 bg-blue-50 text-blue-700'
                                            )}
                                        >
                                            {currentNotification ? 'Edicion' : 'Creacion'}
                                        </Badge>
                                    </div>
                                    <CollapsibleContent>
                                        <div className="border-t px-4 py-4">
                                            <CreateHazardNotification
                                                key={`${currentReportType!}-${selectedReport!.id}-${formMode}`}
                                                id={currentReport.id}
                                                reportType={currentReportType!}
                                                initialData={currentNotification || undefined}
                                                isEditing={Boolean(currentNotification)}
                                                onClose={() => setIsFormOpen(false)}
                                            />
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ContentLayout>
    );
};

export default Identification;
