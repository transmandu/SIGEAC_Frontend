import { ClipboardList } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ReportCard } from './report-card';
import { ReportListSkeleton } from './report-list-skeleton';
import {
    getObligatoryMeta,
    getVoluntaryMeta,
    ReportType,
    ReportWithHazard,
    SelectedReport,
} from './report-helpers';
import { ObligatoryReport, VoluntaryReport } from '@/types/sms/mantenimiento';

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
};

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
}: ReportSelectionPanelProps) {
    return (
        <Card className="xl:sticky xl:top-6 xl:h-fit">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <ClipboardList className="h-5 w-5" />
                    Selección de reporte
                </CardTitle>
                <CardDescription>
                    Elija un reporte voluntario u obligatorio para crear o editar su notificación
                    de peligro.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                    Solo se pueden seleccionar reportes abiertos para crear una notificación, o
                    reportes que ya tengan una identificación asociada para editarla.
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={(value) => onTabChange(value as ReportType)}
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
                        ) : voluntaryReports.length ? (
                            <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
                                {voluntaryReports.map((report) => (
                                    <ReportCard
                                        key={report.id}
                                        report={report}
                                        type="RVP"
                                        selected={
                                            selectedReport?.type === 'RVP' &&
                                            selectedReport.id === report.id
                                        }
                                        meta={getVoluntaryMeta(report)}
                                        onSelect={() => onSelectReport({ id: report.id, type: 'RVP' })}
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
                        ) : obligatoryReports.length ? (
                            <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
                                {obligatoryReports.map((report) => (
                                    <ReportCard
                                        key={report.id}
                                        report={report}
                                        type="ROS"
                                        selected={
                                            selectedReport?.type === 'ROS' &&
                                            selectedReport.id === report.id
                                        }
                                        meta={getObligatoryMeta(report)}
                                        onSelect={() => onSelectReport({ id: report.id, type: 'ROS' })}
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
    );
}
