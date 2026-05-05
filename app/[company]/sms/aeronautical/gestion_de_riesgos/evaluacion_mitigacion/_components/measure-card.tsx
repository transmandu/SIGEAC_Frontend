'use client';

import { ChevronDown, ChevronUp, PencilLine, ShieldCheck } from 'lucide-react';

import CreateMitigationMeasure from '@/components/forms/mantenimiento/sms/CreateMitigationMeasure';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { MitigationMeasure } from '@/types/sms/mantenimiento';

import { MeasureDetails } from './evaluation-workflow-shared';

type MeasureCardProps = {
    measure: MitigationMeasure;
    index: number;
    controlsCount: number;
    isExpanded: boolean;
    isEditing: boolean;
    mitigationPlanId: number;
    onToggleExpand: () => void;
    onToggleEdit: () => void;
    onCloseEdit: () => void;
};

export function MeasureCard({
    measure,
    index,
    controlsCount,
    isExpanded,
    isEditing,
    mitigationPlanId,
    onToggleExpand,
    onToggleEdit,
    onCloseEdit,
}: MeasureCardProps) {
    return (
        <Card className="border-dashed">
            <CardContent className="space-y-4 pt-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            <p className="text-base font-semibold">Medida #{index + 1}</p>
                            <Badge variant="outline">
                                {controlsCount} control{controlsCount === 1 ? '' : 'es'}
                            </Badge>
                        </div>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{measure.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>Responsable: {measure.implementation_responsible}</span>
                            <span>Fecha: {formatDate(measure.estimated_date)}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={onToggleExpand}>
                            {isExpanded ? (
                                <ChevronUp className="mr-2 h-4 w-4" />
                            ) : (
                                <ChevronDown className="mr-2 h-4 w-4" />
                            )}
                            {isExpanded ? 'Ver menos' : 'Ver más'}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={onToggleEdit}>
                            <PencilLine className="mr-2 h-4 w-4" />
                            {isEditing ? 'Ocultar formulario' : 'Editar'}
                        </Button>
                    </div>
                </div>

                {isExpanded ? <MeasureDetails measure={measure} /> : null}

                {isEditing ? (
                    <div className="rounded-lg border bg-muted/20 p-4">
                        <CreateMitigationMeasure
                            mitigationPlanId={mitigationPlanId}
                            initialData={measure}
                            onSuccess={onCloseEdit}
                            onCancel={onCloseEdit}
                        />
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
