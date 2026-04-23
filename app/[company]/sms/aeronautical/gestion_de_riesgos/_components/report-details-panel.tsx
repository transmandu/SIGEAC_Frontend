import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, FileText, ShieldAlert } from 'lucide-react';

import CreateHazardNotification from '@/components/forms/mantenimiento/sms/CreateHazardNotification';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { cn, formatDate } from '@/lib/utils';
import { getBadgeStatusClass } from '@/lib/sms/utils';

import { DetailGrid } from './detail-grid';
import {
    DetailItem,
    REPORT_LABELS,
    ReportType,
} from './report-helpers';
import { HazardNotification } from '@/types/sms/mantenimiento';

type ReportDetailsPanelProps = {
    currentReport: {
        id: number;
        report_date: string | Date;
        description: string;
        status: string;
    };
    currentReportType: ReportType;
    currentReportCode: string;
    currentNotification: HazardNotification | null;
    reportLocationLabel: string;
    reportDetails: DetailItem[];
    notificationDetails: DetailItem[];
    isReportDetailsOpen: boolean;
    isNotificationDetailsOpen: boolean;
    isFormOpen: boolean;
    onToggleReportDetails: () => void;
    onToggleNotificationDetails: () => void;
    onToggleForm: () => void;
    onReportDetailsOpenChange: (open: boolean) => void;
    onNotificationDetailsOpenChange: (open: boolean) => void;
    onFormOpenChange: (open: boolean) => void;
    onCloseForm: () => void;
    formMode: 'create' | 'edit';
};

export function ReportDetailsPanel({
    currentReport,
    currentReportType,
    currentReportCode,
    currentNotification,
    reportLocationLabel,
    reportDetails,
    notificationDetails,
    isReportDetailsOpen,
    isNotificationDetailsOpen,
    isFormOpen,
    onToggleReportDetails,
    onToggleNotificationDetails,
    onToggleForm,
    onReportDetailsOpenChange,
    onNotificationDetailsOpenChange,
    onFormOpenChange,
    onCloseForm,
    formMode,
}: ReportDetailsPanelProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    {currentNotification ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                    )}
                    Detalle del reporte y Notificacion de peligro
                </CardTitle>
                <CardDescription>
                    <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{REPORT_LABELS[currentReportType]}</span>
                        <span>-</span>
                        <span>{currentReportCode}</span>
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{REPORT_LABELS[currentReportType]}</Badge>
                            <Badge
                                className={cn(
                                    'border',
                                    currentNotification
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : 'border-blue-200 bg-blue-50 text-blue-700'
                                )}
                            >
                                {currentNotification ? 'Modo edición' : 'Nueva identificación'}
                            </Badge>
                            <Badge variant="outline">{currentReport.status}</Badge>
                        </div>

                        <p className="mt-3 text-sm font-medium">{currentReportCode}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{currentReport.description}</p>
                        <Separator className="my-4" />
                        <div className="grid gap-3 text-sm md:grid-cols-2">
                            <div>
                                <span className="font-medium">Fecha del reporte:</span>{' '}
                                {formatDate(currentReport.report_date)}
                            </div>

                            <div>
                                <Badge className={getBadgeStatusClass(currentReport.status)}>
                                    {currentReport.status}
                                </Badge>
                            </div>
                            <div>
                                <span className="font-medium">Ubicacion:</span>{' '}
                                {reportLocationLabel || 'Sin ubicacion asociada'}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button type="button" variant="outline" onClick={onToggleReportDetails}>
                            {isReportDetailsOpen ? 'Ocultar detalle del reporte' : 'Ver detalle del reporte'}
                            {isReportDetailsOpen ? (
                                <ChevronUp className="ml-2 h-4 w-4" />
                            ) : (
                                <ChevronDown className="ml-2 h-4 w-4" />
                            )}
                        </Button>

                        {currentNotification && (
                            <Button type="button" variant="outline" onClick={onToggleNotificationDetails}>
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

                        <Button type="button" onClick={onToggleForm}>
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
                        onOpenChange={onReportDetailsOpenChange}
                        className="rounded-lg border"
                    >
                        <div className="flex items-center gap-3 px-4 py-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Informacion detallada del reporte</p>
                                <p className="text-xs text-muted-foreground">
                                    Revise todos los campos relevantes del reporte seleccionado.
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
                            onOpenChange={onNotificationDetailsOpenChange}
                            className="rounded-lg border"
                        >
                            <div className="flex items-center gap-3 px-4 py-3">
                                <ShieldAlert className="h-4 w-4 text-emerald-600" />
                                <div>
                                    <p className="text-sm font-medium">Notificación de Peligro</p>
                                    <p className="text-xs text-muted-foreground">
                                        Este reporte ya cuenta con una notificación registrada.
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
                        onOpenChange={onFormOpenChange}
                        className="rounded-lg border"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                            <div>
                                <p className="text-sm font-medium">
                                    {currentNotification ? 'Formulario de edicion' : 'Formulario de creacion'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Abra este apartado solo cuando necesite registrar o actualizar la
                                    Notificacion de peligro.
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
                                    key={`${currentReportType}-${currentReport.id}-${formMode}`}
                                    id={currentReport.id}
                                    reportType={currentReportType}
                                    initialData={currentNotification || undefined}
                                    isEditing={Boolean(currentNotification)}
                                    onClose={onCloseForm}
                                />
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </CardContent>
        </Card>
    );
}
