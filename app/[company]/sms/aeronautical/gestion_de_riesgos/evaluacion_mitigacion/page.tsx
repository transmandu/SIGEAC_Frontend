'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
    FileStack,
    FileText,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react';

import CreateFollowUpControl from '@/components/forms/mantenimiento/sms/CreateFollowUpControl';
import CreateMitigationMeasure from '@/components/forms/mantenimiento/sms/CreateMitigationMeasure';
import CreateMitigationPlanAnalysis from '@/components/forms/mantenimiento/sms/CreateMitigationPlanAnalysis';
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
import { useGetHazardNotifications } from '@/hooks/sms/mantenimiento/useGetHazardNotifications';
import { cn, formatDate } from '@/lib/utils';
import { useCompanyStore } from '@/stores/CompanyStore';
import {
    Analysis,
    FollowUpControl,
    HazardNotification,
    MitigationMeasure,
    MitigationPlan,
} from '@/types/sms/mantenimiento';

const getNotificationSource = (notification: HazardNotification) => {
    if (notification.voluntaryReport) {
        const code = notification.voluntaryReport.report_number || notification.voluntaryReport.id;
        return `RVP-${code}`;
    }

    if (notification.obligatoryReport) {
        const code =
            notification.obligatoryReport.report_number || notification.obligatoryReport.id;
        return `ROS-${code}`;
    }

    return `HN-${notification.report_number || notification.id}`;
};

const sortByNewestDate = (notifications: HazardNotification[]) =>
    [...notifications].sort(
        (a, b) =>
            new Date(b.reception_date).getTime() - new Date(a.reception_date).getTime()
    );

const getWorkflowStatus = (notification: HazardNotification) => {
    const mitigationPlan = notification.mitigationPlan;
    const analysis = mitigationPlan?.analysis || notification.analysis;
    const measures = mitigationPlan?.mitigation_measure || [];
    const controls = measures.flatMap((measure) => measure.follow_up_controls || []);

    if (!mitigationPlan || !analysis) {
        return {
            label: 'Pendiente de evaluación',
            className: 'border-amber-200 bg-amber-50 text-amber-700',
        };
    }

    if (!measures.length) {
        return {
            label: 'Plan y análisis listos',
            className: 'border-blue-200 bg-blue-50 text-blue-700',
        };
    }

    if (!controls.length) {
        return {
            label: 'En medidas de mitigación',
            className: 'border-violet-200 bg-violet-50 text-violet-700',
        };
    }

    return {
        label: 'Con seguimiento activo',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    };
};

const StepBadge = ({
    step,
    title,
    completed,
}: {
    step: number;
    title: string;
    completed: boolean;
}) => (
    <div
        className={cn(
            'flex items-center gap-3 rounded-lg border px-4 py-3',
            completed
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-border bg-muted/30'
        )}
    >
        <div
            className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                completed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-muted text-muted-foreground'
            )}
        >
            {completed ? <CheckCircle2 className="h-4 w-4" /> : step}
        </div>
        <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">
                {completed ? 'Completado o en edición' : 'Pendiente'}
            </p>
        </div>
    </div>
);

const HazardNotificationsSkeleton = () => (
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

function HazardNotificationCard({
    notification,
    selected,
    onSelect,
}: {
    notification: HazardNotification;
    selected: boolean;
    onSelect: () => void;
}) {
    const workflowStatus = getWorkflowStatus(notification);

    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                'w-full rounded-lg border p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent/40',
                selected && 'border-primary bg-primary/5'
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-sm font-semibold">
                        {getNotificationSource(notification)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Recepción: {formatDate(notification.reception_date)}
                    </p>
                </div>

                <Badge className={cn('border', workflowStatus.className)}>
                    {workflowStatus.label}
                </Badge>
            </div>

            <p className="mt-3 line-clamp-3 text-sm">{notification.description}</p>

            <div className="mt-3 flex items-center justify-between gap-2">
                <Badge variant="outline">{notification.report_type}</Badge>
                {selected && (
                    <span className="text-xs font-medium text-primary">
                        Seleccionado
                    </span>
                )}
            </div>
        </button>
    );
}

function FollowUpControlList({
    controls,
}: {
    controls: FollowUpControl[];
}) {
    if (!controls.length) {
        return (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Esta medida aún no tiene controles de seguimiento registrados.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {controls.map((control) => (
                <div key={control.id} className="rounded-lg border bg-background p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Control #{control.id}</Badge>
                        <Badge variant="outline">{formatDate(control.date)}</Badge>
                    </div>
                    <p className="mt-3 text-sm">{control.description}</p>
                </div>
            ))}
        </div>
    );
}

function MitigationMeasureCard({
    measure,
}: {
    measure: MitigationMeasure;
}) {
    return (
        <Card className="border-dashed">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldCheck className="h-4 w-4" />
                    Medida #{measure.id}
                </CardTitle>
                <CardDescription>{measure.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-3 text-sm md:grid-cols-2">
                    <div>
                        <span className="font-medium">Responsable:</span>{' '}
                        {measure.implementation_responsible}
                    </div>
                    <div>
                        <span className="font-medium">Supervisor:</span>{' '}
                        {measure.implementation_supervisor}
                    </div>
                    <div>
                        <span className="font-medium">Fecha estimada:</span>{' '}
                        {formatDate(measure.estimated_date)}
                    </div>
                    <div>
                        <span className="font-medium">Fecha de ejecución:</span>{' '}
                        {measure.execution_date
                            ? formatDate(measure.execution_date)
                            : 'Pendiente'}
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-medium">Agregar control de seguimiento</p>
                        <p className="text-sm text-muted-foreground">
                            Los controles quedan agrupados dentro de la medida
                            correspondiente.
                        </p>
                    </div>

                    <CreateFollowUpControl
                        mitigationMeasureId={measure.id}
                    />
                </div>

                <Separator />

                <div className="space-y-3">
                    <p className="text-sm font-medium">Controles registrados</p>
                    <FollowUpControlList
                        controls={measure.follow_up_controls || []}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

const EvaluationMitigationPage = () => {
    const params = useParams<{ company: string }>();
    const { selectedCompany } = useCompanyStore();
    const companySlug = selectedCompany?.slug || params.company;

    const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(
        null
    );

    const {
        data: notifications,
        isLoading,
        isError,
    } = useGetHazardNotifications(companySlug);

    const sortedNotifications = useMemo(
        () => sortByNewestDate(notifications || []),
        [notifications]
    );

    const selectedNotification =
        sortedNotifications.find(
            (notification) => notification.id === selectedNotificationId
        ) || null;

    const currentMitigationPlan: MitigationPlan | null =
        selectedNotification?.mitigationPlan || null;
    const currentAnalysis: Analysis | null =
        currentMitigationPlan?.analysis || selectedNotification?.analysis || null;
    const currentMeasures = currentMitigationPlan?.mitigation_measure || [];

    const hasPlanAndAnalysis = Boolean(currentMitigationPlan && currentAnalysis);

    return (
        <ContentLayout title="Evaluación y mitigación">
            <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                <Card className="xl:sticky xl:top-6 xl:h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <ShieldAlert className="h-5 w-5" />
                            Selección de notificación
                        </CardTitle>
                        <CardDescription>
                            Seleccione la notificación de peligro sobre la cual se
                            desarrollará el plan, el análisis, las medidas y los
                            controles.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                            El proceso se construye por etapas: primero plan y análisis,
                            luego medidas de mitigación y finalmente controles de
                            seguimiento por cada medida.
                        </div>

                        {isLoading ? (
                            <HazardNotificationsSkeleton />
                        ) : isError ? (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                                No se pudieron cargar las notificaciones de peligro.
                            </div>
                        ) : sortedNotifications.length ? (
                            <div className="max-h-[40rem] space-y-3 overflow-y-auto pr-1">
                                {sortedNotifications.map((notification) => (
                                    <HazardNotificationCard
                                        key={notification.id}
                                        notification={notification}
                                        selected={
                                            selectedNotificationId === notification.id
                                        }
                                        onSelect={() =>
                                            setSelectedNotificationId(notification.id)
                                        }
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                No hay notificaciones de peligro disponibles para
                                evaluar.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <ClipboardCheck className="h-5 w-5" />
                            Flujo de evaluación y mitigación
                        </CardTitle>
                        <CardDescription>
                            {selectedNotification
                                ? `Trabajando sobre ${getNotificationSource(selectedNotification)}`
                                : 'Seleccione una notificación para iniciar o continuar el proceso.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!selectedNotification ? (
                            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center">
                                <FileStack className="mb-4 h-10 w-10 text-muted-foreground" />
                                <h3 className="text-lg font-semibold">
                                    No hay una notificación seleccionada
                                </h3>
                                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                                    Elija una notificación en el panel izquierdo para
                                    comenzar con el plan de mitigación y continuar con las
                                    medidas y controles de seguimiento.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="rounded-lg border bg-muted/30 p-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">
                                            {getNotificationSource(selectedNotification)}
                                        </Badge>
                                        <Badge variant="outline">
                                            {selectedNotification.report_type}
                                        </Badge>
                                        <Badge
                                            className={cn(
                                                'border',
                                                getWorkflowStatus(selectedNotification).className
                                            )}
                                        >
                                            {
                                                getWorkflowStatus(selectedNotification)
                                                    .label
                                            }
                                        </Badge>
                                    </div>

                                    <p className="mt-3 text-sm text-muted-foreground">
                                        {selectedNotification.description}
                                    </p>
                                </div>

                                <div className="grid gap-3 lg:grid-cols-3">
                                    <StepBadge
                                        step={1}
                                        title="Plan y análisis"
                                        completed={hasPlanAndAnalysis}
                                    />
                                    <StepBadge
                                        step={2}
                                        title="Medidas de mitigación"
                                        completed={currentMeasures.length > 0}
                                    />
                                    <StepBadge
                                        step={3}
                                        title="Controles de seguimiento"
                                        completed={currentMeasures.some(
                                            (measure) =>
                                                (measure.follow_up_controls || []).length > 0
                                        )}
                                    />
                                </div>

                                <Card className="border-dashed">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <FileText className="h-5 w-5" />
                                            Paso 1. Plan de mitigación y análisis
                                        </CardTitle>
                                        <CardDescription>
                                            En esta etapa se registra el plan base y la
                                            evaluación del riesgo antes de pasar a las
                                            medidas.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <CreateMitigationPlanAnalysis
                                            key={`plan-${selectedNotification.id}-${currentMitigationPlan?.id || 'new'}-${currentAnalysis?.id || 'new'}`}
                                            hazardNotification={selectedNotification}
                                            mitigationPlan={currentMitigationPlan}
                                            analysis={currentAnalysis}
                                        />
                                    </CardContent>
                                </Card>

                                <Card
                                    className={cn(
                                        'border-dashed',
                                        !hasPlanAndAnalysis && 'opacity-75'
                                    )}
                                >
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <ShieldCheck className="h-5 w-5" />
                                            Paso 2. Medidas de mitigación
                                        </CardTitle>
                                        <CardDescription>
                                            Una vez guardado el plan con su análisis, puede
                                            agregar tantas medidas como sean necesarias.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {!hasPlanAndAnalysis || !currentMitigationPlan ? (
                                            <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                                                Primero debe registrar el plan de
                                                mitigación junto con el análisis para
                                                habilitar las medidas.
                                            </div>
                                        ) : (
                                            <>
                                                <CreateMitigationMeasure
                                                    mitigationPlanId={currentMitigationPlan.id}
                                                />

                                                <Separator />

                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                        <p className="text-sm font-medium">
                                                            Medidas registradas
                                                        </p>
                                                    </div>

                                                    {currentMeasures.length ? (
                                                        <div className="space-y-4">
                                                            {currentMeasures.map((measure) => (
                                                                <MitigationMeasureCard
                                                                    key={measure.id}
                                                                    measure={measure}
                                                                />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                                                            Aún no hay medidas de
                                                            mitigación cargadas para esta
                                                            notificación.
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ContentLayout>
    );
};

export default EvaluationMitigationPage;
