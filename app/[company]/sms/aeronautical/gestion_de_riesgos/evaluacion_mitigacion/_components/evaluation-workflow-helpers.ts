'use client';

import { Analysis, HazardNotification, MitigationMeasure, MitigationPlan } from '@/types/sms/mantenimiento';

import { getMeasureControls } from './workflow-helpers';

export type WorkflowTabValue = 'plan' | 'measures' | 'controls' | 'post-analysis';

export type EvaluationWorkflowPanelProps = {
    company: string;
    selectedNotification: HazardNotification;
    currentMitigationPlan: MitigationPlan | null;
    currentPlanAnalysis: Analysis | null;
    currentPostMitigationAnalysis: Analysis | null;
    currentMeasures: MitigationMeasure[];
};

export const getProbabilityLabel = (value?: string | number | null) => {
    const labelMap: Record<string, string> = {
        '1': 'EXTREMADAMENTE IMPROBABLE',
        '2': 'IMPROBABLE',
        '3': 'REMOTO',
        '4': 'OCASIONAL',
        '5': 'FRECUENTE',
    };

    return labelMap[String(value || '')] || (value ? String(value) : null);
};

export const getDefaultWorkflowTab = (
    hasPlanAndAnalysis: boolean,
    measures: MitigationMeasure[],
    hasPostMitigationAnalysis: boolean
): WorkflowTabValue => {
    if (hasPostMitigationAnalysis) {
        return 'post-analysis';
    }

    if (measures.some((measure) => getMeasureControls(measure).length > 0)) {
        return 'controls';
    }

    if (hasPlanAndAnalysis && measures.length > 0) {
        return 'measures';
    }

    return 'plan';
};

export const toggleNumericId = (ids: number[], id: number) =>
    ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];

export const getAttachmentFileName = (path?: string | null, fallback = 'archivo-adjunto') => {
    if (!path) {
        return fallback;
    }

    const parts = path.split('/');
    return parts[parts.length - 1] || fallback;
};

type PreviewKind = 'image' | 'pdf' | 'unsupported';

export const getAttachmentPreviewKind = (path?: string | null): PreviewKind => {
    const extension = path?.split('.').pop()?.toLowerCase();

    if (!extension) {
        return 'unsupported';
    }

    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg'].includes(extension)) {
        return 'image';
    }

    if (extension === 'pdf') {
        return 'pdf';
    }

    return 'unsupported';
};

export const getAttachmentMimeType = (path?: string | null) => {
    const extension = path?.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'png':
            return 'image/png';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'webp':
            return 'image/webp';
        case 'gif':
            return 'image/gif';
        case 'bmp':
            return 'image/bmp';
        case 'svg':
            return 'image/svg+xml';
        case 'pdf':
            return 'application/pdf';
        default:
            return undefined;
    }
};
