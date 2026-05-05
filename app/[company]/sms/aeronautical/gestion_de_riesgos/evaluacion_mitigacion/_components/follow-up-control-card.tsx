'use client';

import { ChevronDown, ChevronUp, PencilLine } from 'lucide-react';

import CreateFollowUpControl from '@/components/forms/mantenimiento/sms/CreateFollowUpControl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { FollowUpControl } from '@/types/sms/mantenimiento';

import { SummaryField } from './evaluation-workflow-shared';
import { FollowUpControlPreview } from './follow-up-control-preview';

type FollowUpControlCardProps = {
    company: string;
    control: FollowUpControl;
    measureId: number;
    isExpanded: boolean;
    isEditing: boolean;
    onToggleExpand: () => void;
    onToggleEdit: () => void;
    onCloseEdit: () => void;
};

export function FollowUpControlCard({
    company,
    control,
    measureId,
    isExpanded,
    isEditing,
    onToggleExpand,
    onToggleEdit,
    onCloseEdit,
}: FollowUpControlCardProps) {
    return (
        <div className="rounded-lg border bg-background/80 p-4 dark:bg-muted/20">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Control #{control.id}</Badge>
                        <Badge variant="outline">{formatDate(control.date)}</Badge>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{control.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={onToggleExpand}>
                        {isExpanded ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                        {isExpanded ? 'Ver menos' : 'Ver más'}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={onToggleEdit}>
                        <PencilLine className="mr-2 h-4 w-4" />
                        {isEditing ? 'Ocultar formulario' : 'Editar'}
                    </Button>
                </div>
            </div>

            {isExpanded ? (
                <div className="mt-4 space-y-4 border-t pt-4">
                    <div className="grid gap-3 md:grid-cols-2">
                        <SummaryField label="Descripción completa" value={control.description} />
                        <SummaryField label="Fecha" value={formatDate(control.date)} />
                        <SummaryField label="Imagen" value={control.image ? 'Adjunta' : 'No adjunta'} />
                        <SummaryField label="Documento" value={control.document ? 'Adjunto' : 'No adjunto'} />
                    </div>

                    {control.image || control.document ? (
                        <div className="flex flex-wrap gap-2">
                            {control.image ? (
                                <FollowUpControlPreview
                                    company={company}
                                    path={control.image}
                                    title={`Imagen del control #${control.id}`}
                                    description="Revise la evidencia visual del control antes de abrirla o descargarla."
                                    triggerLabel="Abrir imagen"
                                />
                            ) : null}

                            {control.document ? (
                                <FollowUpControlPreview
                                    company={company}
                                    path={control.document}
                                    title={`Documento del control #${control.id}`}
                                    description="Revise el documento adjunto del control antes de abrirlo o descargarlo."
                                    triggerLabel="Abrir documento"
                                />
                            ) : null}
                        </div>
                    ) : null}
                </div>
            ) : null}

            {isEditing ? (
                <div className="mt-4 rounded-lg border bg-muted/20 p-4">
                    <CreateFollowUpControl
                        mitigationMeasureId={measureId}
                        initialData={control}
                        onSuccess={onCloseEdit}
                        onCancel={onCloseEdit}
                    />
                </div>
            ) : null}
        </div>
    );
}
