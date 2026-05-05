import { ShieldAlert } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDate } from '@/lib/utils';
import { HazardNotification } from '@/types/sms/mantenimiento';

import { getNotificationSource, getWorkflowStatus } from './workflow-helpers';

function HazardNotificationsSkeleton() {
    return (
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
}

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
                    <p className="text-sm font-semibold">{getNotificationSource(notification)}</p>
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
                {selected && <span className="text-xs font-medium text-primary">Seleccionado</span>}
            </div>
        </button>
    );
}

type NotificationSelectionPanelProps = {
    notifications: HazardNotification[];
    selectedNotificationId: number | null;
    isLoading: boolean;
    isError: boolean;
    onSelectNotification: (notificationId: number) => void;
    className?: string;
    showSticky?: boolean;
};

export function NotificationSelectionPanel({
    notifications,
    selectedNotificationId,
    isLoading,
    isError,
    onSelectNotification,
    className,
    showSticky = true,
}: NotificationSelectionPanelProps) {
    return (
        <Card className={cn(showSticky && 'xl:sticky xl:top-6 xl:h-fit', className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <ShieldAlert className="h-5 w-5" />
                    Selección de notificación
                </CardTitle>
                <CardDescription>
                    Seleccione la notificación de peligro sobre la cual se desarrollará el plan,
                    el análisis, las medidas y los controles.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                    El proceso se construye por etapas: primero plan y análisis, luego medidas de
                    mitigación y finalmente controles de seguimiento por cada medida.
                </div>

                {isLoading ? (
                    <HazardNotificationsSkeleton />
                ) : isError ? (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                        No se pudieron cargar las notificaciones de peligro.
                    </div>
                ) : notifications.length ? (
                    <div className="max-h-[40rem] space-y-3 overflow-y-auto pr-1">
                        {notifications.map((notification) => (
                            <HazardNotificationCard
                                key={notification.id}
                                notification={notification}
                                selected={selectedNotificationId === notification.id}
                                onSelect={() => onSelectNotification(notification.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                        No hay notificaciones de peligro disponibles para evaluar.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
